import { createHash } from 'node:crypto';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

type HotRange = 'today' | 'weekly' | 'monthly';

interface KdsApiResponse<T> {
    status: number;
    msg?: string;
    data: T;
}

interface KdsThread {
    tid: number;
    fid?: number;
    subject: string;
    msg?: string;
    images?: string[];
    post_time?: number;
    last_reply_time?: number;
    post_nick_name?: string;
    post_user_name?: string;
    reply_num?: number;
    views?: number;
}

interface KdsHotListData {
    hot_thread_list: KdsThread[];
}

interface KdsThreadListData {
    thread_list: KdsThread[];
}

const rootUrl = 'https://club.kdslife.com';
const apiUrl = 'https://apiv2.kdslife.com/index.php';

export const route: Route = {
    path: '/hot/:range?',
    categories: ['bbs'],
    example: '/kds/hot/today',
    parameters: {
        range: {
            description: '榜单范围',
            default: 'today',
            options: [
                { label: '今日', value: 'today' },
                { label: '本周（近似）', value: 'weekly' },
                { label: '本月（近似）', value: 'monthly' },
            ],
        },
    },
    radar: [
        {
            source: ['club.kdslife.com/new/home'],
            target: '/kds/hot/today',
        },
    ],
    name: '热帖',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx): Promise<{
    title: string;
    link: string;
    item: DataItem[];
}> {
    const range = (ctx.req.param('range') || 'today') as HotRange;

    if (range === 'today') {
        const data = await callKdsApi<KdsHotListData>({
            c: 'business/hot',
            m: 'get_hot_list',
        });

        return {
            title: 'KDS - 今日热帖',
            link: `${rootUrl}/new/home`,
            item: buildRankedItems(data.hot_thread_list),
        };
    }

    if (range !== 'weekly' && range !== 'monthly') {
        throw new Error('参数 range 仅支持：today / weekly / monthly');
    }

    const days = range === 'weekly' ? 7 : 30;
    const cutoffSeconds = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    const data = await callKdsApi<KdsThreadListData>({
        c: 'topic/thread',
        m: 'get_thread_list',
        sort: 'post_time',
        page_size: 200,
    });

    const filtered = data.thread_list.filter((t) => typeof t.post_time === 'number' && t.post_time >= cutoffSeconds);
    const ranked = filtered.toSorted((a, b) => (b.reply_num ?? 0) - (a.reply_num ?? 0) || (b.views ?? 0) - (a.views ?? 0) || (b.post_time ?? 0) - (a.post_time ?? 0));

    return {
        title: range === 'weekly' ? 'KDS - 本周热帖（近似）' : 'KDS - 本月热帖（近似）',
        link: `${rootUrl}/new/home`,
        item: buildRankedItems(ranked),
    };
}

async function callKdsApi<T extends object>(payload: Record<string, string | number>): Promise<T> {
    const normalizedPayload: Record<string, string> = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, String(v)]));
    normalizedPayload.sid = normalizedPayload.sid ?? '';

    const sign = signPayload(normalizedPayload);
    const response = await got.post<KdsApiResponse<T>>(apiUrl, {
        form: {
            ...normalizedPayload,
            sign,
        },
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const data = response.data;
    if (!data || typeof data !== 'object') {
        throw new Error('KDS API 返回异常：响应为空');
    }
    if (data.status !== 200) {
        throw new Error(`KDS API 错误：${data.msg || data.status}`);
    }

    return data.data;
}

function buildRankedItems(list: KdsThread[]): DataItem[] {
    return list
        .filter((t) => t?.tid && t?.subject)
        .map((t, idx) => {
            const title = `${idx + 1}. ${t.subject}`;
            const link = `${rootUrl}/t_${t.tid}.html`;
            const author = t.post_nick_name || t.post_user_name || undefined;

            const description = renderThreadDescription(t);

            return {
                title,
                link,
                description,
                author,
            };
        });
}

function renderThreadDescription(thread: KdsThread): string {
    const msg = thread.msg || '';
    if (!msg) {
        return '';
    }

    const images = Array.isArray(thread.images) ? thread.images : [];
    const withImages = msg
        .replaceAll('{{P_S}}', '<p>')
        .replaceAll('{{P_E}}', '</p>')
        .replaceAll(/{{img_(\d+)}}/g, (_match, indexStr) => {
            const index = Number(indexStr);
            const url = images[index];
            return url ? `<img src="${url}">` : '';
        })
        .replaceAll(/{{emoji_\d+}}/g, '');

    return withImages;
}

function signPayload(payload: Record<string, string>): string {
    const keys = Object.keys(payload).toSorted(compareKdsKeys);

    const encoded: Record<string, string> = {};
    for (const key of keys) {
        const value = payload[key];
        encoded[key] = key === 'c' ? value.replaceAll('/', '%2F') : encodeURIComponent(value);
    }

    const salt = md5('kdslife');

    const query = keys
        .map((key) => {
            const safeKey = key.replaceAll('[', '%5B').replaceAll(']', '%5D');
            const safeValue = encoded[key].replaceAll('%20', '+');
            return `${safeKey}=${safeValue}`;
        })
        .join('&');

    return md5(md5(query) + salt);
}

function compareKdsKeys(a: string, b: string): number {
    const tokenRegex = /(\d+)|(\D+)/g;
    const aParts = String(a).match(tokenRegex) ?? [String(a)];
    const bParts = String(b).match(tokenRegex) ?? [String(b)];

    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        const aPart = aParts[i];
        const bPart = bParts[i];
        const aIsNumber = /^\d+$/.test(aPart);
        const bIsNumber = /^\d+$/.test(bPart);

        if (!aIsNumber || !bIsNumber) {
            if (aPart !== bPart) {
                return aPart.localeCompare(bPart);
            }
        } else {
            const aNumber = Number.parseInt(aPart, 10);
            const bNumber = Number.parseInt(bPart, 10);
            if (aNumber !== bNumber) {
                return aNumber - bNumber;
            }
        }
    }

    return aParts.length - bParts.length;
}

function md5(input: string): string {
    return createHash('md5').update(input).digest('hex');
}
