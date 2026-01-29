import { load } from 'cheerio';
import iconv from 'iconv-lite';

import { config } from '@/config';
import { journalTechBloggerSources } from '@/rebang/journal-tech-sources';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

import { parseList, ProcessFeed } from '../juejin/utils';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/journal-tech',
    name: '聚合',
    maintainers: ['nczitzk'],
    handler,
};

type FetchOptions = {
    perSourceLimit: number;
    weeklyIssueLimit: number;
};

type JournalTechSource = {
    name: string;
    homepage: string;
    probeUrl: string;
    fetch: (options: FetchOptions) => Promise<DataItem[]>;
};

const sourceConfigs: Record<string, Pick<JournalTechSource, 'probeUrl' | 'fetch'>> = {
    阮一峰的网络日志: { probeUrl: 'https://www.ruanyifeng.com/blog/weekly/', fetch: ({ weeklyIssueLimit }) => fetchRuanyifengWeekly(weeklyIssueLimit) },
    奇舞周刊: { probeUrl: 'https://weekly.75.team/', fetch: ({ perSourceLimit }) => fetchFeedDiscovered('https://weekly.75.team/', '奇舞周刊', perSourceLimit) },
    HelloGitHub: { probeUrl: 'https://hellogithub.com/rss', fetch: ({ perSourceLimit }) => fetchRss('https://hellogithub.com/rss', 'HelloGitHub', perSourceLimit) },
    '好工具周刊 BestXTools': { probeUrl: 'https://bestxtools.zhubai.love/', fetch: ({ perSourceLimit }) => fetchFeedDiscovered('https://bestxtools.zhubai.love/', '好工具周刊 BestXTools', perSourceLimit) },
    'Easy Indie': { probeUrl: 'https://www.ezindie.com/feed/rss.xml', fetch: ({ perSourceLimit }) => fetchRss('https://www.ezindie.com/feed/rss.xml', 'Easy Indie', perSourceLimit) },
    DecoHack周刊: { probeUrl: 'https://decohack.zhubai.love/', fetch: ({ perSourceLimit }) => fetchFeedDiscovered('https://decohack.zhubai.love/', 'DecoHack周刊', perSourceLimit) },
    老胡的周刊: { probeUrl: 'https://weekly.howie6879.com/', fetch: ({ weeklyIssueLimit }) => fetchHowieWeekly(weeklyIssueLimit) },
    '酷壳 CoolShell（已故）': { probeUrl: 'https://coolshell.cn/feed', fetch: ({ perSourceLimit }) => fetchRss('https://coolshell.cn/feed', '酷壳 CoolShell（已故）', perSourceLimit) },
    美团技术团队: { probeUrl: 'https://tech.meituan.com/feed/', fetch: ({ perSourceLimit }) => fetchRss('https://tech.meituan.com/feed/', '美团技术团队', perSourceLimit) },
    '张鑫旭-鑫空间-鑫生活': { probeUrl: 'https://www.zhangxinxu.com/wordpress/feed/', fetch: ({ perSourceLimit }) => fetchRss('https://www.zhangxinxu.com/wordpress/feed/', '张鑫旭-鑫空间-鑫生活', perSourceLimit) },
    鸟窝: { probeUrl: 'https://colobu.com/atom.xml', fetch: ({ perSourceLimit }) => fetchRss('https://colobu.com/atom.xml', '鸟窝', perSourceLimit) },
    峰华前端工程师: { probeUrl: 'https://zxuqian.cn/rss.xml', fetch: ({ perSourceLimit }) => fetchRss('https://zxuqian.cn/rss.xml', '峰华前端工程师', perSourceLimit) },
    运维咖啡吧: { probeUrl: 'https://blog.ops-coffee.cn/atom.xml', fetch: ({ perSourceLimit }) => fetchRss('https://blog.ops-coffee.cn/atom.xml', '运维咖啡吧', perSourceLimit) },
    李文周的博客: { probeUrl: 'https://www.liwenzhou.com/index.xml', fetch: ({ perSourceLimit }) => fetchRss('https://www.liwenzhou.com/index.xml', '李文周的博客', perSourceLimit) },
    无忌: { probeUrl: 'https://jincheng9.github.io/index.xml', fetch: ({ perSourceLimit }) => fetchRss('https://jincheng9.github.io/index.xml', '无忌', perSourceLimit) },
    'Tony Bai': { probeUrl: 'https://tonybai.com/feed/', fetch: ({ perSourceLimit }) => fetchRss('https://tonybai.com/feed/', 'Tony Bai', perSourceLimit) },
    午夜咖啡: { probeUrl: 'https://jolestar.com/feed.xml', fetch: ({ perSourceLimit }) => fetchRss('https://jolestar.com/feed.xml', '午夜咖啡', perSourceLimit) },
    深度学习前沿笔记: { probeUrl: 'https://www.zhihu.com/api/v4/columns/c_188941548/items?limit=1&offset=0', fetch: ({ perSourceLimit }) => fetchZhihuColumn('c_188941548', '深度学习前沿笔记', perSourceLimit) },
    RandomGenerator: { probeUrl: 'https://www.zhihu.com/api/v4/columns/zijie0/items?limit=1&offset=0', fetch: ({ perSourceLimit }) => fetchZhihuColumn('zijie0', 'RandomGenerator', perSourceLimit) },
    iCSS前端趣闻: { probeUrl: 'https://juejin.cn/user/2330620350437678/posts?sort=newest', fetch: ({ perSourceLimit }) => fetchJuejinUserPosts('2330620350437678', 'iCSS前端趣闻', perSourceLimit) },
    字节跳动技术团队: { probeUrl: 'https://juejin.cn/user/1838039172387262/posts?sort=newest', fetch: ({ perSourceLimit }) => fetchJuejinUserPosts('1838039172387262', '字节跳动技术团队', perSourceLimit) },
    'SegmentFault Weekly': { probeUrl: 'https://segmentfault.com/weekly', fetch: ({ weeklyIssueLimit }) => fetchSegmentFaultWeekly(weeklyIssueLimit) },
    云风的BLOG: { probeUrl: 'https://blog.codingnow.com/atom.xml', fetch: ({ perSourceLimit }) => fetchRss('https://blog.codingnow.com/atom.xml', '云风的BLOG', perSourceLimit) },
    'Phodal Huang': { probeUrl: 'https://www.phodal.com/blog/feeds/atom/', fetch: ({ perSourceLimit }) => fetchRss('https://www.phodal.com/blog/feeds/atom/', 'Phodal Huang', perSourceLimit) },
    Python猫: { probeUrl: 'https://pythoncat.top/rss.xml', fetch: ({ perSourceLimit }) => fetchRss('https://pythoncat.top/rss.xml', 'Python猫', perSourceLimit) },
    'Next.js Blog': { probeUrl: 'https://nextjs.org/feed.xml', fetch: ({ perSourceLimit }) => fetchRss('https://nextjs.org/feed.xml', 'Next.js Blog', perSourceLimit) },
    "Sukka's Blog": { probeUrl: 'https://blog.skk.moe/atom.xml', fetch: ({ perSourceLimit }) => fetchRss('https://blog.skk.moe/atom.xml', "Sukka's Blog", perSourceLimit) },
    'OpenAI Blog': { probeUrl: 'https://openai.com/blog/rss.xml', fetch: ({ perSourceLimit }) => fetchRss('https://openai.com/blog/rss.xml', 'OpenAI Blog', perSourceLimit) },
    'Vue.js Blog': { probeUrl: 'https://blog.vuejs.org/feed.rss', fetch: ({ perSourceLimit }) => fetchRss('https://blog.vuejs.org/feed.rss', 'Vue.js Blog', perSourceLimit) },
    'Go Blog': { probeUrl: 'https://go.dev/blog/feed.atom', fetch: ({ perSourceLimit }) => fetchRss('https://go.dev/blog/feed.atom', 'Go Blog', perSourceLimit) },
    安富莱嵌入式周报: { probeUrl: 'https://www.armbbs.cn/forum.php?mod=forumdisplay&fid=12&filter=author&orderby=dateline&typeid=104', fetch: ({ weeklyIssueLimit }) => fetchArmbbsWeekly(weeklyIssueLimit) },
    'Java News': { probeUrl: 'https://inside.java/feed.xml', fetch: ({ perSourceLimit }) => fetchRss('https://inside.java/feed.xml', 'Java News', perSourceLimit) },
    '.NET Blog': { probeUrl: 'https://devblogs.microsoft.com/dotnet/feed/', fetch: ({ perSourceLimit }) => fetchRss('https://devblogs.microsoft.com/dotnet/feed/', '.NET Blog', perSourceLimit) },
    'C++ Team Blog': { probeUrl: 'https://devblogs.microsoft.com/cppblog/feed/', fetch: ({ perSourceLimit }) => fetchRss('https://devblogs.microsoft.com/cppblog/feed/', 'C++ Team Blog', perSourceLimit) },
    '.NET中文官方博客': { probeUrl: 'https://devblogs.microsoft.com/dotnet-ch/feed/', fetch: ({ perSourceLimit }) => fetchRss('https://devblogs.microsoft.com/dotnet-ch/feed/', '.NET中文官方博客', perSourceLimit) },
    'Rust Blog': { probeUrl: 'https://blog.rust-lang.org/feed.xml', fetch: ({ perSourceLimit }) => fetchRss('https://blog.rust-lang.org/feed.xml', 'Rust Blog', perSourceLimit) },
    "Eli Bendersky's website": { probeUrl: 'https://eli.thegreenplace.net/feeds/all.atom.xml', fetch: ({ perSourceLimit }) => fetchRss('https://eli.thegreenplace.net/feeds/all.atom.xml', "Eli Bendersky's website", perSourceLimit) },
    'Apple Developer News': { probeUrl: 'https://developer.apple.com/news/rss/news.rss', fetch: ({ perSourceLimit }) => fetchRss('https://developer.apple.com/news/rss/news.rss', 'Apple Developer News', perSourceLimit) },
    'PolarDB 数据库内核月报': { probeUrl: 'http://mysql.taobao.org/monthly/feed.xml', fetch: ({ perSourceLimit }) => fetchRss('http://mysql.taobao.org/monthly/feed.xml', 'PolarDB 数据库内核月报', perSourceLimit) },
    得物技术: { probeUrl: 'https://juejin.cn/user/2392954206960247/posts?sort=newest', fetch: ({ perSourceLimit }) => fetchJuejinUserPosts('2392954206960247', '得物技术', perSourceLimit) },
    网易云音乐技术团队: { probeUrl: 'https://juejin.cn/user/4265760847567016/posts?sort=newest', fetch: ({ perSourceLimit }) => fetchJuejinUserPosts('4265760847567016', '网易云音乐技术团队', perSourceLimit) },
};

