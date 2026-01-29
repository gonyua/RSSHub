import { raw } from 'hono/html';
import type { FC } from 'hono/jsx';

export const RebangLayout: FC<{ title: string }> = ({ children, title }) => (
    <>
        {raw('<!DOCTYPE html>')}
        <html lang="zh-CN">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{title}</title>

                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                    window.tailwind = window.tailwind || {};
                    tailwind.config = {
                      darkMode: 'class',
                      theme: {
                        extend: {
                          colors: {
                            accent: '#165DFF'
                          }
                        }
                      }
                    };
                    `,
                    }}
                ></script>
                <script src="https://cdn.tailwindcss.com"></script>

                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    :root {
                      --rb-bg: #f4f6f8;
                      --rb-surface: #ffffff;
                      --rb-surface-2: #f5f6f7;
                      --rb-border: #e5e7eb;
                      --rb-text: #1d2129;
                      --rb-text-2: #4e5969;
                      --rb-muted: #86909c;
                      --rb-accent: #165DFF;
                      --rb-accent-bg: #e8f3ff;
                      --rb-ring: rgba(22,93,255,.35);
                    }
                    .dark {
                      --rb-bg: #0d1117;
                      --rb-surface: #161b22;
                      --rb-surface-2: #0f141b;
                      --rb-border: #333335;
                      --rb-text: rgba(255,255,255,.9);
                      --rb-text-2: rgba(255,255,255,.65);
                      --rb-muted: rgba(255,255,255,.45);
                      --rb-accent: #165DFF;
                      --rb-accent-bg: rgba(22,93,255,.18);
                      --rb-ring: rgba(22,93,255,.35);
                    }

                    html, body { height: 100%; }
                    body {
                      font-family: Inter, -apple-system, system-ui, "PingFang SC", "Hiragino Sans GB", "noto sans", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
                      font-size: 14px;
                      line-height: 21px;
                      background: var(--rb-bg);
                      color: var(--rb-text);
                    }

                    ::selection { background: var(--rb-ring); }
                    .rb-scroll::-webkit-scrollbar { display: none; }
                    .rb-scroll { -ms-overflow-style: none; scrollbar-width: none; }

                    .rb-card { background: var(--rb-surface); border: 1px solid var(--rb-border); box-shadow: 0 1px 2px rgba(0,0,0,.04); transition: all .2s ease-in-out; }
                    .dark .rb-card { box-shadow: none; }
                    .rb-chip { background: color-mix(in srgb, var(--rb-border) 40%, transparent); }
                    .rb-link { color: inherit; }
                    .rb-link:hover { color: var(--rb-accent); }
                    .rb-ring:focus { outline: none; box-shadow: 0 0 0 3px var(--rb-ring); }
                    #rb-tabs [data-rb-tab].rb-ring:focus { box-shadow: none; }
                    #rb-tabs [data-rb-tab].rb-ring:focus-visible { box-shadow: 0 0 0 2px var(--rb-border); }

                    .rb-icon-dark { display: none; }
                    .dark .rb-icon-dark { display: inline-block; }
                    .dark .rb-icon-light { display: none; }

                    .rb-site-tab-active { background: var(--rb-surface-2); color: var(--rb-accent); font-weight: 500; }
                    .rb-site-tab-inactive:hover { background: var(--rb-surface-2); color: var(--rb-text); }

                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                    #rb-tab-expand { border-radius: 8px; }

                    #rb-items > li { transition: all .2s ease-in-out; }
                    #rb-items > li:hover { background: var(--rb-surface-2); }
                    #rb-items > li:hover .rb-link { color: var(--rb-accent); }

                    .line-clamp-2 {
                      display: -webkit-box;
                      -webkit-box-orient: vertical;
                      -webkit-line-clamp: 2;
                      overflow: hidden;
                    }
                    `,
                    }}
                ></style>

                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                    (() => {
                      const key = 'rebang:theme';
                      const saved = localStorage.getItem(key) || 'light';
                      const mql = window.matchMedia('(prefers-color-scheme: dark)');
                      const apply = () => {
                        const shouldDark = saved === 'dark' || (saved === 'system' && mql.matches);
                        document.documentElement.classList.toggle('dark', shouldDark);
                      };
                      apply();
                      mql.addEventListener?.('change', apply);
                    })();
                    `,
                    }}
                ></script>
            </head>
            <body className="antialiased min-h-screen">{children}</body>
        </html>
    </>
);
