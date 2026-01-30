import type { Context } from 'hono';

import { clampLimit, fetchJsonFeed, toUiItems } from '@/rebang/utils';
import { namespaces } from '@/registry';

const isValidRsshubPath = (value: string): boolean => {
    if (!value.startsWith('/')) {
        return false;
    }
    if (value.startsWith('//')) {
        return false;
    }
    if (value.includes('://')) {
        return false;
    }
    if (value.startsWith('/api/')) {
        return false;
    }
    return true;
};

export async function handler(ctx: Context) {
    const origin = new URL(ctx.req.url).origin;
    const rsshubPath = ctx.req.query('path');
    if (!rsshubPath || !isValidRsshubPath(rsshubPath)) {
        return ctx.json({ message: 'Invalid path' }, 400);
    }

    const limit = clampLimit(ctx.req.query('limit'));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
        const feed = await fetchJsonFeed(origin, rsshubPath, limit, controller.signal);
        const namespaceKey = rsshubPath.split('/')[1] || 'custom';
        const sourceName = namespaces[namespaceKey]?.name ?? namespaceKey;
        const items = toUiItems(feed, { key: namespaceKey, name: sourceName }, limit, origin);

        return ctx.json(
            {
                category: 'following',
                tab: namespaceKey,
                title: feed.title || sourceName,
                link: feed.home_page_url,
                items,
            },
            200
        );
    } catch (error_) {
        const error = error_ instanceof Error ? error_ : new Error(String(error_));
        return ctx.json({ message: error.message }, 502);
    } finally {
        clearTimeout(timer);
    }
}
