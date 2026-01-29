import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/tieba/hottopic',
    categories: ['bbs'],
    example: '/baidu/tieba/hottopic',
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
            source: ['tieba.baidu.com/hottopic/browse/hottopic'],
            target: '/tieba/hottopic',
        },
    ],
    name: '热门话题',
    maintainers: ['u3u'],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://tieba.baidu.com';
    const listUrl = `${rootUrl}/hottopic/browse/topicList?res_type=1`;
    const link = `${rootUrl}/hottopic/browse/hottopic`;

    const { data } = await got(listUrl, {
        headers: {
            Referer: link,
        },
    });
    const $ = load(data);

    const items = $('.topic-top-item')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 30)
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.find('a').first().attr('href');
            const topicUrl = href?.startsWith('http') ? href : `${rootUrl}${href}`;
            const topicNum = item.find('.topic-num').text().trim();
            let title = item.find('.topic-name').text().trim();
            if (topicNum && title.endsWith(topicNum)) {
                title = title.slice(0, -topicNum.length).trim();
            }
            const coverUrl = item.find('img.topic-cover').attr('src');

            return { title, link: topicUrl, coverUrl };
        })
        .filter((item) => item.title && item.link);

    const result = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $$ = load(detailResponse.data);
                const summary = $$('.topic_desc, p.topic_desc').first().html();

                const descriptionParts = [];
                item.coverUrl && descriptionParts.push(`<img src="${item.coverUrl}">`);
                summary && descriptionParts.push(summary);

                return {
                    title: item.title,
                    link: item.link,
                    description: descriptionParts.join(''),
                };
            })
        )
    );

    return {
        title: '贴吧热门话题 - 百度贴吧',
        link,
        item: result,
    };
}
