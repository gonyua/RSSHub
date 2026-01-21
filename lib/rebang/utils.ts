import { decodeHTML } from 'entities';

import type { RebangAggregateSource, RebangCategory, RebangMenu, RebangTab } from '@/rebang/config';
import { rebangMenu } from '@/rebang/config';

type JsonFeedItem = {
    id: string;
    url?: string;
    title?: string;
    content_html?: string;
    content_text?: string;
    summary?: string;
    image?: string;
    date_published?: string;
};

type JsonFeed = {
    title?: string;
    home_page_url?: string;
    items?: JsonFeedItem[];
};

export type RebangUiItem = {
    rank: number;
    title: string;
    link: string;
    summary?: string;
    image?: string;
    datePublished?: string;
    source: {
        key: string;
        name: string;
    };
};

export type RebangUiResponse = {
    category: string;
    tab: string;
    sub?: string;
    title: string;
    link?: string;
    items: RebangUiItem[];
    errors?: Array<{
        sourceKey: string;
        message: string;
    }>;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export const clampLimit = (limitRaw: string | undefined) => {
    const n = Number.parseInt(limitRaw ?? '', 10);
    if (!Number.isFinite(n)) {
        return DEFAULT_LIMIT;
    }
    return Math.min(Math.max(n, 1), MAX_LIMIT);
};

export const getRebangMenu = (): RebangMenu => rebangMenu;

export const findCategory = (categoryKey: string): RebangCategory | undefined => rebangMenu.categories.find((c) => c.key === categoryKey);

export const findTab = (category: RebangCategory, tabKey: string): RebangTab | undefined => category.tabs.find((t) => t.key === tabKey);

export const resolveTabAndSub = (categoryKey: string | undefined, tabKey: string | undefined, subKey: string | undefined) => {
    const category = findCategory(categoryKey ?? 'home') ?? findCategory('home');
    if (!category) {
        return null;
    }

    const tab = findTab(category, tabKey ?? category.defaultTabKey) ?? category.tabs[0];
    if (!tab) {
        return null;
    }

    const resolvedSubKey = tab.subTabs?.length ? (subKey ?? tab.defaultSubTabKey ?? tab.subTabs[0]?.key) : undefined;

    return {
        category,
        tab,
        subKey: resolvedSubKey,
    };
};

export const buildSelfUrl = (origin: string, rsshubPath: string, query: Record<string, string>) => {
    const url = new URL(rsshubPath, origin);
    for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
    }
    return url;
};

export async function fetchJsonFeed(origin: string, rsshubPath: string, limit: number, signal?: AbortSignal): Promise<JsonFeed> {
    const url = buildSelfUrl(origin, rsshubPath, { format: 'json', limit: String(limit) });
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            accept: 'application/feed+json, application/json;q=0.9, */*;q=0.8',
        },
        signal,
    });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}${text ? ` - ${text.slice(0, 200)}` : ''}`);
    }
    return JSON.parse(text) as JsonFeed;
}

export const extractFirstImageUrl = (html: string | undefined) => {
    if (!html) {
        return;
    }
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m?.[1];
};

export const htmlToText = (html: string | undefined) => {
    if (!html) {
        return '';
    }

    const stripped = html
        .replaceAll(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replaceAll(/<[^>]+>/g, ' ')
        .replaceAll(/\s+/g, ' ')
        .trim();

    return decodeHTML(stripped);
};

export const summarize = (text: string, maxLen: number) => {
    if (text.length <= maxLen) {
        return text;
    }
    return text.slice(0, maxLen) + '...';
};

export const toUiItems = (feed: JsonFeed, source: { key: string; name: string }, limit: number): RebangUiItem[] => {
    const items = feed.items ?? [];
    return items
        .filter((item) => item.title && (item.url || item.id))
        .slice(0, limit)
        .map((item, idx) => {
            const link = item.url ?? item.id;
            const text = htmlToText(item.summary || item.content_text || item.content_html);
            const summary = text ? summarize(text, 120) : undefined;
            const image = item.image || extractFirstImageUrl(item.content_html) || extractFirstImageUrl(item.summary);

            return {
                rank: idx + 1,
                title: item.title || '',
                link,
                summary,
                image,
                datePublished: item.date_published,
                source,
            };
        });
};

const xorshift32 = (seed: number = 88_675_123) => {
    let x = seed;
    return () => {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        return (x >>> 0) / 0xff_ff_ff_ff;
    };
};

export const shuffleInPlace = <T>(arr: T[], seed: number) => {
    const rand = xorshift32(seed);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
    }
    return arr;
};

export const aggregateToUiItems = async (origin: string, sources: RebangAggregateSource[], limit: number, seed: number, signal?: AbortSignal) => {
    const perSource = Math.max(3, Math.ceil(limit / sources.length));
    const results = await Promise.allSettled(
        sources.map(async (s) => {
            const feed = await fetchJsonFeed(origin, s.rsshubPath, perSource, signal);
            return { source: s, feed };
        })
    );

    const errors: Array<{ sourceKey: string; message: string }> = [];
    const merged: RebangUiItem[] = [];

    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        const source = sources[i];
        if (r.status === 'fulfilled') {
            merged.push(...toUiItems(r.value.feed, { key: r.value.source.key, name: r.value.source.name }, perSource));
        } else {
            errors.push({ sourceKey: source?.key ?? 'unknown', message: r.reason instanceof Error ? r.reason.message : String(r.reason) });
        }
    }

    shuffleInPlace(merged, seed);
    const sliced = merged.slice(0, limit).map((item, idx) => ({ ...item, rank: idx + 1 }));
    return { items: sliced, errors: errors.length ? errors : undefined };
};
