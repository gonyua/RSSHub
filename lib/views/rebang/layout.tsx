import type { FC } from 'hono/jsx';

export const RebangLayout: FC<{ title: string }> = ({ children, title }) => (
    <html lang="zh-CN">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{title}</title>

            <script
                dangerouslySetInnerHTML={{
                    __html: `
                    window.tailwind = window.tailwind || {};
                    window.tailwind.config = {
                      darkMode: 'class',
                      theme: {
                        extend: {
                          colors: {
                            accent: '#D22222'
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
                      --rb-bg: #ffffff;
                      --rb-surface: #ffffff;
                      --rb-surface-2: #f6f7f9;
                      --rb-border: #e5e7eb;
                      --rb-text: rgba(0,0,0,.9);
                      --rb-text-2: rgba(0,0,0,.6);
                      --rb-muted: rgba(0,0,0,.45);
                      --rb-ring: rgba(210,34,34,.35);
                    }
                    .dark {
                      --rb-bg: #0d1117;
                      --rb-surface: #161b22;
                      --rb-surface-2: #0f141b;
                      --rb-border: #333335;
                      --rb-text: rgba(255,255,255,.9);
                      --rb-text-2: rgba(255,255,255,.65);
                      --rb-muted: rgba(255,255,255,.45);
                      --rb-ring: rgba(210,34,34,.35);
                    }

                    html, body { height: 100%; }
                    body {
                      font-family: Inter, -apple-system, system-ui, "PingFang SC", "Hiragino Sans GB", "noto sans", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
                      background: var(--rb-bg);
                      color: var(--rb-text);
                    }

                    ::selection { background: rgba(210,34,34,.35); }
                    .rb-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
                    .rb-scroll::-webkit-scrollbar-thumb { background: rgba(128,128,128,.35); border-radius: 999px; }
                    .rb-scroll::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,.5); }

                    .rb-card { background: var(--rb-surface); border: 1px solid var(--rb-border); }
                    .rb-chip { background: color-mix(in srgb, var(--rb-border) 40%, transparent); }
                    .rb-link { color: var(--rb-text); }
                    .rb-link:hover { color: #D22222; }
                    .rb-ring:focus { outline: none; box-shadow: 0 0 0 3px var(--rb-ring); }

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
                      const saved = localStorage.getItem(key) || 'system';
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
);
