import iconv from 'iconv-lite';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rangeMap = {
    today: { name: '今日', ms: 24 * 60 * 60 * 1000 },
    thisweek: { name: '本周', ms: 7 * 24 * 60 * 60 * 1000 },
    thismonth: { name: '本月', ms: 30 * 24 * 60 * 60 * 1000 },
} as const;

const toDataItem = (item): DataItem => ({
    title: item.title || '',
    link: item.link,
    description: item.content,
    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
    author: item['dc:creator'],
    category: item.categories,
});

export const route: Route = {
    path: '/hot/:range?',
    categories: ['bbs'],
    example: '/52pojie/hot/today',
    parameters: {
        range: {
            description: '时间范围',
            default: 'today',
            options: [
                { label: '今日', value: 'today' },
                { label: '本周', value: 'thisweek' },
                { label: '本月', value: 'thismonth' },
            ],
        },
    },
    radar: [
        {
            source: ['www.52pojie.cn/forum.php?mod=guide&view=hot'],
            target: '/hot',
        },
    ],
    name: '热门',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx): Promise<{
    title: string;
    link: string;
    item: DataItem[];
}> {
    const range = ctx.req.param('range') ?? 'today';
    const currentRange = rangeMap[range] ?? rangeMap.today;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 50;

    const rssUrl = 'https://www.52pojie.cn/forum.php?mod=guide&view=hot&rss=1';
    const link = 'https://www.52pojie.cn/forum.php?mod=guide&view=hot';

    const response = await got(rssUrl, {
        responseType: 'buffer',
        headers: {
            Referer: link,
        },
    });
    const xml = iconv.decode(response.data, 'gbk');
    const feed = await parser.parseString(xml);

    const now = Date.now();
    const items = feed.items
        .map((item) => toDataItem(item))
        .filter((item) => item.link)
        .filter((item) => (item.pubDate ? now - item.pubDate.valueOf() <= currentRange.ms : true));

    const resultItems = (items.length ? items : feed.items.map((item) => toDataItem(item)).filter((item) => item.link)).slice(0, limit);

    return {
        title: `吾爱破解 - 最新热门（${currentRange.name}）`,
        link,
        item: resultItems,
    };
}
