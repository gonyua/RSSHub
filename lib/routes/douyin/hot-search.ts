import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hot-search',
    categories: ['social-media'],
    example: '/douyin/hot-search',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.douyin.com/hot'],
            target: '/hot-search',
        },
    ],
    name: '热搜榜',
    maintainers: ['Max-Tortoise', 'Rongronggg9'],
    handler,
};

async function handler(ctx) {
    const data = await ofetch('https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/', {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const activeTime = data?.extra?.now ? parseDate(data.extra.now) : undefined;
    const list = data?.word_list ?? [];

    return {
        title: '抖音热搜榜',
        link: 'https://www.douyin.com/hot',
        item: list.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 50).map((item) => ({
            title: item.word,
            link: `https://www.douyin.com/search/${encodeURIComponent(item.word)}?type=general`,
            description: item.hot_value ? `<p>热度：${item.hot_value}</p>` : '',
            pubDate: activeTime,
        })),
    };
}