export const journalTechSources: JournalTechSource[] = journalTechBloggerSources.map((source) => {
    const config = sourceConfigs[source.name];
    return {
        ...source,
        probeUrl: config?.probeUrl ?? source.homepage,
        fetch: config?.fetch ?? (({ perSourceLimit }) => fetchFeedDiscovered(source.homepage, source.name, perSourceLimit)),
    };
});

const normalizeAuthorName = (raw: unknown, fallback: string): string => {
    if (!raw) {
        return fallback;
    }
    if (typeof raw === 'string') {
        return raw;
    }
    if (Array.isArray(raw)) {
        const names = raw
            .map((a) => {
                if (!a) {
                    return '';
                }
                if (typeof a === 'string') {
                    return a;
                }
                if (typeof a === 'object' && 'name' in a && typeof a.name === 'string') {
                    return a.name;
                }
                return '';
            })
            .filter(Boolean);
        return names.join(', ') || fallback;
    }
    if (typeof raw === 'object' && 'name' in raw && typeof raw.name === 'string') {
        return raw.name;
    }
    return fallback;
};

const uniqueStrings = (values: string[]) => [...new Set(values.filter(Boolean))];

const isSourceAccessible = (url: string): Promise<boolean> =>
    cache.tryGet(
        `journal-tech:source-access:${url}`,
        async () => {
            try {
                await got(url, {
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                    timeout: 10000,
                });
                return true;
            } catch {
                return false;
            }
        },
        6 * 60 * 60
    );

