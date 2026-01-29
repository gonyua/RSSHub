import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const typeMap = {
    hot: '热榜',
    day: '日榜',
    week: '周榜',
    learning: '学习榜',
    total: '总榜',
    content: '内容榜',
} as const;

export const route: Route = {
    path: '/rank/:type?',
    categories: ['blog'],
    example: '/csdn/rank/hot',
    parameters: {
        type: {
            description: '榜单类型',
            default: 'hot',
            options: [
                { label: '热榜', value: 'hot' },
                { label: '日榜', value: 'day' },
                { label: '周榜', value: 'week' },
                { label: '学习榜', value: 'learning' },
                { label: '总榜', value: 'total' },
                { label: '内容榜', value: 'content' },
            ],
        },
    },
    features: {
        antiCrawler: false,
    },
    radar: [
        {
            source: ['blog.csdn.net/rank/list'],
            target: '/rank',
        },
    ],
    name: '热榜',
    maintainers: ['Jkker'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'hot';
    const size = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 25;

    const { data } = await got('https://blog.csdn.net/phoenix/web/blog/running-rank', {
        headers: {
            Referer: 'https://blog.csdn.net/rank/list',
            'User-Agent': config.trueUA,
        },
        searchParams: {
            page: 1,
            size,
            type,
        },
    });

    const list = data?.data?.list ?? [];

    const items = await Promise.all(
        list
            .map((item) => ({ title: item.title, link: item.url, summary: item.summary, cover: item.picList?.[0], author: item.nickname }))
            .filter((item) => item.title && item.link)
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = await got(item.link, {
                        headers: {
                            Referer: 'https://blog.csdn.net/rank/list',
                            'User-Agent': config.trueUA,
                        },
                    });
                    const $ = load(detailResponse.data);

                    const description = $('#content_views').html() || '';
                    const timeText = $('span.time').first().text();
                    const timeMatch = timeText.match(/(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})/);

                    const categories = $('.tags-box a')
                        .toArray()
                        .map((tag) => $(tag).text().trim())
                        .filter(Boolean);

                    const result: DataItem = {
                        title: item.title,
                        link: item.link,
                        description: description || item.summary || (item.cover ? `<img src="${item.cover}">` : ''),
                        author: item.author,
                        pubDate: timeMatch ? timezone(parseDate(timeMatch[1]), +8) : undefined,
                        category: categories,
                    };

                    return result;
                })
            )
    );

    return {
        title: `CSDN - ${typeMap[type] ?? '热榜'}`,
        link: 'https://blog.csdn.net/rank/list',
        item: items,
    };
}
