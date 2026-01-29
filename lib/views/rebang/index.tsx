import { raw } from 'hono/html';
import type { FC } from 'hono/jsx';

import { getRebangMenuForUi } from '@/rebang/menu';
import { RebangLayout } from '@/views/rebang/layout';

type Props = {
    path: string;
    title: string;
};

const RebangView: FC<Props> = ({ path, title }) => (
    <RebangLayout title={title}>
        <div id="rebang-root" data-path={path} className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 border-b border-[var(--rb-border)] bg-[color:var(--rb-surface)]">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="h-[59px] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-8">
                            <button id="rb-mobile-menu" className="sm:hidden rb-card rounded-full w-10 h-10 grid place-items-center rb-ring" type="button" aria-label="菜单">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <a className="hidden sm:flex items-center gap-2 font-extrabold tracking-wide text-xl rb-link" href="/rebang">
                                Rebang
                            </a>

                            <nav className="hidden sm:flex items-center gap-8 text-[16px] font-medium text-[color:var(--rb-text-2)]">
                                <a className="rb-link h-14 inline-flex items-center border-b-2 border-transparent" data-rb-nav="home" href="/rebang">
                                    综合
                                </a>
                                <a className="rb-link h-14 inline-flex items-center border-b-2 border-transparent" data-rb-nav="tech" href="/rebang/tech">
                                    科技
                                </a>
                                <a className="rb-link h-14 inline-flex items-center border-b-2 border-transparent" data-rb-nav="ent" href="/rebang/ent">
                                    娱乐
                                </a>
                                <a className="rb-link h-14 inline-flex items-center border-b-2 border-transparent" data-rb-nav="community" href="/rebang/community">
                                    社区
                                </a>
                                <a className="rb-link h-14 inline-flex items-center border-b-2 border-transparent" data-rb-nav="fin" href="/rebang/fin">
                                    财经
                                </a>
                                <a className="rb-link h-14 inline-flex items-center border-b-2 border-transparent" data-rb-nav="dev" href="/rebang/dev">
                                    开发
                                </a>
                            </nav>
                        </div>

                        <div className="flex items-center gap-2">
                            <button id="rb-theme-toggle" className="rb-card rounded-full w-10 h-10 grid place-items-center rb-ring" type="button" aria-label="切换主题">
                                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="w-5 h-5 rb-icon-light" aria-hidden="true" focusable="false">
                                    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
                                </svg>
                                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="w-5 h-5 rb-icon-dark" aria-hidden="true" focusable="false">
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M12 2v2" />
                                    <path d="M12 20v2" />
                                    <path d="m4.93 4.93 1.41 1.41" />
                                    <path d="m17.66 17.66 1.41 1.41" />
                                    <path d="M2 12h2" />
                                    <path d="M20 12h2" />
                                    <path d="m6.34 17.66-1.41 1.41" />
                                    <path d="m19.07 4.93-1.41 1.41" />
                                </svg>
                            </button>
                            <a className="rb-card rounded-full w-10 h-10 grid place-items-center rb-ring" href="/rebang/setting" aria-label="设置">
                                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" focusable="false">
                                    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div id="rb-mobile-drawer" className="sm:hidden hidden border-t border-[var(--rb-border)]">
                    <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 text-sm font-semibold">
                        <a className="rb-link py-2" href="/rebang">
                            综合
                        </a>
                        <a className="rb-link py-2" href="/rebang/tech">
                            科技
                        </a>
                        <a className="rb-link py-2" href="/rebang/ent">
                            娱乐
                        </a>
                        <a className="rb-link py-2" href="/rebang/community">
                            社区
                        </a>
                        <a className="rb-link py-2" href="/rebang/fin">
                            财经
                        </a>
                        <a className="rb-link py-2" href="/rebang/dev">
                            开发
                        </a>
                        <a className="rb-link py-2" href="/rebang/setting">
                            设置
                        </a>
                    </div>
                </div>
            </header>

            <main className="grow">
                <div className="mx-auto max-w-6xl px-4 py-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <section className="flex-1 min-w-0">
                            <div id="rb-page-list" className="space-y-4">
                                <div id="rb-tab-bar" className="relative flex items-center border-b lg:border border-[var(--rb-border)] mb-2 lg:pt-2 pb-2 lg:rounded-md bg-[color:var(--rb-surface)] px-3 shadow-sm">
                                    <div id="rb-tabs-container" className="flex-1 overflow-x-auto no-scrollbar">
                                        <div className="flex items-center gap-1.5 w-full" id="rb-tabs"></div>
                                    </div>
                                    <button
                                        id="rb-tab-expand"
                                        className="absolute right-3 flex items-center gap-1 pl-3 pr-1 py-2 rounded-lg text-[13px] border border-[var(--rb-border)] bg-[color:var(--rb-surface-2)] text-[color:var(--rb-text-2)] hover:text-[color:var(--rb-text)] rb-ring hidden"
                                        type="button"
                                    >
                                        <span id="rb-tab-expand-text">展开</span>
                                        <svg id="rb-tab-expand-icon" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="rb-card rounded-md overflow-hidden">
                                    <div className="border-b border-[var(--rb-border)] bg-[color:var(--rb-surface)] px-3 py-2 flex items-center gap-3">
                                        <div id="rb-subtabs" className="flex items-center gap-4 text-sm font-semibold"></div>
                                        <div id="rb-journal-source-filter" className="hidden relative">
                                            <button
                                                id="rb-journal-source-filter-btn"
                                                type="button"
                                                className="border border-[var(--rb-border)] bg-[color:var(--rb-surface)] text-sm px-2 h-8 rounded-md rb-ring inline-flex items-center gap-1.5"
                                            >
                                                <span id="rb-journal-source-filter-label">全部博主</span>
                                                <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 9l6 6 6-6" />
                                                </svg>
                                            </button>
                                            <div
                                                id="rb-journal-source-filter-panel"
                                                className="hidden absolute left-0 mt-2 w-72 max-w-[80vw] rb-card rounded-lg overflow-hidden shadow-lg border border-[var(--rb-border)] bg-[color:var(--rb-surface)] z-20"
                                            >
                                                <div id="rb-journal-source-filter-list" className="max-h-[60vh] overflow-auto p-2 space-y-1"></div>
                                                <div className="border-t border-[var(--rb-border)] bg-[color:var(--rb-surface)] px-2 py-2 flex items-center justify-between">
                                                    <button id="rb-journal-source-filter-toggle-all" type="button" className="text-sm text-[color:var(--rb-text-2)] hover:text-[color:var(--rb-text)] rb-ring px-2 py-1 rounded-md">
                                                        取消全选
                                                    </button>
                                                    <button
                                                        id="rb-journal-source-filter-save"
                                                        type="button"
                                                        className="text-sm text-[#165DFF] font-semibold rb-ring px-2 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled
                                                    >
                                                        保存
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <select id="rb-node-select" className="ml-auto border border-[var(--rb-border)] bg-[color:var(--rb-surface)] text-sm px-2 h-8 w-28 rounded-md rb-ring">
                                            <option value="">全部节点</option>
                                        </select>
                                    </div>
                                    <div id="rb-status" className="hidden px-3 py-2 text-sm text-[#ef4444] bg-[color:var(--rb-surface)]"></div>

                                    <ul id="rb-items" className="divide-y divide-[var(--rb-border)]"></ul>
                                </div>
                            </div>

                            <div id="rb-page-setting" className="hidden space-y-4">
                                <div className="rb-card rounded-xl p-4">
                                    <div className="flex items-start gap-3 bg-amber-50 text-amber-900 dark:bg-[#2a1e07] dark:text-amber-200 border border-amber-200 dark:border-[#5a3f10] rounded-lg p-3">
                                        <div className="mt-0.5">⚠️</div>
                                        <div className="text-sm">未登录，修改将保存在本地。</div>
                                    </div>

                                    <div className="mt-4 space-y-6">
                                        <div>
                                            <div className="font-bold mb-2">颜色主题</div>
                                            <div className="flex flex-wrap gap-2" id="rb-setting-theme"></div>
                                        </div>

                                        <div>
                                            <div className="font-bold mb-2">打开链接方式</div>
                                            <div className="flex flex-wrap gap-4 text-sm" id="rb-setting-openLink"></div>
                                        </div>

                                        <div>
                                            <div className="font-bold mb-2">列表展示</div>
                                            <div className="flex flex-wrap gap-4 text-sm" id="rb-setting-listDisplay"></div>
                                        </div>

                                        <div>
                                            <div className="font-bold mb-2">选项卡默认</div>
                                            <div className="flex flex-wrap gap-4 text-sm" id="rb-setting-tabBarDefault"></div>
                                        </div>

                                        <div>
                                            <div className="font-bold mb-2">默认菜单</div>
                                            <select id="rb-setting-defaultMenu" className="rb-card text-sm px-3 py-2 rounded-lg rb-ring"></select>
                                        </div>

                                        <div>
                                            <div className="font-bold mb-2">自定义屏蔽词</div>
                                            <div className="flex items-center gap-2">
                                                <input id="rb-setting-blockword" className="rb-card text-sm px-3 py-2 rounded-lg rb-ring w-full" placeholder="请输入屏蔽词" />
                                                <button id="rb-setting-blockword-add" className="h-10 px-4 rounded-lg bg-[#165DFF] text-white font-semibold rb-ring" type="button">
                                                    添加
                                                </button>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2" id="rb-setting-blockwords"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="rb-page-following" className="hidden">
                                <div className="rb-card rounded-xl p-6">
                                    <div className="text-lg font-bold mb-2">订阅功能暂未开放</div>
                                    <div className="text-sm text-[color:var(--rb-text-2)]">当前版本暂不提供订阅能力。</div>
                                </div>
                            </div>
                        </section>

                        <aside className="hidden lg:block w-80 shrink-0 space-y-4">
                            <div className="rb-card rounded-xl overflow-hidden">
                                <div className="p-3 border-b border-[var(--rb-border)]">
                                    <input id="rb-search" className="rb-card w-full px-3 py-2 rounded-lg text-sm rb-ring" placeholder="搜索当前列表..." />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="font-bold">全站飙升榜</div>
                                        <button id="rb-rising-refresh" className="text-sm text-[color:var(--rb-text-2)] hover:text-[color:var(--rb-text)] rb-ring" type="button">
                                            换一换
                                        </button>
                                    </div>
                                    <ol id="rb-rising" className="space-y-3"></ol>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <footer className="border-t border-[var(--rb-border)] text-sm text-[color:var(--rb-muted)]">
                <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <a className="rb-link" href="https://support.qq.com/products/434778" target="_blank" rel="noreferrer">
                            反馈 建议
                        </a>
                        <span>·</span>
                        <a className="rb-link" href="/rebang/setting">
                            设置
                        </a>
                    </div>
                    <div>©{new Date().getFullYear()} Rebang Clone</div>
                </div>
            </footer>
        </div>

        <script id="rb-menu" type="application/json">
            {raw(JSON.stringify(getRebangMenuForUi()))}
        </script>
        <script type="module" src="/rebang/app.js"></script>
    </RebangLayout>
);

export default RebangView;