async function handler(ctx): Promise<{
    title: string;
    link: string;
    item: DataItem[];
}> {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 50;
    const perSourceLimit = Math.min(Math.max(5, Math.ceil(limit / 3)), 20);
    const weeklyIssueLimit = Math.min(perSourceLimit, 8);
    const fetchOptions: FetchOptions = { perSourceLimit, weeklyIssueLimit };

    const accessibleSources = (
        await Promise.all(
            journalTechSources.map(async (source) => ({
                source,
                accessible: await isSourceAccessible(source.probeUrl),
            }))
        )
    )
        .filter((s) => s.accessible)
        .map((s) => s.source);

    const items = (
        await Promise.all(
            accessibleSources.map(async (source) => {
                try {
                    const items = await source.fetch(fetchOptions);
                    return items.map((item) => ({
                        ...item,
                        category: uniqueStrings([source.name, ...(item.category ?? [])]),
                    }));
                } catch {
                    return [];
                }
            })
        )
    )
        .flat()
        .filter((item) => item.link)
        .toSorted((a, b) => (b.pubDate ? new Date(b.pubDate).valueOf() : 0) - (a.pubDate ? new Date(a.pubDate).valueOf() : 0))
        .slice(0, limit);

    return {
        title: '技术期刊',
        link: 'https://rebang.today/?tab=journal-tech',
        item: items,
    };
}

