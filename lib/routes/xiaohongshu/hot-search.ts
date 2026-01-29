import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

import { extractInitialState, getHeaders } from './util';

interface ExploreFeedState {
    feed?: {
        feeds?: Array<{
            id: string;
            xsecToken?: string;
            noteCard?: {
                displayTitle?: string;
                type?: string;
                user?: {
                    nickname?: string;
                };
                cover?: {
                    urlDefault?: string;
                };
            };
        }>;
    };
}

export const route: Route = {
    path: '/hot-search',
    categories: ['social-media'],
    example: '/xiaohongshu/hot-search',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.xiaohongshu.com/explore'],
            target: '/hot-search',
        },
    ],
    name: '热点（探索页推荐）',
    maintainers: ['lotosbin'],
    handler,
};

async function handler() {
    const url = 'https://www.xiaohongshu.com/explore';
    const cookie = config.xiaohongshu.cookie;

    const response = await got({
        method: 'get',
        url,
        headers: getHeaders(cookie),
    });

    const $ = load(response.data);
    const script = extractInitialState($);
    const state = JSON.parse(script) as ExploreFeedState;

    const items: DataItem[] = (state.feed?.feeds ?? [])
        .filter((i) => i?.id)
        .map((i) => {
            const title = i.noteCard?.displayTitle?.trim() ?? i.id;
            const xsecToken = i.xsecToken ?? '';
            const link = `https://www.xiaohongshu.com/explore/${i.id}?xsec_token=${encodeURIComponent(xsecToken)}&xsec_source=pc_feed`;
            const cover = i.noteCard?.cover?.urlDefault;

            const description = cover ? `<img src="${cover}">` : '';

            return {
                title,
                link,
                description,
                author: i.noteCard?.user?.nickname,
                category: i.noteCard?.type ? [i.noteCard.type] : undefined,
            };
        });

    return {
        title: '小红书 - 热点（探索页推荐）',
        link: url,
        item: items,
    };
}
