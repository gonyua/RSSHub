export type RebangCategoryKey = 'community' | 'dev' | 'ent' | 'fin' | 'home' | 'tech';

export type RebangTabType = 'aggregate' | 'feed';

export type RebangThemeSetting = 'dark' | 'light' | 'system';

export type RebangOpenLinkSetting = 'current' | 'new';

export type RebangListDisplaySetting = 'compact' | 'full' | 'noimage';

export type RebangTabBarDefaultSetting = 'collapsed' | 'expanded';

export type RebangSubTab = {
    key: string;
    name: string;
    rsshubPath?: string;
    disabled?: boolean;
    disabledReason?: string;
};

export type RebangAggregateSource = {
    key: string;
    name: string;
    rsshubPath: string;
};

export type RebangTab = {
    key: string;
    name: string;
    iconText?: string;
    type: RebangTabType;
    rsshubPath?: string;
    subTabs?: RebangSubTab[];
    defaultSubTabKey?: string;
    aggregateSources?: RebangAggregateSource[];
    disabled?: boolean;
    disabledReason?: string;
};

export type RebangCategory = {
    key: RebangCategoryKey;
    name: string;
    path: string;
    tabs: RebangTab[];
    defaultTabKey: string;
};

export type RebangMenu = {
    version: number;
    categories: RebangCategory[];
};

const makeDisabledSubTab = (key: string, name: string, disabledReason: string): RebangSubTab => ({
    key,
    name,
    disabled: true,
    disabledReason,
});

// const makeDisabledTab = (key: string, name: string, iconText: string, disabledReason: string): RebangTab => ({
//     key,
//     name,
//     iconText,
//     type: 'feed',
//     disabled: true,
//     disabledReason,
// });

const aggregateSources: RebangAggregateSource[] = [
    { key: 'zhihu', name: '知乎', rsshubPath: '/zhihu/hot' },
    { key: 'ithome-24h', name: 'IT之家', rsshubPath: '/ithome/ranking/24h' },
    { key: 'hupu', name: '虎扑', rsshubPath: '/hupu/all/topic-daily' },
    { key: 'juejin-weekly', name: '掘金', rsshubPath: '/juejin/trending/all/weekly' },
];

const ithomeSubTabs: RebangSubTab[] = [
    { key: 'today', name: '日榜', rsshubPath: '/ithome/ranking/24h' },
    { key: 'latest', name: '最新', rsshubPath: '/ithome/it' },
    { key: 'weekly', name: '周榜', rsshubPath: '/ithome/ranking/7days' },
    { key: 'monthly', name: '月榜', rsshubPath: '/ithome/ranking/monthly' },
];

const hupuSubTabs: RebangSubTab[] = [
    { key: 'all-gambia', name: '步行街', rsshubPath: '/hupu/all/all-gambia' },
    { key: 'all-nba', name: 'NBA', rsshubPath: '/hupu/all/all-nba' },
    { key: 'all-gg', name: '游戏', rsshubPath: '/hupu/all/all-gg' },
    { key: 'all-digital', name: '数码', rsshubPath: '/hupu/all/all-digital' },
    { key: 'all-ent', name: '影视娱乐', rsshubPath: '/hupu/all/all-ent' },
    { key: 'all-soccer', name: '国际足球', rsshubPath: '/hupu/all/all-soccer' },
];

const weiboSubTabs: RebangSubTab[] = [{ key: 'search', name: '热搜', rsshubPath: '/weibo/search/hot' }, makeDisabledSubTab('ent', '文娱', 'RSSHub 暂无与该子榜单等价路由')];

const doubanCommunitySubTabs: RebangSubTab[] = [
    { key: 'discussion', name: '精选讨论', rsshubPath: '/douban/community/discussion' },
    { key: 'topic', name: '热门话题', rsshubPath: '/douban/community/topic' },
    { key: 'group', name: '发现小组', rsshubPath: '/douban/community/group' },
];

const huxiuSubTabs: RebangSubTab[] = [
    { key: 'hot', name: '热文', rsshubPath: '/huxiu/article' },
    { key: 'latest', name: '最新', rsshubPath: '/huxiu/moment' },
    makeDisabledSubTab('event', '号外', 'RSSHub 暂无等价“号外”榜单，已留位'),
];

