import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/appinn',
    radar: [
        {
            source: ['www.appinn.com'],
            target: '/appinn',
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
    const rootUrl = 'https://www.appinn.com';
    const response = await got(`${rootUrl}/feed/`, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const $ = load(response.data, { xmlMode: true });
    const feedTitle = $('channel > title').first().text().trim() || '小众软件';
    const items = $('channel item')
        .toArray()
        .map((element) => {
            const item = $(element);
            const title = item.find('title').first().text().trim();
            const link = item.find('link').first().text().trim();
            const pubDateText = item.find('pubDate').first().text().trim();
            const description =
                item
                    .find(String.raw`content\:encoded`)
                    .first()
                    .text() || item.find('description').first().text();
            const author = item
                .find(String.raw`dc\:creator`)
                .first()
                .text()
                .trim();
            const category = item
                .find('category')
                .toArray()
                .map((c) => $(c).text().trim())
                .filter(Boolean);

            const result: DataItem = {
                title,
                link,
                description,
                pubDate: pubDateText ? parseDate(pubDateText) : undefined,
                author: author || undefined,
                category,
            };

            return result;
        })
        .filter((item) => item.title && item.link);

    return {
        title: feedTitle,
        link: rootUrl,
        item: items,
    };
}
