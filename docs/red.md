• 这个 RSSHub 仓库里，源码/文档里明确“反爬/风控很强”（常见特征：requirePuppeteer: true、出现 WAF/验证码/Cloudflare challenge/Turnstile、需要 Cookie/登
录）的站点主要有这些：

- 抖音 douyin.com：明确写了“反爬严格，需要启用 puppeteer”，见 lib/routes/douyin/namespace.ts:1（路由前缀 /douyin/...）
- 微博 weibo.com：多数路由需要 WEIBO_COOKIES 或用 Puppeteer 拿访客 Cookie，且有严格 WAF 的处理，见 lib/routes/weibo/namespace.ts:1、lib/routes/weibo/
  utils.ts:595（/weibo/...）
- 小红书 xiaohongshu.com：风控/验证码（#red-captcha，直接抛 CaptchaError），见 lib/routes/xiaohongshu/util.ts:4（/xiaohongshu/...）
- B 站 bilibili.com：动态等会触发风控验证码（CaptchaError），见 lib/routes/bilibili/dynamic.ts:4（/bilibili/...）
- 微信公众号文章 mp.weixin.qq.com：有 WAF 拦截识别与报错处理，见 lib/utils/wechat-mp.ts:542（路由在 lib/routes/wechat/\*）
- 掘金 juejin.cn：有 \_wafchallengeid 挑战并计算 cookie 绕过，见 lib/routes/juejin/utils.ts:20（/juejin/...）
- TikTok tiktok.com：使用 Puppeteer（/tiktok/...）
- LinkedIn linkedin.com：使用 Puppeteer（/linkedin/posts）
- Google Play play.google.com：使用 Puppeteer（/google/play）
- Cloudflare/Turnstile 保护类（需要 Puppeteer/标注 challenge）：品葱（lib/routes/pincong/_）、AlternativeTo（lib/routes/alternativeto/_）、AIP（lib/
  routes/aip/journal-pupp.ts:20）、Picnob（lib/routes/picnob/user.ts:13）
- 其它明确提示反爬/限流：mox.moe（易触发反爬，需 MOX_COOKIE 才能抓详情，见 lib/routes/mox/index.ts:1）、javdb.com（提示不要把 limit 调太高，见 lib/
  routes/javdb/namespace.ts:1）、Freebuf（全文受反爬限制，见 lib/routes/freebuf/index.ts:1）、Wallhaven（429 频控，见 lib/routes/wallhaven/
  namespace.ts:1）

    https://docs.rsshub.app/zh/joinus/new-rss/start-code
    https://docs.rsshub.app/zh/joinus/new-rss/submit-route
    https://docs.rsshub.app/zh/joinus/advanced/script-standard
    https://docs.rsshub.app/zh/joinus/advanced/use-cache
    https://docs.rsshub.app/zh/joinus/advanced/pub-date

    https://docs.rsshub.app/routes/

- 方式 A（推荐本地快速验证）：临时指定系统 Chrome：CHROMIUM_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" 再
  启动 RSSHub（只影响本次进程，不改系统环境变量持久配置）。
- 方式 B：下载 Puppeteer 需要的 Chrome 到项目缓存：pnpm exec rebrowser-puppeteer browsers install chrome（会写到项目目录的缓存里）。
