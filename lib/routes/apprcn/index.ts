import type { DataItem, Route } from '@/types';
import parser from '@/utils/rss-parser';

const categoryMap = {
    all: { name: '全部', feedUrl: 'https://www.apprcn.com/feed/', link: 'https://www.apprcn.com' },
    ios: { name: 'iOS', feedUrl: 'https://www.apprcn.com/category/ios/feed/', link: 'https://www.apprcn.com/category/ios/' },
    android: { name: '安卓', feedUrl: 'https://www.apprcn.com/category/android/feed/', link: 'https://www.apprcn.com/category/android/' },
    game: { name: '游戏', feedUrl: 'https://www.apprcn.com/category/game/feed/', link: 'https://www.apprcn.com/category/game/' },
    mac: { name: 'Mac', feedUrl: 'https://www.apprcn.com/category/mac/feed/', link: 'https://www.apprcn.com/category/mac/' },
    windows: { name: 'Windows', feedUrl: 'https://www.apprcn.com/category/windows/feed/', link: 'https://www.apprcn.com/category/windows/' },
} as const;

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/apprcn/all',
    parameters: {
        category: {
            description: '分类',
            default: 'all',
            options: [
                { label: '全部', value: 'all' },
                { label: 'iOS', value: 'ios' },
                { label: '安卓', value: 'android' },
                { label: '游戏', value: 'game' },
                { label: 'Mac', value: 'mac' },
                { label: 'Windows', value: 'windows' },
            ],
        },
    },
    radar: [
        {
            source: ['www.apprcn.com'],
            target: '/apprcn',
        },
    ],
    name: '订阅',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx): Promise<{
    title: string;
    link: string;
    item: DataItem[];
}> {
    const category = ctx.req.param('category') ?? 'all';
    const current = categoryMap[category] ?? categoryMap.all;

    const feed = await parser.parseURL(current.feedUrl);

    return {
        title: `反斗限免 - ${current.name}`,
        link: current.link,
        item: feed.items.map((item) => ({
            title: item.title || '',
            link: item.link,
            description: item.content,
            pubDate: item.pubDate,
            author: item['dc:creator'],
            category: item.categories,
        })),
    };
}
