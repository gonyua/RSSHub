import type { Context } from 'hono';

import { aggregateToUiItems, clampLimit, getRebangMenu } from '@/rebang/utils';

const defaultSources = () => {
    const menu = getRebangMenu();
    const home = menu.categories.find((c) => c.key === 'home');
    const top = home?.tabs.find((t) => t.key === 'top' && t.type === 'aggregate');
    return top?.aggregateSources ?? [];
};

export async function handler(ctx: Context) {
    const origin = new URL(ctx.req.url).origin;
    const seed = Number.parseInt(ctx.req.query('seed') ?? '1', 10) || 1;
    const limit = Math.min(clampLimit(ctx.req.query('limit')), 10);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
        const sources = defaultSources();
        const agg = await aggregateToUiItems(origin, sources, limit, seed, controller.signal);
        return ctx.json(
            {
                title: '全站飙升榜',
                items: agg.items,
                errors: agg.errors,
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
