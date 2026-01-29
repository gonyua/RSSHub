# Rebang 前端菜单：缺失/未启用路由站点清单

生成日期：2026-01-27

数据来源：`lib/rebang/config.ts` 的 `rebangMenu`（前端 `/rebang` 菜单），筛选条件为：

- Tab 级别标记 `disabled: true`（菜单中呈现为灰色不可点击）
- 以及通过 `makeDisabledTab(...)` 显式创建的禁用 Tab

如需查看“完整菜单映射（含已启用节点）”，见：`docs/rebang-sources-audit.md`。

> 说明：下文“相关路由（示例）/现有 routes 线索”已对照 `https://docs.rsshub.app/routes/`（仓库内对应 `assets/build/routes.json`）校验，确保示例为文档中存在的可用示例路径。

## 1) 项目中已有路由，但需要配置（Cookie/Token）才能启用

| 站点   | key      | 需要配置              | 相关路由（示例）                                                                  | 备注                                                                                      |
| ------ | -------- | --------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| GitHub | `github` | `GITHUB_ACCESS_TOKEN` | `/github/trending/daily/javascript/en`（实现见 `lib/routes/github/trending.tsx`） | Rebang 菜单中该站点默认禁用；设置 token 后可在 UI 中自动解禁（见 `lib/rebang/menu.ts`）。 |

## 2) 站点在仓库中存在，但 Rebang 需要的“热榜/榜单”路由缺失（因此在菜单里被禁用）

> 2026-01-27：已补齐并在 Rebang 菜单中启用：`douban-community` / `eastmoney` / `kuaishou` / `xiaohongshu`。

> 注：以下站点已补齐/已在菜单中启用（2026-01-27 更新）
>
> - AcFun：新增 `/acfun/rank/:range`（range：`day`/`three`/`week`），并在 Rebang 菜单中启用
> - 百度贴吧：新增 `/baidu/tieba/hottopic`，并在 Rebang 菜单中启用
> - CSDN：新增 `/csdn/rank/:type`（type：`hot`/`day`/`week`/`learning`/`total`/`content`），并在 Rebang 菜单中启用
> - 抖音：新增 `/douyin/hot-search`，并在 Rebang 菜单中启用
> - 今日头条：新增 `/toutiao/hot`，并在 Rebang 菜单中启用
> - 直播吧：在 Rebang 菜单中改用 `/zhibo8/more/other` 近似“热榜”启用（仍无严格等价路由）

## 3) TODO：本仓库完全没有该站点路由（Rebang 菜单中禁用且无可对照的 routes）

- [x] `52pojie`（吾爱破解）：已新增 `/52pojie/hot/:range`（range：`today`/`thisweek`/`thismonth`）
- [x] `appinn`（小众软件）：已新增 `/appinn`
- [x] `apprcn`（反斗限免）：已新增 `/apprcn/:category?`（category：`all`/`ios`/`android`/`game`/`mac`/`windows`）
- [x] `journal-tech`（技术期刊）：已新增 `/journal-tech`
- [x] `kds`（宽带山）：已新增 `/kds/hot/:range`（range：`today`/`weekly`/`monthly`）
- [x] `shadiao-news`（沙雕新闻）：已新增 `/shadiao`（数据源：`shadiao.plus/rss`）

## 附：站点可用，但部分子榜单需要 Cookie/Token（不影响站点 Tab 显示）

| 站点       | 子 Tab                  | 原因（来自 `rebangMenu`）                                  | 相关路由（示例）                                                                   |
| ---------- | ----------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 什么值得买 | `goods-gp` / `goods-bp` | RSSHub 的“什么值得买排行榜”依赖 `SMZDM_COOKIE`，默认不启用 | `/smzdm/ranking/:rank_type/:rank_id/:hour`（实现见 `lib/routes/smzdm/ranking.ts`） |
