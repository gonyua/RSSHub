import { writeFile } from 'node:fs/promises';

import pMap from 'p-map';

import { config } from '@/config';
import { journalTechSources } from '@/routes/journal-tech';
import ofetch from '@/utils/ofetch';

type ProbeResult = { ok: boolean; status?: number; finalUrl?: string; error?: string };

const isHttpOk = (status: number) => status >= 200 && status < 400;

const formatError = (error: unknown): string => {
    if (error instanceof AggregateError) {
        const errors = (error as unknown as { errors?: unknown[] }).errors ?? [];
        const parts = errors.map((e) => (e instanceof Error ? e.message : String(e)));
        return parts.filter(Boolean).join('; ') || error.message;
    }
    if (error instanceof Error) {
        const cause = error.cause;
        if (cause) {
            return formatError(cause);
        }
        return error.message;
    }
    return String(error);
};

const probeUrl = async (url: string, timeoutMs = 8000): Promise<ProbeResult> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await ofetch.raw(url, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'User-Agent': config.trueUA,
            },
            signal: controller.signal,
        });

        const ok = isHttpOk(res.status);
        return { ok, status: res.status, finalUrl: res.url, error: ok ? undefined : `HTTP ${res.status}` };
    } catch (error_) {
        return { ok: false, error: formatError(error_) };
    } finally {
        clearTimeout(timer);
    }
};

const escapePipe = (text: unknown) =>
    String(text ?? '')
        .replaceAll('|', String.raw`\|`)
        .replaceAll('\n', ' ');

const toCode = (text: unknown) => `\`${String(text ?? '')}\``;

const run = async () => {
    const startedAt = new Date();
    const fetchOptions = { perSourceLimit: 5, weeklyIssueLimit: 5 };

    const results = await pMap(
        journalTechSources,
        async (source) => {
            const homepageProbe = await probeUrl(source.homepage);
            const contentProbe = source.probeUrl === source.homepage ? homepageProbe : await probeUrl(source.probeUrl);

            if (!contentProbe.ok) {
                return { source, homepageProbe, contentProbe, fetch: { skipped: true as const } };
            }

            try {
                const items = await source.fetch(fetchOptions);
                return {
                    source,
                    homepageProbe,
                    contentProbe,
                    fetch: {
                        skipped: false as const,
                        count: items.length,
                        sampleTitle: items[0]?.title ?? '',
                        sampleLink: items[0]?.link ?? '',
                    },
                };
            } catch (error_) {
                const error = error_ instanceof Error ? error_ : new Error(String(error_));
                return {
                    source,
                    homepageProbe,
                    contentProbe,
                    fetch: { skipped: false as const, count: 0, error: error.message },
                };
            }
        },
        { concurrency: 4 }
    );

    const total = results.length;
    const homepageAccessible = results.filter((r) => r.homepageProbe.ok).length;
    const contentAccessible = results.filter((r) => r.contentProbe.ok).length;
    const fetchedOk = results.filter((r) => !r.fetch.skipped && 'count' in r.fetch && r.fetch.count > 0).length;
    const homepageInaccessible = results.filter((r) => !r.homepageProbe.ok).length;
    const contentInaccessible = results.filter((r) => !r.contentProbe.ok).length;
    const fetchedZeroOrError = results.filter((r) => !r.fetch.skipped && ('error' in r.fetch || r.fetch.count === 0)).length;

    const lines: string[] = [
        '# journal-tech 博主源站可达性与抓取情况',
        '',
        `生成时间：${startedAt.toISOString()}`,
        '',
        '## 汇总',
        '',
        `- 总数：${total}`,
        `- 首页可访问（2xx/3xx）：${homepageAccessible}`,
        `- 首页不可访问（非 2xx/3xx 或网络错误）：${homepageInaccessible}`,
        `- 内容入口可访问（2xx/3xx）：${contentAccessible}`,
        `- 内容入口不可访问（非 2xx/3xx 或网络错误）：${contentInaccessible}`,
        `- 抓取成功（返回条目数 > 0）：${fetchedOk}`,
        `- 抓取失败/空结果（尝试抓取但报错或 0 条）：${fetchedZeroOrError}`,
        '',
        '## 明细',
        '',
        '| # | 博主 | 源站（首页） | 首页探测 | 内容入口探测 | 抓取结果 |',
        '| -: | - | - | - | - | - |',
    ];

    for (const [idx, r] of results.entries()) {
        const sourceCell = toCode(r.source.homepage);

        const homepageProbeCell = r.homepageProbe.ok ? `${toCode(String(r.homepageProbe.status))} → ${toCode(r.homepageProbe.finalUrl)}` : `${toCode(String(r.homepageProbe.status ?? 'ERR'))} ${escapePipe(r.homepageProbe.error)}`;

        const contentProbeUrl = r.source.probeUrl === r.source.homepage ? '' : ` ${toCode(r.source.probeUrl)}`;
        const contentProbeCell = r.contentProbe.ok
            ? `${toCode(String(r.contentProbe.status))} → ${toCode(r.contentProbe.finalUrl)}${contentProbeUrl}`
            : `${toCode(String(r.contentProbe.status ?? 'ERR'))} ${escapePipe(r.contentProbe.error)}${contentProbeUrl}`;

        const fetchCell = r.fetch.skipped
            ? '跳过（内容入口不可访问）'
            : 'error' in r.fetch
              ? `失败：${escapePipe(r.fetch.error)}`
              : r.fetch.count > 0
                ? `${r.fetch.count} 条；示例：${escapePipe(r.fetch.sampleTitle)} ${toCode(r.fetch.sampleLink)}`
                : '0 条';

        lines.push(`| ${idx + 1} | ${escapePipe(r.source.name)} | ${sourceCell} | ${homepageProbeCell} | ${contentProbeCell} | ${fetchCell} |`);
    }

    lines.push(
        '',
        '## 说明',
        '',
        '- “源站探测”使用 `GET`（不读取正文，立即取消流）判断 HTTP 状态码是否为 2xx/3xx。',
        '- `lib/routes/journal-tech/index.ts` 会先探测源站可达性，再决定是否抓取该源站的内容。',
        '- 该报告反映的是生成时刻的网络环境结果，不代表长期稳定可用。'
    );

    await writeFile('docs/journal-tech-sources-report.md', lines.join('\n'), 'utf8');
};

await run();
