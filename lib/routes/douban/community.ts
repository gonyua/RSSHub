import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const exploreUrl = 'https://www.douban.com/group/explore';

type CommunityType = 'discussion' | 'topic' | 'group';

interface ExploreTopic {
    likes: number;
    title: string;
    link: string;
    description: string;
    image?: string;
    groupName: string;
    groupLink: string;
    pubDate?: Date;
}

export const route: Route = {
    path: '/community/:type?',
    categories: ['social-media'],
    example: '/douban/community/discussion',
    parameters: {
        type: {
            description: '榜单类型',
            default: 'discussion',
            options: [
                { label: '精选讨论', value: 'discussion' },
                { label: '热门话题', value: 'topic' },
                { label: '发现小组', value: 'group' },
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
        { source: ['www.douban.com/group/explore'], target: '/community/discussion' },
        { source: ['www.douban.com/group/explore'], target: '/community/topic' },
        { source: ['www.douban.com/group/explore'], target: '/community/group' },
    ],
    name: '社区精选/热门话题/发现小组',
    maintainers: ['DIYgod'],
    handler,
};

function parseCommunityPubDate(text: string): Date | undefined {
    const trimmed = text.trim();
    if (!trimmed) {
        return undefined;
    }

    if (/^(?:刚刚|.*[之以]?[前后]|今[天日]|昨[天日]|前天|(?:周|星期)[一二三四五六天日])/.test(trimmed)) {
        const parsed = parseRelativeDate(trimmed);
        if (parsed instanceof Date) {
            return timezone(parsed, 8);
        }
        return undefined;
    }

    if (/^\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}(?::\d{2})?)?$/.test(trimmed)) {
        const parsed = parseDate(trimmed, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD']);
        return timezone(parsed, 8);
    }

    if (/^\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(trimmed)) {
        const year = new Date().getFullYear();
        const parsed = parseDate(`${year}-${trimmed}`, 'YYYY-MM-DD HH:mm');
        return timezone(parsed, 8);
    }

    return undefined;
}

function parseExploreTopics(html: string): ExploreTopic[] {
    const $ = load(html);
    return $('.topics .channel-item')
        .toArray()
        .map((item) => {
            const el = $(item);
            const likes = Number.parseInt(el.find('.likes').text(), 10) || 0;
            const link = el.find('.bd h3 a').attr('href')?.split('?')[0]?.trim() ?? '';
            const title = el.find('.bd h3 a').text().trim();
            const description = el.find('.bd .block p').text().trim();
            const image = el.find('.bd .pic img').attr('src')?.trim();
            const groupLink = el.find('.bd .source .from a').attr('href')?.trim() ?? '';
            const groupName = el.find('.bd .source .from a').text().trim();
            const pubTimeText = el.find('.bd .source .pubtime').text().trim();
            const pubDate = parseCommunityPubDate(pubTimeText);

            return {
                likes,
                title,
                link,
                description,
                image,
                groupName,
                groupLink,
                pubDate,
            };
        })
        .filter((t) => t.title && t.link);
}

function renderTopicDescription(topic: ExploreTopic): string {
    const blocks: string[] = [];
    if (topic.description) {
        blocks.push(topic.description);
    }
    if (topic.image) {
        blocks.push(`<img src="${topic.image}">`);
    }
    return blocks.join('<br>');
}

function fetchGroupInfo(groupLink: string, groupName: string): Promise<DataItem> {
    return cache.tryGet(groupLink, async () => {
        const response = await got({
            method: 'get',
            url: groupLink,
            headers: {
                Referer: exploreUrl,
                'User-Agent': config.trueUA,
            },
        });

        const $ = load(response.data);
        const title = $('#group-info h1').first().text().trim() || groupName;
        const descriptionHtml = $('.group-info-item.group-intro').first().html()?.trim();
        const icon = $('img.groupicon').first().attr('src')?.trim();
        const createdText = $('.group-info-item.group-loc').first().text();
        const createdMatch = /创建于\s*(\d{4}-\d{2}-\d{2})/.exec(createdText);
        const pubDate = createdMatch ? timezone(parseDate(createdMatch[1], 'YYYY-MM-DD'), 8) : undefined;
        const category = $('.group-info-item.group-tags a.tag')
            .toArray()
            .map((tag) => $(tag).text().trim())
            .filter(Boolean);

        const descriptionBlocks = [];
        if (descriptionHtml) {
            descriptionBlocks.push(descriptionHtml);
        }
        if (icon) {
            descriptionBlocks.push(`<img src="${icon}">`);
        }

        return {
            title,
            link: groupLink,
            description: descriptionBlocks.join('<br>'),
            pubDate,
            category: category.length > 0 ? category : undefined,
        };
    });
}

async function handler(ctx) {
    const type = (ctx.req.param('type') || 'discussion') as CommunityType;
    if (!['discussion', 'topic', 'group'].includes(type)) {
        throw new Error('类型参数 type 仅支持 discussion / topic / group');
    }

    const response = await got({
        method: 'get',
        url: exploreUrl,
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const topics = parseExploreTopics(response.data);
    const items: DataItem[] =
        type === 'group'
            ? await Promise.all([...new Map(topics.map((t) => [t.groupLink, t.groupName])).entries()].filter(([groupLink]) => groupLink).map(([groupLink, groupName]) => fetchGroupInfo(groupLink, groupName)))
            : (type === 'topic' ? topics.toSorted((a, b) => b.likes - a.likes) : topics).map((topic) => ({
                  title: topic.title,
                  link: topic.link,
                  description: renderTopicDescription(topic),
                  pubDate: topic.pubDate,
                  category: topic.groupName ? [topic.groupName] : undefined,
              }));

    const typeTitleMap: Record<CommunityType, string> = {
        discussion: '精选讨论',
        topic: '热门话题',
        group: '发现小组',
    };

    return {
        title: `豆瓣社区 - ${typeTitleMap[type]}`,
        link: exploreUrl,
        item: items,
    };
}
