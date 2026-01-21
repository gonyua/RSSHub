import { load } from 'cheerio';
import type { Comment } from 'domhandler';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

type TencentHotListResponse = {
    ret: number;
    idlist?: Array<{
        newslist?: TencentHotListItem[];
    }>;
};

type TencentHotListItem = {
    id: string;
    title?: string;
    longtitle?: string;
    url?: string;
    abstract?: string;
    nlpAbstract?: string;
    timestamp?: number | string;
    articletype?: string;
    miniProShareImage?: string;
    thumbnails?: string[];
    bigImage?: string[];
    image_more?: string[];
    source?: string;
    commentNum?: number;
    likeInfo?: number;
    hotEvent?: {
        hotScore?: number;
    };
};

export const route: Route = {
    path: '/news/hot',
    categories: ['new-media'],
    example: '/tencent/news/hot',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.qq.com', 'www.qq.com'],
            target: '/news/hot',
        },
    ],
    name: '热榜',
    maintainers: ['LogicJake', 'miles170'],
    handler,
    url: 'news.qq.com',
};

const pickFirstImage = (item: TencentHotListItem) => item.miniProShareImage || item.bigImage?.[0] || item.thumbnails?.[0] || item.image_more?.[0];

const isVideo = (item: TencentHotListItem) => item.articletype === '4' || item.articletype === '118';

export async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit') as string, 10) : 50;

    const apiUrl = 'https://r.inews.qq.com/gw/event/hot_ranking_list';
    const { data: dataRaw } = await got(apiUrl, {
        searchParams: {
            page_size: String(Math.min(Math.max(limit, 1), 50)),
        },
        headers: {
            Referer: 'https://news.qq.com/',
            'User-Agent': config.ua,
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
    });

    const data = dataRaw as TencentHotListResponse;
    const list = data.idlist?.[0]?.newslist ?? [];

    const candidates = list
        .filter((item) => item.url && (item.longtitle || item.title) && item.articletype !== '560')
        .map((item) => ({ item, hotScore: typeof item.hotEvent?.hotScore === 'number' ? item.hotEvent.hotScore : Number(item.hotEvent?.hotScore) }))
        .filter((x) => Number.isFinite(x.hotScore))
        .toSorted((a, b) => (b.hotScore as number) - (a.hotScore as number))
        .slice(0, limit)
        .map((x) => x.item);

    const items: DataItem[] = await Promise.all(
        candidates.map((item) => {
            const title = item.longtitle || item.title || '';
            const link = item.url || '';
            const ts = item.timestamp ? Number(item.timestamp) : undefined;
            const pubDate = ts && Number.isFinite(ts) && ts > 0 ? parseDate(ts, 'X') : undefined;
            const author = item.source;
            const abstract = item.nlpAbstract || item.abstract || '';
            const image = pickFirstImage(item);

            if (isVideo(item)) {
                return {
                    title,
                    link,
                    author,
                    pubDate,
                    description: renderToString(
                        <>
                            {image ? <img src={image} /> : null}
                            {abstract ? <p>{abstract}</p> : null}
                        </>
                    ),
                };
            }

            return cache.tryGet(
                `tencent:news:hot:${link}`,
                async () => {
                    try {
                        const response = await got(link, {
                            headers: {
                                Referer: 'https://news.qq.com/',
                                'User-Agent': config.ua,
                                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                            },
                        });
                        const $ = load(response.data);
                        const script = $('script:contains("window.DATA")').text();
                        const m = script.match(/window\.DATA\s*=\s*({[\s\S]+?});/);
                        if (!m) {
                            return {
                                title,
                                link,
                                author,
                                pubDate,
                                description: renderToString(
                                    <>
                                        {image ? <img src={image} /> : null}
                                        {abstract ? <p>{abstract}</p> : null}
                                    </>
                                ),
                            };
                        }

                        const payload = JSON.parse(m[1]) as {
                            originContent?: { text?: string };
                            originAttribute?: Record<string, { imgurl0?: string; style?: string }>;
                        };

                        const contentHtml = payload.originContent?.text || '';
                        const $content = load(contentHtml, null, false);
                        $content('*')
                            .contents()
                            .filter((_, elem) => elem.type === 'comment')
                            .replaceWith((_, elem) => {
                                if (elem.type !== 'comment') {
                                    return '';
                                }
                                const attribute = (elem as Comment).data.trim();
                                if (!attribute.startsWith('IMG')) {
                                    return '';
                                }
                                const imageData = payload.originAttribute?.[attribute];
                                return renderToString(imageData?.imgurl0 ? <img src={imageData.imgurl0} style={imageData.style} /> : null);
                            });

                        return {
                            title,
                            link,
                            author,
                            pubDate,
                            description:
                                $content.html() ||
                                renderToString(
                                    <>
                                        {image ? <img src={image} /> : null}
                                        {abstract ? <p>{abstract}</p> : null}
                                    </>
                                ),
                        };
                    } catch {
                        return {
                            title,
                            link,
                            author,
                            pubDate,
                            description: renderToString(
                                <>
                                    {image ? <img src={image} /> : null}
                                    {abstract ? <p>{abstract}</p> : null}
                                </>
                            ),
                        };
                    }
                },
                config.cache.routeExpire,
                false
            );
        })
    );

    return {
        title: '腾讯新闻热榜',
        link: 'https://news.qq.com/',
        description: '腾讯新闻热榜（约每 10 分钟更新）',
        item: items.map((it, i) => ({ ...it, title: it.title || `#${i + 1}` })),
    };
}
