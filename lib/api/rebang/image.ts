import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

import type { Context } from 'hono';

import { config } from '@/config';

const isPrivateIpv4 = (ip: string): boolean => {
    const parts = ip.split('.').map((p) => Number.parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => !Number.isFinite(p) || p < 0 || p > 255)) {
        return false;
    }
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) {
        return true;
    }
    if (a === 100 && b >= 64 && b <= 127) {
        return true;
    }
    if (a === 169 && b === 254) {
        return true;
    }
    if (a === 172 && b >= 16 && b <= 31) {
        return true;
    }
    if (a === 192 && b === 168) {
        return true;
    }
    return false;
};

const isPrivateIpv6 = (ip: string): boolean => {
    const normalized = ip.toLowerCase();
    if (normalized === '::1' || normalized === '::') {
        return true;
    }
    if (normalized.startsWith('fe80:')) {
        return true;
    }
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
        return true;
    }
    if (normalized.startsWith('::ffff:')) {
        const v4 = normalized.slice('::ffff:'.length);
        if (isIP(v4) === 4) {
            return isPrivateIpv4(v4);
        }
    }
    return false;
};

const isForbiddenHostname = (hostnameRaw: string): boolean => {
    const hostname = hostnameRaw.toLowerCase();
    if (!hostname) {
        return true;
    }
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
        return true;
    }
    return false;
};

const isForbiddenAddress = (address: string): boolean => {
    const family = isIP(address);
    if (family === 4) {
        return isPrivateIpv4(address);
    }
    if (family === 6) {
        return isPrivateIpv6(address);
    }
    return false;
};

const validateAndResolveTarget = async (rawUrl: string) => {
    if (rawUrl.length > 2048) {
        throw new Error('url too long');
    }
    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch {
        throw new Error('invalid url');
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('unsupported protocol');
    }
    if (isForbiddenHostname(url.hostname)) {
        throw new Error('forbidden hostname');
    }
    if (isForbiddenAddress(url.hostname)) {
        throw new Error('forbidden address');
    }
    if (isIP(url.hostname) === 0) {
        const results = await lookup(url.hostname, { all: true, verbatim: true });
        if (!results.length) {
            throw new Error('dns lookup failed');
        }
        if (results.some((r) => isForbiddenAddress(r.address))) {
            throw new Error('forbidden address');
        }
    }
    return url;
};

const getRefererFromLink = (linkRaw: string | undefined): string | undefined => {
    if (!linkRaw) {
        return;
    }
    try {
        const origin = new URL(linkRaw).origin;
        return `${origin}/`;
    } catch {
        return;
    }
};

export async function handler(ctx: Context): Promise<Response> {
    const urlRaw = ctx.req.query('url');
    if (!urlRaw) {
        return ctx.text('Missing required query: url', 400);
    }

    let targetUrl: URL;
    try {
        targetUrl = await validateAndResolveTarget(urlRaw);
    } catch (error_) {
        const message = error_ instanceof Error ? error_.message : String(error_);
        return ctx.text(`Invalid url: ${message}`, 400);
    }

    const referer = getRefererFromLink(ctx.req.query('link') ?? undefined);
    const commonHeaders: Record<string, string> = {
        'User-Agent': config.trueUA,
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    };

    const fetchWithHeaders = (headers: Record<string, string>) =>
        fetch(targetUrl.toString(), {
            method: 'GET',
            headers,
            redirect: 'follow',
        });

    let upstream = await fetchWithHeaders(referer ? { ...commonHeaders, Referer: referer } : commonHeaders);
    if (!upstream.ok && referer) {
        upstream = await fetchWithHeaders(commonHeaders);
    }

    if (!upstream.ok) {
        return ctx.text(`Image fetch failed: ${upstream.status} ${upstream.statusText}`, 502);
    }

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().startsWith('image/')) {
        return ctx.text('Image fetch failed: upstream did not return an image', 502);
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=86400');
    const etag = upstream.headers.get('etag');
    if (etag) {
        headers.set('ETag', etag);
    }
    const lastModified = upstream.headers.get('last-modified');
    if (lastModified) {
        headers.set('Last-Modified', lastModified);
    }

    return new Response(upstream.body, { status: 200, headers });
}
