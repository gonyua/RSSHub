import type { Handler } from 'hono';

import RebangView from '@/views/rebang';

const titleByPath = (pathname: string) => {
    const map: Record<string, string> = {
        '/rebang': '今日热榜 - 全站热榜',
        '/rebang/tech': '今日热榜 - 科技',
        '/rebang/ent': '今日热榜 - 娱乐',
        '/rebang/community': '今日热榜 - 社区',
        '/rebang/fin': '今日热榜 - 财经',
        '/rebang/dev': '今日热榜 - 开发',
        '/rebang/setting': '今日热榜 - 设置',
        '/rebang/following': '今日热榜 - 订阅',
    };
    return map[pathname] ?? '今日热榜';
};

const handler: Handler = (ctx) => {
    ctx.header('Cache-Control', 'no-cache');
    const url = new URL(ctx.req.url);
    return ctx.html(<RebangView path={url.pathname} title={titleByPath(url.pathname)} />);
};

export default handler;
