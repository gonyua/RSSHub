import type { DataItem, Route } from '@/types';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/shadiao',
    radar: [
        {
            source: ['shadiao.plus'],
            target: '/shadiao',
        },
    ],
    name: '订阅',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(): Promise<{
    title: string;
    link: string;
    item: DataItem[];
}> {
    const feed = await parser.parseURL('https://shadiao.plus/rss');

    return {
        title: feed.title || '沙雕新闻',
        link: 'https://shadiao.plus',
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
