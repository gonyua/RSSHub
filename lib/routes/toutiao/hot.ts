import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/hot',
    categories: ['new-media'],
    example: '/toutiao/hot',
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
            source: ['www.toutiao.com/hot-event/hot-board'],
            target: '/hot',
        },
    ],
    name: '热榜',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const response = await ofetch('https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc', {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const list = response?.data ?? [];

    return {
        title: '今日头条热榜',
        link: 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc',
        item: list.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 50).map((item) => {
            const imageUrl = item.Image?.url_list?.[0]?.url ?? item.Image?.url;
            const descriptionParts = [];
            imageUrl && descriptionParts.push(`<img src="${imageUrl}">`);
            item.HotValue && descriptionParts.push(`<p>热度：${item.HotValue}</p>`);
            return {
                title: item.Title,
                link: item.Url,
                description: descriptionParts.join(''),
                category: item.Label ? [item.Label] : undefined,
            };
        }),
    };
}
