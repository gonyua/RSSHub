import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

type HotType = 'hot' | 'online-game' | 'pc-game' | 'mobile-game' | 'chess' | 'entertainment' | 'general' | 'culture';

const hotTypeMap: Record<HotType, { code: string; name: string }> = {
    hot: { code: 'DQRM', name: '热门' },
    'online-game': { code: 'WYJJ', name: '网游' },
    'pc-game': { code: 'DJRY', name: '单机' },
    'mobile-game': { code: 'SYXX', name: '手游' },
    chess: { code: 'QP', name: '棋牌' },
    entertainment: { code: 'YL', name: '娱乐' },
    general: { code: 'ZH', name: '综合' },
    culture: { code: 'KJ', name: '文化' },
};

const pageUrl = 'https://live.kuaishou.com/hot';

interface HotListResponse {
    data?: {
        list?: Array<{
            id: string;
            caption?: string;
            poster?: string;
            statrtTime?: number;
            author?: {
                id?: string;
                name?: string;
                avatar?: string;
            };
            gameInfo?: {
                name?: string;
            };
        }>;
    };
}

export const route: Route = {
    path: '/hot/:type?',
    categories: ['social-media'],
    example: '/kuaishou/hot',
    parameters: {
        type: {
            description: '分类',
            default: 'hot',
            options: [
                { label: '热门', value: 'hot' },
                { label: '网游', value: 'online-game' },
                { label: '单机', value: 'pc-game' },
                { label: '手游', value: 'mobile-game' },
                { label: '棋牌', value: 'chess' },
                { label: '娱乐', value: 'entertainment' },
                { label: '综合', value: 'general' },
                { label: '文化', value: 'culture' },
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
        { source: ['live.kuaishou.com/hot'], target: '/hot' },
        { source: ['live.kuaishou.com/hot'], target: '/hot/hot' },
    ],
    name: '热榜（直播）',
    maintainers: ['GuoChen-thlg'],
    handler,
};

async function handler(ctx) {
    const type = (ctx.req.param('type') || 'hot') as HotType;
    if (!(type in hotTypeMap)) {
        throw new Error(`类型参数 type 仅支持：${Object.keys(hotTypeMap).join(' / ')}`);
    }

    const apiUrl = 'https://live.kuaishou.com/live_api/hot/list';
    const { code, name } = hotTypeMap[type];

    const response = await got<HotListResponse>({
        method: 'get',
        url: apiUrl,
        searchParams: {
            type: code,
            filterType: 0,
            page: 1,
            pageSize: 50,
        },
        headers: {
            Referer: pageUrl,
            'User-Agent': config.trueUA,
        },
    });

    const list = response.data?.data?.list ?? [];

    const items: DataItem[] = list
        .filter((i) => i?.id)
        .map((i, idx) => {
            const authorId = i.author?.id;
            const link = authorId ? `https://live.kuaishou.com/u/${authorId}?liveId=${i.id}` : pageUrl;
            const title = i.caption?.trim() ? `${idx + 1}. ${i.caption.trim()}` : `${idx + 1}. ${i.author?.name ?? i.id}`;

            const descriptionBlocks = [];
            if (i.poster) {
                descriptionBlocks.push(`<img src="${i.poster}">`);
            }

            const category = [name, i.gameInfo?.name].filter(Boolean) as string[];

            return {
                title,
                link,
                description: descriptionBlocks.join('<br>'),
                author: i.author?.name,
                category: category.length > 0 ? category : undefined,
            };
        });

    return {
        title: `快手 - ${name}（直播）`,
        link: pageUrl,
        item: items,
    };
}