const sspaiSubTabs: RebangSubTab[] = [
    { key: 'recommend', name: '推荐', rsshubPath: '/sspai/index' },
    { key: 'hottest', name: '最热', rsshubPath: '/sspai/matrix', disabledReason: 'RSSHub 无“最热”直出路由，此处用 Matrix 近似' },
];

const thepaperSubTabs: RebangSubTab[] = [{ key: 'hot', name: '热榜', rsshubPath: '/thepaper/sidebar/hotNews' }];

const xiaohongshuSubTabs: RebangSubTab[] = [{ key: 'hot-search', name: '热点', rsshubPath: '/xiaohongshu/hot-search' }];

const kr36SubTabs: RebangSubTab[] = [
    { key: 'hotlist', name: '热榜', rsshubPath: '/36kr/recommend', disabledReason: 'RSSHub 无“36氪热榜”直出路由，此处用推荐近似' },
    { key: 'latest', name: '最新', rsshubPath: '/36kr/news' },
    { key: 'newsflashes', name: '快讯', rsshubPath: '/36kr/newsflashes' },
];

const doubanMediaSubTabs: RebangSubTab[] = [
    { key: 'movie', name: '电影', rsshubPath: '/douban/movie/coming', disabledReason: 'RSSHub 暂无“豆瓣电影热榜”直出路由，此处用“即将上映”近似' },
    makeDisabledSubTab('tv', '电视', 'RSSHub 暂无“豆瓣电视热榜”类路由'),
    { key: 'book', name: '读书', rsshubPath: '/douban/book/rank' },
    makeDisabledSubTab('music', '音乐', 'RSSHub 暂无“豆瓣音乐热榜”类路由'),
];

const smzdmSubTabs: RebangSubTab[] = [
    { key: 'post', name: '好文', rsshubPath: '/smzdm/haowen/1' },
    makeDisabledSubTab('goods-gp', '好价', 'RSSHub 的“什么值得买排行榜”依赖 SMZDM_COOKIE，默认不启用'),
    makeDisabledSubTab('goods-bp', '白菜价', 'RSSHub 的“什么值得买排行榜”依赖 SMZDM_COOKIE，默认不启用'),
];

const baiduSubTabs: RebangSubTab[] = [
    { key: 'realtime', name: '热搜', rsshubPath: '/baidu/top/realtime' },
    makeDisabledSubTab('phrase', '热梗', 'RSSHub 的 `/baidu/top` 未提供“热梗”tab'),
    { key: 'novel', name: '小说', rsshubPath: '/baidu/top/novel' },
    { key: 'movie', name: '电影', rsshubPath: '/baidu/top/movie' },
    { key: 'teleplay', name: '电视剧', rsshubPath: '/baidu/top/teleplay' },
    { key: 'car', name: '汽车', rsshubPath: '/baidu/top/car' },
    { key: 'game', name: '游戏', rsshubPath: '/baidu/top/game' },
];

const pentiSubTabs: RebangSubTab[] = [
    { key: 'tugua', name: '喷嚏图卦', rsshubPath: '/dapenti/tugua' },
    makeDisabledSubTab('fushihui', '浮世汇', 'RSSHub 仅有 `/dapenti/subject/:id`，需先确定栏目对应 id'),
    makeDisabledSubTab('lehuo', '乐活', 'RSSHub 仅有 `/dapenti/subject/:id`，需先确定栏目对应 id'),
    makeDisabledSubTab('caijing', '财经风云', 'RSSHub 仅有 `/dapenti/subject/:id`，需先确定栏目对应 id'),
    makeDisabledSubTab('leying', '乐影', 'RSSHub 仅有 `/dapenti/subject/:id`，需先确定栏目对应 id'),
    makeDisabledSubTab('shijieguan', '世界观', 'RSSHub 仅有 `/dapenti/subject/:id`，需先确定栏目对应 id'),
];

