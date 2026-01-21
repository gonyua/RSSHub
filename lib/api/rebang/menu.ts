import type { Context } from 'hono';

import { getRebangMenuForUi } from '@/rebang/menu';

export function handler(ctx: Context) {
    const menu = getRebangMenuForUi();

    return ctx.json(
        {
            ...menu,
            generatedAt: new Date().toISOString(),
        },
        200
    );
}