async function fetchRss(url: string, sourceName: string, limit: number): Promise<DataItem[]> {
    const response = await got(url, {
        headers: {
            'User-Agent': config.trueUA,
        },
        timeout: 10000,
    });

    const feed = await parser.parseString(response.data);
    return (feed.items ?? [])
        .slice(0, limit)
        .map((item) => {
            const author = normalizeAuthorName(item['dc:creator'] ?? item.creator ?? item.author, sourceName);
            return {
                title: item.title || '',
                link: item.link,
                description: item.content || item.contentSnippet,
                pubDate: item.pubDate,
                author,
                category: [sourceName],
            };
        })
        .filter((item) => item.title && item.link);
}

async function fetchFeedDiscovered(homepage: string, sourceName: string, limit: number): Promise<DataItem[]> {
    const { data: html } = await got(homepage, {
        headers: {
            'User-Agent': config.trueUA,
        },
        timeout: 10000,
    });

    const $ = load(html);
    const candidate_ = $('link[rel="alternate"][href]')
        .toArray()
        .map((l) => ({
            href: $(l).attr('href'),
            type: ($(l).attr('type') || '').toLowerCase(),
        }))
        .filter((l) => l.href)
        .map((l) => ({
            href: l.href!,
            type: l.type,
        }))
        .find((l) => l.type.includes('rss') || l.type.includes('atom') || l.href.endsWith('.xml') || l.href.endsWith('.rss') || l.href.endsWith('.atom'));

    const feedUrlFromLink = candidate_?.href ? new URL(candidate_.href, homepage).href : undefined;
    const fallbackCandidates = ['rss', 'rss.xml', 'feed', 'feed.xml', 'feed.rss', 'atom.xml', 'index.xml'].map((p) => new URL(`/${p}`, homepage).href);
    const feedCandidates = uniqueStrings([feedUrlFromLink, ...fallbackCandidates].filter(Boolean) as string[]);

    const results = await Promise.all(
        feedCandidates.map(async (candidate) => {
            try {
                const items = await fetchRss(candidate, sourceName, limit);
                return items.length ? items : [];
            } catch {
                return [];
            }
        })
    );

    return results.find((items) => items.length) ?? [];
}