const neteaseNewsSubTabs: RebangSubTab[] = [
    { key: 'htd', name: '热议榜', rsshubPath: '/163/news/rank/whole/follow/day' },
    { key: 'news', name: '新闻榜', rsshubPath: '/163/news/rank/whole/click/day' },
    makeDisabledSubTab('video', '视频榜', 'RSSHub 暂无“网易新闻视频榜”类路由'),
];

const wereadSubTabs: RebangSubTab[] = [
    { key: 'rising', name: '飙升榜', rsshubPath: '/qq/weread/rising' },
    { key: 'newbook', name: '新书榜', rsshubPath: '/qq/weread/newbook' },
    { key: 'general_novel_rising', name: '小说榜', rsshubPath: '/qq/weread/general_novel_rising' },
    { key: 'all', name: '总榜', rsshubPath: '/qq/weread/all' },
    { key: 'newrating_publish', name: '神作榜', rsshubPath: '/qq/weread/newrating_publish' },
    { key: 'newrating_potential_publish', name: '神作潜力榜', rsshubPath: '/qq/weread/newrating_potential_publish' },
    { key: 'hot_search', name: '热搜榜', rsshubPath: '/qq/weread/hot_search' },
];

const baiduTiebaSubTabs: RebangSubTab[] = [{ key: 'topic', name: '热门话题', rsshubPath: '/baidu/tieba/hottopic' }];

const pojieSubTabs: RebangSubTab[] = [
    { key: 'today', name: '今日', rsshubPath: '/52pojie/hot/today' },
    { key: 'thisweek', name: '本周', rsshubPath: '/52pojie/hot/thisweek' },
    { key: 'thismonth', name: '本月', rsshubPath: '/52pojie/hot/thismonth' },
];

const guanchaUserSubTabs: RebangSubTab[] = [
    { key: 'hot-3', name: '24小时', rsshubPath: '/guancha/fengwen', disabledReason: 'RSSHub 无对应时间维度，此处用“风闻”近似' },
    { key: 'hot-6', name: '3天', rsshubPath: '/guancha/fengwen', disabledReason: 'RSSHub 无对应时间维度，此处用“风闻”近似' },
    { key: 'hot-7', name: '7天', rsshubPath: '/guancha/fengwen', disabledReason: 'RSSHub 无对应时间维度，此处用“风闻”近似' },
    { key: 'hot-8', name: '3个月', rsshubPath: '/guancha/fengwen', disabledReason: 'RSSHub 无对应时间维度，此处用“风闻”近似' },
];

const xueqiuSubTabs: RebangSubTab[] = [
    { key: 'topic', name: '话题', rsshubPath: '/xueqiu/hots', disabledReason: 'RSSHub 无“话题榜”直出路由，此处用热帖近似' },
    { key: 'news', name: '新闻', rsshubPath: '/xueqiu/today', disabledReason: 'RSSHub 无“新闻榜”直出路由，此处用今日近似' },
    makeDisabledSubTab('notice', '公告', 'RSSHub 暂无“雪球公告榜”类路由'),
];

const landianSubTabs: RebangSubTab[] = [
    { key: 'article', name: '文章', rsshubPath: '/landiannews' },
    { key: 'download', name: '下载', rsshubPath: '/landiannews/category/download' },
];

const bilibiliSubTabs: RebangSubTab[] = [
    { key: 'popular', name: '热门', rsshubPath: '/bilibili/popular/all' },
    { key: 'weekly', name: '每周必看', rsshubPath: '/bilibili/weekly' },
    { key: 'rank', name: '排行榜', rsshubPath: '/bilibili/ranking/all' },
];

const xmypSubTabs: RebangSubTab[] = [{ key: 'zhongchou', name: '众筹', rsshubPath: '/xiaomiyoupin/crowdfunding' }];

