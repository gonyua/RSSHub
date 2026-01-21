import type { Route } from '@/types';

import { handler as hotHandler } from './hot';

export const route: Route = {
    path: '/news/hot-ranking',
    categories: ['new-media'],
    example: '/tencent/news/hot-ranking',
    parameters: {},
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
            source: ['news.qq.com', 'www.qq.com'],
            target: '/news/hot-ranking',
        },
    ],
    name: '热榜（热度排序）',
    maintainers: ['LogicJake', 'miles170'],
    handler: hotHandler,
    url: 'news.qq.com',
};
