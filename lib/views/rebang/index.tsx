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
            <header className="sticky top-0 z-50 border-b border-[var(--rb-border)] bg-[color:var(--rb-bg)]/90 backdrop-blur">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="h-14 flex items-center justify-between gap-4">
                        <a className="hidden sm:flex items-center gap-2 font-extrabold tracking-wide text-xl rb-link" href="/rebang">
                            Rebang.Today
                        </a>
                        <button id="rb-mobile-menu" className="sm:hidden rb-card rounded-full w-10 h-10 grid place-items-center rb-ring" type="button" aria-label="菜单">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold text-[color:var(--rb-text-2)]">
                            <a className="rb-link" href="/rebang/following">
                                订阅
                            </a>
                            <a className="rb-link" data-rb-nav="home" href="/rebang">
                                综合
                            </a>
                            <a className="rb-link" data-rb-nav="tech" href="/rebang/tech">
                                科技
                            </a>
                            <a className="rb-link" data-rb-nav="ent" href="/rebang/ent">
                                娱乐
                            </a>
                            <a className="rb-link" data-rb-nav="community" href="/rebang/community">
                                社区
                            </a>
                            <a className="rb-link" data-rb-nav="fin" href="/rebang/fin">
                                财经
                            </a>
                            <a className="rb-link" data-rb-nav="dev" href="/rebang/dev">
                                开发
                            </a>
                        </nav>

                        <div className="flex items-center gap-2">
                            <button id="rb-theme-toggle" className="rb-card rounded-full w-10 h-10 grid place-items-center rb-ring" type="button" aria-label="切换主题">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 3a7 7 0 0 0 0 14 7.5 7.5 0 0 1 0-14z" />
                                    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5" />
                                </svg>
                            </button>
                            <a className="rb-card rounded-full w-10 h-10 grid place-items-center rb-ring" href="/rebang/setting" aria-label="设置">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                                    <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1a2.2 2.2 0 0 1-1.6 3.7 2.1 2.1 0 0 1-1.5-.6l-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6V21a2.2 2.2 0 0 1-4.4 0v-.1a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1a2.1 2.1 0 0 1-1.5.6 2.2 2.2 0 0 1-1.6-3.7l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1.1H3a2.2 2.2 0 0 1 0-4.4h.1a1.8 1.8 0 0 0 1.6-1.1 1.8 1.8 0 0 0-.4-2l-.1-.1A2.2 2.2 0 0 1 6 1.8c.6 0 1.1.2 1.5.6l.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.6V1a2.2 2.2 0 0 1 4.4 0v.1a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1c.4-.4.9-.6 1.5-.6a2.2 2.2 0 0 1 1.6 3.7l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.1H21a2.2 2.2 0 0 1 0 4.4h-.1a1.8 1.8 0 0 0-1.6 1.1z" />
                                </svg>
                            </a>
                            <a className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-full bg-[#2563eb] text-white font-semibold rb-ring" href="/rebang/following">
                                登录
                            </a>
                            <a className="sm:hidden inline-flex items-center justify-center h-10 px-4 rounded-full bg-[#2563eb] text-white font-semibold rb-ring" href="/rebang/following">
                                登录
                            </a>
                        </div>
                    </div>
                </div>
                <div id="rb-mobile-drawer" className="sm:hidden hidden border-t border-[var(--rb-border)]">
                    <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 text-sm font-semibold">
                        <a className="rb-link py-2" href="/rebang/following">
                            订阅
                        </a>
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
                        <a className="rb-link py-2" href="/rebang/following">
                            订阅
                        </a>
                    </div>
                </div>
            </header>

            <main className="grow">
                <div className="mx-auto max-w-6xl px-4 py-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <section className="flex-1 min-w-0">
                            <div id="rb-page-list" className="space-y-4">
                                <div id="rb-tab-bar" className="rb-card rounded-xl p-3 rb-scroll overflow-x-auto">
                                    <div className="flex items-center gap-2" id="rb-tabs"></div>
                                </div>

                                <div className="rb-card rounded-xl overflow-hidden">
                                    <div className="border-b border-[var(--rb-border)] px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div id="rb-subtabs" className="flex items-center gap-3 text-sm font-semibold"></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select id="rb-node-select" className="rb-card text-sm px-3 py-2 rounded-lg rb-ring">
                                                <option value="">全部节点</option>
                                            </select>
                                            <span className="text-[color:var(--rb-muted)] text-sm" id="rb-status"></span>
                                        </div>
                                    </div>

                                    <ul id="rb-items" className="divide-y divide-[var(--rb-border)]"></ul>
                                </div>
                            </div>

                            <div id="rb-page-setting" className="hidden space-y-4">
                                <div className="rb-card rounded-xl p-4">
                                    <div className="flex items-start gap-3 bg-amber-50 text-amber-900 dark:bg-[#2a1e07] dark:text-amber-200 border border-amber-200 dark:border-[#5a3f10] rounded-lg p-3">
                                        <div className="mt-0.5">⚠️</div>
                                        <div className="text-sm">
                                            未登录，修改将保存在本地，
                                            <a className="underline" href="/rebang/following">
                                                登录
                                            </a>{' '}
                                            后可保存至云端（MVP 暂不支持）
                                        </div>
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
                                                <button id="rb-setting-blockword-add" className="h-10 px-4 rounded-lg bg-[#2563eb] text-white font-semibold rb-ring" type="button">
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
                                    <div className="text-lg font-bold mb-2">订阅你喜欢的内容，请登录后使用</div>
                                    <a href="/rebang" className="inline-flex mt-4 items-center justify-center h-10 px-4 rounded-full bg-[#2563eb] text-white font-semibold rb-ring">
                                        去登录
                                    </a>
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

                            <div className="rb-card rounded-xl p-4 text-sm text-[color:var(--rb-text-2)]">数据来自本项目（RSSHub）路由输出；MVP 仅接入少量节点，后续可扩展。</div>
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
                        <span>·</span>
                        <a className="rb-link" href="/rebang/following">
                            订阅
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