const gamerskySubTabs: RebangSubTab[] = [
    { key: 'rec', name: '今日推荐', rsshubPath: '/gamersky/news/today' },
    { key: 'spg', name: '单机电玩', rsshubPath: '/gamersky/news/pc' },
    { key: 'ns', name: 'NS', rsshubPath: '/gamersky/news/ns' },
    { key: 'mobile', name: '手游', rsshubPath: '/gamersky/news/mobile' },
    { key: 'online', name: '网游', rsshubPath: '/gamersky/news/web' },
    { key: 'industry', name: '业界', rsshubPath: '/gamersky/news/industry' },
    { key: 'hardware', name: '硬件', rsshubPath: '/gamersky/news/hardware' },
    { key: 'tech', name: '科技', rsshubPath: '/gamersky/news/tech' },
];

const juejinSubTabs: RebangSubTab[] = [
    { key: 'all', name: '综合', rsshubPath: '/juejin/trending/all/weekly' },
    { key: 'backend', name: '后端', rsshubPath: '/juejin/trending/backend/weekly' },
    { key: 'frontend', name: '前端', rsshubPath: '/juejin/trending/frontend/weekly' },
    { key: 'android', name: 'Android', rsshubPath: '/juejin/trending/android/weekly' },
    { key: 'ios', name: 'iOS', rsshubPath: '/juejin/trending/ios/weekly' },
    { key: 'ai', name: '人工智能', rsshubPath: '/juejin/trending/ai/weekly' },
    { key: 'dev-tools', name: '开发工具', rsshubPath: '/juejin/trending/freebie/weekly', disabledReason: 'RSSHub 使用 `freebie`（工具资源）近似' },
    { key: 'code-life', name: '代码人生', rsshubPath: '/juejin/trending/all/weekly', disabledReason: 'RSSHub 暂无“代码人生”分类，此处回退为综合' },
    { key: 'read', name: '阅读', rsshubPath: '/juejin/trending/article/weekly', disabledReason: 'RSSHub 使用 `article`（阅读）' },
];

const infoqSubTabs: RebangSubTab[] = [
    { key: 'day', name: '7天', rsshubPath: '/infoq/recommend', disabledReason: 'RSSHub 暂无对应时间维度，此处用推荐近似' },
    { key: 'month', name: '1个月', rsshubPath: '/infoq/recommend', disabledReason: 'RSSHub 暂无对应时间维度，此处用推荐近似' },
    { key: 'year', name: '6个月', rsshubPath: '/infoq/recommend', disabledReason: 'RSSHub 暂无对应时间维度，此处用推荐近似' },
];

const v2exSubTabs: RebangSubTab[] = [
    { key: 'tech', name: '技术', rsshubPath: '/v2ex/tab/tech' },
    { key: 'creative', name: '创意', rsshubPath: '/v2ex/tab/creative' },
    { key: 'play', name: '好玩', rsshubPath: '/v2ex/tab/play' },
    { key: 'apple', name: 'Apple', rsshubPath: '/v2ex/tab/apple' },
    { key: 'jobs', name: '酷工作', rsshubPath: '/v2ex/tab/jobs' },
    { key: 'deals', name: '交易', rsshubPath: '/v2ex/tab/deals' },
    { key: 'city', name: '城市', rsshubPath: '/v2ex/tab/city' },
    { key: 'qna', name: '问与答', rsshubPath: '/v2ex/tab/qna' },
    { key: 'hot', name: '最热', rsshubPath: '/v2ex/tab/hot' },
    { key: 'all', name: '全部', rsshubPath: '/v2ex/tab/all' },
    { key: 'r2', name: 'R2', rsshubPath: '/v2ex/tab/r2' },
];

const githubTrendingPath = (language: string) => `/github/trending/daily/${language}/en`;

