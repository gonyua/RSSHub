import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

type HotType = 'stockbar' | 'caifuhao' | 'blog';

const homeUrl = 'https://www.eastmoney.com/';

const typeNameMap: Record<HotType, string> = {
    stockbar: '热门个股吧',
    caifuhao: '热门财富号',
    blog: '热门博客',
};

function toAbsoluteUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    if (url.startsWith('//')) {
        return `https:${url}`;
    }
    if (url.startsWith('/')) {
        return `https://www.eastmoney.com${url}`;
    }
    return url;
}

function pickHotBlock(html: string, type: HotType): { link?: string; items: DataItem[] } {
    const $ = load(html);
    const expectedTitle = typeNameMap[type];

    const blocks = $('.hot_guba')
        .toArray()
        .map((el) => {
            const root = $(el);
            const title = root.find('.box_t1 .t a').first().text().trim();
            const link = root.find('.box_t1 .t a').first().attr('href')?.trim();
            const labels = root
                .find('.b a.lables')
                .toArray()
                .map((a, idx) => {
                    const node = $(a);
                    const name = node.text().trim();
                    const href = node.attr('href')?.trim() ?? '';
                    return {
                        title: `${idx + 1}. ${name}`,
                        link: toAbsoluteUrl(href),
                        description: name || undefined,
                    } satisfies DataItem;
                })
                .filter((i) => i.link);

            return { title, link, labels };
        });

    const matched = blocks.find((b) => b.title === expectedTitle);
    if (!matched) {
        return { items: [] };
    }

    return {
        link: matched.link ? toAbsoluteUrl(matched.link) : undefined,
        items: matched.labels,
    };
}

export const route: Route = {
    path: '/hot/:type?',
    categories: ['finance'],
    example: '/eastmoney/hot/stockbar',
    parameters: {
        type: {
            description: '榜单类型',
            default: 'stockbar',
            options: [
                { label: '热门个股吧', value: 'stockbar' },
                { label: '热门财富号', value: 'caifuhao' },
                { label: '热门博客', value: 'blog' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['www.eastmoney.com'], target: '/hot/stockbar' },
        { source: ['www.eastmoney.com'], target: '/hot/caifuhao' },
        { source: ['www.eastmoney.com'], target: '/hot/blog' },
    ],
    name: '热门榜单',
    maintainers: ['drgnchan'],
    handler,
};

async function handler(ctx) {
    const type = (ctx.req.param('type') || 'stockbar') as HotType;
    if (!['stockbar', 'caifuhao', 'blog'].includes(type)) {
        throw new Error('类型参数 type 仅支持 stockbar / caifuhao / blog');
    }

    const response = await got({
        method: 'get',
        url: homeUrl,
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const result = pickHotBlock(response.data, type);

    return {
        title: `东方财富 - ${typeNameMap[type]}`,
        link: result.link ?? homeUrl,
        item: result.items,
    };
}
