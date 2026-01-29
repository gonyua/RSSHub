import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const periodMap = {
    day: 'DAY',
    three: 'THREE_DAYS',
    week: 'WEEK',
} as const;

export const route: Route = {
    path: '/rank/:range?',
    radar: [
        {
            source: ['www.acfun.cn/rank/list'],
            target: '/rank',
        },
    ],
    name: '榜单',
    parameters: {
        range: {
            description: '时间范围',
            default: 'day',
            options: [
                { label: '今日', value: 'day' },
                { label: '三日', value: 'three' },
                { label: '本周', value: 'week' },
            ],
        },
    },
    categories: ['anime'],
    example: '/acfun/rank/day',
    view: ViewType.Videos,
    maintainers: ['wdssmq'],
    handler,
};

async function handler(ctx) {
    const range = ctx.req.param('range') ?? 'day';
    const rankPeriod = periodMap[range] ?? periodMap.day;

    const response = await got.post('https://www.acfun.cn/rest/pc-direct/rank/channel', {
        headers: {
            Referer: 'https://www.acfun.cn/rank/list',
            'User-Agent': config.trueUA,
        },
        form: {
            rankPeriod,
            channelId: 0,
            rankLimit: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 30,
        },
    });

    const list = response.data?.rankList ?? [];

    return {
        title: `AcFun 榜单 - ${range === 'day' ? '今日' : range === 'three' ? '三日' : '本周'}`,
        link: 'https://www.acfun.cn/rank/list',
        item: list.map((item) => {
            const coverUrl = item.coverUrl ?? item.videoCover;
            const descriptionParts = [];
            coverUrl && descriptionParts.push(`<img src="${coverUrl}">`);
            item.description && descriptionParts.push(`<p>${item.description}</p>`);

            return {
                title: item.title,
                link: `https://www.acfun.cn/v/ac${item.dougaId}`,
                description: descriptionParts.join(''),
                author: item.userName,
                pubDate: item.createTimeMillis ? parseDate(item.createTimeMillis) : undefined,
                category: item.tagList?.map((t) => t.name).filter(Boolean),
            };
        }),
    };
}
