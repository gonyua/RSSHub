import type { Context } from 'hono';

import { journalTechBloggerSources } from '@/rebang/journal-tech-sources';
import { aggregateToUiItems, clampLimit, fetchJsonFeed, resolveTabAndSub, toUiItems } from '@/rebang/utils';

const seedBySub = (subKey: string | undefined) => {
    if (!subKey) {
        return 1;
    }
    let seed = 0;
    for (const ch of subKey) {
        seed = (seed * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
    }
    return seed || 1;
};

const aggregateSeed = (subKey: string | undefined) => {
    const now = new Date();
    if (subKey === 'today') {
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        const d = now.getDate();
        return y * 10000 + m * 100 + d;
    }
    if (subKey === 'weekly') {
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
        return d.getUTCFullYear() * 100 + weekNo;
    }
    if (subKey === 'monthly') {
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        return y * 100 + m;
    }
    return seedBySub(subKey);
};

export async function handler(ctx: Context) {
    const origin = new URL(ctx.req.url).origin;

    const categoryKey = ctx.req.query('category') ?? 'home';
    const tabKey = ctx.req.query('tab') ?? undefined;
    const subKey = ctx.req.query('sub') ?? undefined;
    const limit = clampLimit(ctx.req.query('limit'));

    const resolved = resolveTabAndSub(categoryKey, tabKey, subKey);
    if (!resolved) {
        return ctx.json({ message: 'Bad category/tab' }, 400);
    }

    const { category, tab, subKey: resolvedSubKey } = resolved;

    if (tab.disabled) {
        return ctx.json({ message: tab.disabledReason ?? '该节点未启用' }, 422);
    }

    const controller = new AbortController();
    const timeoutMs = tab.key === 'journal-tech' ? 60000 : 15000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        if (tab.type === 'aggregate') {
            const sources = tab.aggregateSources ?? [];
            if (!sources.length) {
                return ctx.json(
                    {
                        category: category.key,
                        tab: tab.key,
                        sub: resolvedSubKey,
                        title: tab.name,
                        items: [],
                    },
                    200
                );
            }

            const seed = aggregateSeed(resolvedSubKey);
            const agg = await aggregateToUiItems(origin, sources, limit, seed, controller.signal);
            return ctx.json(
                {
                    category: category.key,
                    tab: tab.key,
                    sub: resolvedSubKey,
                    title: tab.name,
                    items: agg.items,
                    errors: agg.errors,
                },
                200
            );
        }

        const matchedSub = tab.subTabs?.length ? tab.subTabs.find((s) => s.key === resolvedSubKey) : undefined;
        if (matchedSub?.disabled) {
            return ctx.json({ message: matchedSub.disabledReason ?? '该子分类未启用' }, 422);
        }

        const rsshubPath = tab.subTabs?.length ? matchedSub?.rsshubPath : tab.rsshubPath;
        if (!rsshubPath) {
            return ctx.json({ message: '该节点暂无可用数据源映射' }, 422);
        }

        const feed = await fetchJsonFeed(origin, rsshubPath, limit, controller.signal);
        const items = toUiItems(feed, { key: tab.key, name: tab.name }, limit, origin);
        const sources = tab.key === 'journal-tech' ? journalTechBloggerSources : undefined;

        return ctx.json(
            {
                category: category.key,
                tab: tab.key,
                sub: resolvedSubKey ?? undefined,
                title: feed.title || tab.name,
                link: feed.home_page_url,
                items,
                sources,
            },
            200
        );
    } catch (error_) {
        const error = error_ instanceof Error ? error_ : new Error(String(error_));
        const message = error.message;
        return ctx.json({ message }, 502);
    } finally {
        clearTimeout(timer);
    }
}