async function fetchJuejinUserPosts(userId: string, sourceName: string, limit: number): Promise<DataItem[]> {
    const response = await ofetch('https://api.juejin.cn/content_api/v1/article/query_list', {
        method: 'POST',
        body: {
            user_id: userId,
            sort_type: 2,
        },
    });

    const data = Array.isArray(response.data) ? response.data : [];
    const list = parseList(data).slice(0, limit);
    const processed = await ProcessFeed(list);
    return processed
        .slice(0, limit)
        .map(({ isShortMsg: _isShortMsg, ...item }) => item)
        .filter((item) => item.title && item.link);
}

async function fetchZhihuColumn(columnIdOrSlug: string, sourceName: string, limit: number): Promise<DataItem[]> {
    const response = await ofetch(`https://www.zhihu.com/api/v4/columns/${columnIdOrSlug}/items`, {
        query: {
            limit,
            offset: 0,
        },
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const items = Array.isArray(response.data) ? response.data : [];
    return items
        .filter((i) => i && typeof i === 'object' && i.type === 'article')
        .map((i) => ({
            title: i.title || '',
            link: i.id ? `https://zhuanlan.zhihu.com/p/${i.id}` : undefined,
            description: i.content || '',
            pubDate: i.updated_time ? parseDate(i.updated_time, 'X') : i.created_time ? parseDate(i.created_time, 'X') : undefined,
            author: normalizeAuthorName(i.author, sourceName),
            category: [sourceName],
        }))
        .filter((i) => i.title && i.link);
}

async function fetchSegmentFaultWeekly(limit: number): Promise<DataItem[]> {
    const listUrl = 'https://segmentfault.com/weekly';
    const { data: listHtml } = await got(listUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
        timeout: 10000,
    });

    const $ = load(listHtml);
    const issues = $('ul.dirlist li')
        .toArray()
        .map((li) => {
            const el = $(li);
            const a = el.find('a[href]').first();
            const dateText = el.find('span').first().text().trim();
            const href = a.attr('href');
            const title = a.text().trim();
            if (!href || !title) {
                return;
            }
            return {
                title,
                link: new URL(href, listUrl).href,
                pubDate: dateText ? parseDate(dateText) : undefined,
            };
        })
        .filter(Boolean)
        .slice(0, limit);

    const items = await Promise.all(
        issues.map((issue) =>
            cache.tryGet(issue.link, async () => {
                const { data: detailHtml } = await got(issue.link, {
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                    timeout: 10000,
                });

                const $ = load(detailHtml);
                const content = $('#__next').html() || '';
                return {
                    title: issue.title,
                    link: issue.link,
                    description: content,
                    pubDate: issue.pubDate,
                    author: 'SegmentFault',
                    category: ['SegmentFault Weekly'],
                };
            })
        )
    );

    return items.filter((i) => i.title && i.link);
}

async function fetchArmbbsWeekly(limit: number): Promise<DataItem[]> {
    const listUrl = 'https://www.armbbs.cn/forum.php?mod=forumdisplay&fid=12&filter=author&orderby=dateline&typeid=104';
    const { data: listBuffer } = await got(listUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
        responseType: 'buffer',
        timeout: 15000,
    });

    const listHtml = iconv.decode(listBuffer, 'gbk');
    const $ = load(listHtml);
    const threads = $('a.s.xst[href]')
        .toArray()
        .map((a) => ({
            title: $(a).text().trim(),
            href: $(a).attr('href'),
        }))
        .filter((t) => t.title && t.href)
        .slice(0, limit)
        .map((t) => ({
            title: t.title,
            link: new URL(t.href!, listUrl).href,
        }));

    const items = await Promise.all(
        threads.map((t) =>
            cache.tryGet(t.link, async () => {
                const { data: detailBuffer } = await got(t.link, {
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                    responseType: 'buffer',
                    timeout: 15000,
                });

                const detailHtml = iconv.decode(detailBuffer, 'gbk');
                const $ = load(detailHtml);

                const title = $('h1').first().text().trim() || t.title;
                const pubDateText = $('em[id^="authorposton"]')
                    .first()
                    .text()
                    .replace(/^发表于\\s*/, '')
                    .trim();
                const content = $('td.t_f').first();

                content.find('img').each((_, img) => {
                    const el = $(img);
                    const src = el.attr('file') || el.attr('src');
                    if (src) {
                        el.attr('src', new URL(src, t.link).href);
                        el.removeAttr('file');
                    }
                });
                content.find('a[href]').each((_, a) => {
                    const el = $(a);
                    const href = el.attr('href');
                    if (href && !href.startsWith('http')) {
                        el.attr('href', new URL(href, t.link).href);
                    }
                });

                return {
                    title,
                    link: t.link,
                    description: content.html() || '',
                    pubDate: pubDateText ? parseDate(pubDateText) : undefined,
                    author: 'armbbs.cn',
                    category: ['安富莱嵌入式周报'],
                };
            })
        )
    );

    return items.filter((i) => i.title && i.link);
}