const githubSubTabs: RebangSubTab[] = [
    { key: 'all', name: '全部', rsshubPath: githubTrendingPath('any'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'java', name: 'Java', rsshubPath: githubTrendingPath('java'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'python', name: 'Python', rsshubPath: githubTrendingPath('python'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'javascript', name: 'JS', rsshubPath: githubTrendingPath('javascript'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'typescript', name: 'TS', rsshubPath: githubTrendingPath('typescript'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'c', name: 'C', rsshubPath: githubTrendingPath('c'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'c1', name: 'C++', rsshubPath: githubTrendingPath('c%2B%2B'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'c2', name: 'C#', rsshubPath: githubTrendingPath('c%23'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'go', name: 'Go', rsshubPath: githubTrendingPath('go'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'php', name: 'PHP', rsshubPath: githubTrendingPath('php'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'rust', name: 'Rust', rsshubPath: githubTrendingPath('rust'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'swift', name: 'Swift', rsshubPath: githubTrendingPath('swift'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
    { key: 'vue', name: 'Vue', rsshubPath: githubTrendingPath('vue'), disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
];

const sinaFinSubTabs: RebangSubTab[] = [
    { key: 'all', name: '总榜', rsshubPath: '/sina/rollnews/2516', disabledReason: 'RSSHub 无“总榜”直出，此处用“财经滚动”近似' },
    { key: 'stock', name: '股市榜', rsshubPath: '/sina/rollnews/2517', disabledReason: 'RSSHub 无“股市榜”直出，此处用“股市滚动”近似' },
    makeDisabledSubTab('future', '期市榜', 'RSSHub 暂无“期市榜”类路由'),
];

const gelonghuiSubTabs: RebangSubTab[] = [
    { key: 'recommend', name: '推荐', rsshubPath: '/gelonghui/home' },
    { key: 'hot-day', name: '日排行', rsshubPath: '/gelonghui/hot-article', disabledReason: 'RSSHub 无“日排行”直出，此处用热文近似' },
    { key: 'hot-week', name: '周排行', rsshubPath: '/gelonghui/hot-article', disabledReason: 'RSSHub 无“周排行”直出，此处用热文近似' },
];

const kdsSubTabs: RebangSubTab[] = [
    { key: 'hot-today', name: '今日', rsshubPath: '/kds/hot/today' },
    { key: 'hot-weekly', name: '本周', rsshubPath: '/kds/hot/weekly', disabledReason: 'RSSHub 无官方“本周热帖”接口，此处基于最新主题按回帖/浏览近似排序' },
    { key: 'hot-monthly', name: '本月', rsshubPath: '/kds/hot/monthly', disabledReason: 'RSSHub 无官方“本月热帖”接口，此处基于最新主题按回帖/浏览近似排序' },
];

const apprcnSubTabs: RebangSubTab[] = [
    { key: 'all', name: '全部', rsshubPath: '/apprcn' },
    { key: 'ios', name: 'iOS', rsshubPath: '/apprcn/ios' },
    { key: 'android', name: '安卓', rsshubPath: '/apprcn/android' },
    { key: 'game', name: '游戏', rsshubPath: '/apprcn/game' },
    { key: 'mac', name: 'Mac', rsshubPath: '/apprcn/mac' },
    { key: 'windows', name: 'Windows', rsshubPath: '/apprcn/windows' },
];

const acfunSubTabs: RebangSubTab[] = [
    { key: 'day', name: '今日', rsshubPath: '/acfun/rank/day' },
    { key: 'three', name: '三日', rsshubPath: '/acfun/rank/three' },
    { key: 'week', name: '本周', rsshubPath: '/acfun/rank/week' },
];

export const rebangMenu: RebangMenu = {
    version: 2,
    categories: [
        {
            key: 'home',
            name: '综合',
            path: '/rebang',
            defaultTabKey: 'top',
            tabs: [
                {
                    key: 'top',
                    name: '全站',
                    iconText: 'R',
                    type: 'aggregate',
                    defaultSubTabKey: 'today',
                    subTabs: [
                        { key: 'today', name: '今日' },
                        { key: 'weekly', name: '本周' },
                        { key: 'monthly', name: '本月' },
                    ],
                    aggregateSources,
                },
                { key: 'zhihu', name: '知乎', iconText: '知', type: 'feed', rsshubPath: '/zhihu/hot' },
                { key: 'weibo', name: '微博', iconText: '微', type: 'feed', defaultSubTabKey: 'search', subTabs: weiboSubTabs },
                { key: 'ithome', name: 'IT之家', iconText: 'IT', type: 'feed', defaultSubTabKey: 'today', subTabs: ithomeSubTabs },
                { key: 'hupu', name: '虎扑', iconText: '虎', type: 'feed', defaultSubTabKey: 'all-gambia', subTabs: hupuSubTabs },
                { key: 'tencent-news', name: '腾讯新闻', iconText: '腾', type: 'feed', rsshubPath: '/tencent/news/hot-ranking' },
                {
                    key: 'douban-community',
                    name: '豆瓣社区',
                    iconText: '豆',
                    type: 'feed',
                    defaultSubTabKey: 'discussion',
                    subTabs: doubanCommunitySubTabs,
                },
                { key: 'huxiu', name: '虎嗅', iconText: '嗅', type: 'feed', defaultSubTabKey: 'hot', subTabs: huxiuSubTabs },
                { key: 'sspai', name: '少数派', iconText: '派', type: 'feed', defaultSubTabKey: 'recommend', subTabs: sspaiSubTabs },
                { key: 'thepaper', name: '澎湃新闻', iconText: '澎', type: 'feed', defaultSubTabKey: 'hot', subTabs: thepaperSubTabs },
                { key: 'xiaohongshu', name: '小红书', iconText: '书', type: 'feed', defaultSubTabKey: 'hot-search', subTabs: xiaohongshuSubTabs },
                { key: '36kr', name: '36氪', iconText: '氪', type: 'feed', defaultSubTabKey: 'hotlist', subTabs: kr36SubTabs },
                { key: 'toutiao', name: '今日头条', iconText: '头', type: 'feed', rsshubPath: '/toutiao/hot' },
                { key: 'ifanr', name: '爱范儿', iconText: '爱', type: 'feed', rsshubPath: '/ifanr/index' },
                { key: 'douban-media', name: '豆瓣书影音', iconText: '豆', type: 'feed', defaultSubTabKey: 'movie', subTabs: doubanMediaSubTabs },
                { key: 'smzdm', name: '什么值得买', iconText: '值', type: 'feed', defaultSubTabKey: 'post', subTabs: smzdmSubTabs },
                { key: 'baidu', name: '百度', iconText: '百', type: 'feed', defaultSubTabKey: 'realtime', subTabs: baiduSubTabs },
                { key: 'penti', name: '喷嚏网', iconText: '喷', type: 'feed', defaultSubTabKey: 'tugua', subTabs: pentiSubTabs },
                { key: 'ne-news', name: '网易新闻', iconText: '易', type: 'feed', defaultSubTabKey: 'htd', subTabs: neteaseNewsSubTabs },
                { key: 'weread', name: '微信读书', iconText: '读', type: 'feed', defaultSubTabKey: 'rising', subTabs: wereadSubTabs },
                { key: 'zhihu-daily', name: '知乎日报', iconText: '报', type: 'feed', rsshubPath: '/zhihu/daily' },
                { key: 'baidu-tieba', name: '百度贴吧', iconText: '吧', type: 'feed', defaultSubTabKey: 'topic', subTabs: baiduTiebaSubTabs },
                { key: '52pojie', name: '吾爱破解', iconText: '破', type: 'feed', defaultSubTabKey: 'today', subTabs: pojieSubTabs },
                { key: 'guancha-user', name: '观风闻', iconText: '观', type: 'feed', defaultSubTabKey: 'hot-3', subTabs: guanchaUserSubTabs },
                { key: 'xueqiu', name: '雪球', iconText: '球', type: 'feed', defaultSubTabKey: 'topic', subTabs: xueqiuSubTabs },
                { key: 'landian', name: '蓝点网', iconText: '蓝', type: 'feed', defaultSubTabKey: 'article', subTabs: landianSubTabs },
                { key: 'appinn', name: '小众软件', iconText: '众', type: 'feed', rsshubPath: '/appinn' },
                { key: 'apprcn', name: '反斗限免', iconText: '免', type: 'feed', defaultSubTabKey: 'all', subTabs: apprcnSubTabs },
                { key: 'zhibo8', name: '直播吧', iconText: '播', type: 'feed', rsshubPath: '/zhibo8/more/other', disabledReason: 'RSSHub 无“热榜”直出，此处用滚动新闻（综合）近似' },
                { key: 'douyin', name: '抖音', iconText: '抖', type: 'feed', rsshubPath: '/douyin/hot-search' },
                { key: 'bilibili', name: '哔哩哔哩', iconText: 'B', type: 'feed', defaultSubTabKey: 'popular', subTabs: bilibiliSubTabs },
                { key: 'xmyp', name: '小米有品', iconText: '米', type: 'feed', defaultSubTabKey: 'zhongchou', subTabs: xmypSubTabs },
                { key: 'gamersky', name: '游民星空', iconText: '游', type: 'feed', defaultSubTabKey: 'spg', subTabs: gamerskySubTabs },
                { key: 'juejin', name: '掘金', iconText: '掘', type: 'feed', defaultSubTabKey: 'all', subTabs: juejinSubTabs },
                { key: 'journal-tech', name: '技术期刊', iconText: '刊', type: 'feed', rsshubPath: '/journal-tech' },
                { key: 'github', name: 'GitHub', iconText: 'GH', type: 'feed', defaultSubTabKey: 'all', subTabs: githubSubTabs, disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
            ],
        },
        {
            key: 'tech',
            name: '科技',
            path: '/rebang/tech',
            defaultTabKey: 'ithome',
            tabs: [
                { key: 'ithome', name: 'IT之家', iconText: 'IT', type: 'feed', defaultSubTabKey: 'today', subTabs: ithomeSubTabs },
                { key: 'sspai', name: '少数派', iconText: '派', type: 'feed', defaultSubTabKey: 'recommend', subTabs: sspaiSubTabs },
                { key: 'ifanr', name: '爱范儿', iconText: '爱', type: 'feed', rsshubPath: '/ifanr/index' },
                { key: 'landian', name: '蓝点网', iconText: '蓝', type: 'feed', defaultSubTabKey: 'article', subTabs: landianSubTabs },
                { key: '36kr', name: '36氪', iconText: '氪', type: 'feed', defaultSubTabKey: 'hotlist', subTabs: kr36SubTabs },
                { key: '52pojie', name: '吾爱破解', iconText: '破', type: 'feed', defaultSubTabKey: 'today', subTabs: pojieSubTabs },
                { key: 'huxiu', name: '虎嗅', iconText: '嗅', type: 'feed', defaultSubTabKey: 'hot', subTabs: huxiuSubTabs },
                { key: 'guokr', name: '果壳', iconText: '壳', type: 'feed', rsshubPath: '/guokr/scientific' },
            ],
        },
        {
            key: 'ent',
            name: '娱乐',
            path: '/rebang/ent',
            defaultTabKey: 'bilibili',
            tabs: [
                { key: 'weibo', name: '微博', iconText: '微', type: 'feed', defaultSubTabKey: 'search', subTabs: weiboSubTabs },
                { key: 'hupu', name: '虎扑', iconText: '虎', type: 'feed', defaultSubTabKey: 'all-ent', subTabs: hupuSubTabs },
                { key: 'douban-media', name: '豆瓣书影音', iconText: '豆', type: 'feed', defaultSubTabKey: 'movie', subTabs: doubanMediaSubTabs },
                { key: 'xiaohongshu', name: '小红书', iconText: '书', type: 'feed', defaultSubTabKey: 'hot-search', subTabs: xiaohongshuSubTabs },
                { key: 'baidu-tieba', name: '百度贴吧', iconText: '吧', type: 'feed', defaultSubTabKey: 'topic', subTabs: baiduTiebaSubTabs },
                { key: 'nga', name: 'NGA社区', iconText: 'N', type: 'feed', rsshubPath: '/nga/forum/489' },
                { key: 'gamersky', name: '游民星空', iconText: '游', type: 'feed', defaultSubTabKey: 'spg', subTabs: gamerskySubTabs },
                { key: 'penti', name: '喷嚏网', iconText: '喷', type: 'feed', defaultSubTabKey: 'tugua', subTabs: pentiSubTabs },
                { key: 'shadiao-news', name: '沙雕新闻', iconText: '沙', type: 'feed', rsshubPath: '/shadiao' },
                { key: 'bilibili', name: '哔哩哔哩', iconText: 'B', type: 'feed', defaultSubTabKey: 'popular', subTabs: bilibiliSubTabs },
                { key: 'douyin', name: '抖音', iconText: '抖', type: 'feed', rsshubPath: '/douyin/hot-search' },
                { key: 'kuaishou', name: '快手', iconText: '快', type: 'feed', rsshubPath: '/kuaishou/hot' },
                { key: 'acfun', name: 'AcFun', iconText: 'A', type: 'feed', defaultSubTabKey: 'day', subTabs: acfunSubTabs },
            ],
        },
        {
            key: 'community',
            name: '社区',
            path: '/rebang/community',
            defaultTabKey: 'hupu',
            tabs: [
                {
                    key: 'douban-community',
                    name: '豆瓣社区',
                    iconText: '豆',
                    type: 'feed',
                    defaultSubTabKey: 'discussion',
                    subTabs: doubanCommunitySubTabs,
                },
                { key: 'hupu', name: '虎扑', iconText: '虎', type: 'feed', defaultSubTabKey: 'all-gambia', subTabs: hupuSubTabs },
                { key: 'baidu-tieba', name: '百度贴吧', iconText: '吧', type: 'feed', defaultSubTabKey: 'topic', subTabs: baiduTiebaSubTabs },
                { key: 'guancha-user', name: '观风闻', iconText: '观', type: 'feed', defaultSubTabKey: 'hot-3', subTabs: guanchaUserSubTabs },
                { key: 'nga', name: 'NGA社区', iconText: 'N', type: 'feed', rsshubPath: '/nga/forum/489' },
                { key: 'kds', name: '宽带山', iconText: '宽', type: 'feed', defaultSubTabKey: 'hot-today', subTabs: kdsSubTabs },
                { key: 'v2ex', name: 'V2EX', iconText: 'V', type: 'feed', defaultSubTabKey: 'hot', subTabs: v2exSubTabs },
            ],
        },
        {
            key: 'fin',
            name: '财经',
            path: '/rebang/fin',
            defaultTabKey: 'xueqiu',
            tabs: [
                { key: 'xueqiu', name: '雪球', iconText: '球', type: 'feed', defaultSubTabKey: 'topic', subTabs: xueqiuSubTabs },
                { key: 'eastmoney', name: '东方财富', iconText: '东', type: 'feed', rsshubPath: '/eastmoney/hot/stockbar' },
                { key: 'sina-fin', name: '新浪财经', iconText: '新', type: 'feed', defaultSubTabKey: 'all', subTabs: sinaFinSubTabs },
                { key: 'gelonghui', name: '格隆汇', iconText: '格', type: 'feed', defaultSubTabKey: 'recommend', subTabs: gelonghuiSubTabs },
                { key: 'diyicaijing', name: '第一财经', iconText: '一', type: 'feed', rsshubPath: '/yicai/headline' },
            ],
        },
        {
            key: 'dev',
            name: '开发',
            path: '/rebang/dev',
            defaultTabKey: 'juejin',
            tabs: [
                { key: 'journal-tech', name: '技术期刊', iconText: '刊', type: 'feed', rsshubPath: '/journal-tech' },
                { key: 'juejin', name: '掘金', iconText: '掘', type: 'feed', defaultSubTabKey: 'all', subTabs: juejinSubTabs },
                { key: 'infoq', name: 'InfoQ', iconText: 'IQ', type: 'feed', defaultSubTabKey: 'day', subTabs: infoqSubTabs },
                { key: 'v2ex', name: 'V2EX', iconText: 'V', type: 'feed', defaultSubTabKey: 'hot', subTabs: v2exSubTabs },
                { key: 'github', name: 'GitHub', iconText: 'GH', type: 'feed', defaultSubTabKey: 'all', subTabs: githubSubTabs, disabled: true, disabledReason: '该节点需要 GITHUB_ACCESS_TOKEN，默认不启用' },
                { key: 'csdn', name: 'CSDN', iconText: 'C', type: 'feed', rsshubPath: '/csdn/rank/hot' },
            ],
        },
    ],
};