async function fetchRuanyifengWeekly(limit: number): Promise<DataItem[]> {
    const listUrl = 'https://www.ruanyifeng.com/blog/weekly/';
    const { data: listHtml } = await got(listUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
        timeout: 10000,
    });

    const $ = load(listHtml);
    const issueLinks = $('a[href*="weekly-issue-"]')
        .toArray()
        .map((a) => $(a).attr('href'))
        .filter(Boolean)
        .map((href) => (href!.startsWith('http') ? href! : new URL(href!, listUrl).href));

    const uniqueLinks = [...new Set(issueLinks)].slice(0, limit);

    const items = await Promise.all(
        uniqueLinks.map((link) =>
            cache.tryGet(`journal-tech:ruanyifeng:${link}`, async () => {
                const { data: detailHtml } = await got(link, {
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                    timeout: 10000,
                });

                const $ = load(detailHtml);
                const title = $('h1').first().text().trim() || $('title').text().trim();
                const pubDateText = $('abbr.published').attr('title') || $('meta[property="article:published_time"]').attr('content');
                const content = $('div.entry-content').first();

                return {
                    title,
                    link,
                    description: content.html() || '',
                    pubDate: pubDateText ? parseDate(pubDateText) : undefined,
                    author: '阮一峰',
                    category: ['阮一峰的网络日志'],
                };
            })
        )
    );

    return items.filter((i) => i.title && i.link);
}

async function fetchHowieWeekly(limit: number): Promise<DataItem[]> {
    const listUrl = 'https://weekly.howie6879.com/';
    const { data: listHtml } = await got(listUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
        timeout: 10000,
    });

    const $ = load(listHtml);
    const candidates = $('a[href]')
        .toArray()
        .map((a) => {
            const el = $(a);
            return {
                href: el.attr('href'),
                text: el.text().trim(),
            };
        })
        .filter((a) => a.href && a.text && a.text.includes('第') && a.text.includes('期'))
        .map((a) => ({
            title: a.text,
            link: a.href!.startsWith('http') ? a.href! : new URL(a.href!, listUrl).href,
        }));

    const uniqueLinks = [...new Map(candidates.map((i) => [i.link, i])).values()].slice(0, limit).map((i) => i.link);

    const items = await Promise.all(
        uniqueLinks.map((link) =>
            cache.tryGet(link, async () => {
                const { data: detailHtml } = await got(link, {
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                    timeout: 10000,
                });

                const $ = load(detailHtml);
                const title = $('h1').first().text().trim() || $('title').text().trim();
                const content = $('article').first();

                const pubDate = parseHowieWeeklyPubDate(link);

                return {
                    title,
                    link,
                    description: content.html() || '',
                    pubDate,
                    author: 'howie.hu',
                    category: ['老胡的周刊'],
                };
            })
        )
    );

    return items.filter((i) => i.title && i.link);
}

function parseHowieWeeklyPubDate(link: string): Date | undefined {
    const match = link.match(/\/(\d{4})\/(\d{2})-(\d{2})~(\d{2})-(\d{2})\./);
    if (!match) {
        return undefined;
    }

    const year = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const endDay = Number.parseInt(match[5], 10);
    if (!year || !month || !endDay) {
        return undefined;
    }

    return parseDate(`${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`);
}
