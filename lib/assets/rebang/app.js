const STORAGE = {
    theme: 'rebang:theme',
    openLink: 'rebang:openLink',
    listDisplay: 'rebang:listDisplay',
    tabBarDefault: 'rebang:tabBarDefault',
    defaultMenu: 'rebang:defaultMenu',
    blockWords: 'rebang:blockWords',
};

const DEFAULTS = {
    [STORAGE.theme]: 'light',
    [STORAGE.openLink]: 'new',
    [STORAGE.listDisplay]: 'full',
    [STORAGE.tabBarDefault]: 'collapsed',
    [STORAGE.defaultMenu]: 'home',
    [STORAGE.blockWords]: [],
};

const getSetting = (key) => {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            return DEFAULTS[key];
        }
        if (key === STORAGE.blockWords) {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        return raw;
    } catch {
        return DEFAULTS[key];
    }
};

const setSetting = (key, value) => {
    if (key === STORAGE.blockWords) {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        localStorage.setItem(key, String(value));
    }
};

const applyTheme = () => {
    const theme = getSetting(STORAGE.theme);
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const shouldDark = theme === 'dark' || (theme === 'system' && mql.matches);
    document.documentElement.classList.toggle('dark', shouldDark);
};

const getCategoryKeyByPath = (pathname) => {
    if (pathname === '/rebang' || pathname === '/rebang/') {
        return 'home';
    }
    if (pathname.startsWith('/rebang/tech')) {
        return 'tech';
    }
    if (pathname.startsWith('/rebang/ent')) {
        return 'ent';
    }
    if (pathname.startsWith('/rebang/community')) {
        return 'community';
    }
    if (pathname.startsWith('/rebang/fin')) {
        return 'fin';
    }
    if (pathname.startsWith('/rebang/dev')) {
        return 'dev';
    }
    return 'home';
};

const getPageByPath = (pathname) => {
    if (pathname.startsWith('/rebang/setting')) {
        return 'setting';
    }
    if (pathname.startsWith('/rebang/following')) {
        return 'following';
    }
    return 'list';
};

const qs = (sel) => document.querySelector(sel);

const setStatus = (text) => {
    const el = qs('#rb-status');
    if (!el) {
        return;
    }
    const v = text ? String(text) : '';
    el.textContent = v;
    el.classList.toggle('hidden', !v);
};

const formatTime = (iso) => {
    if (!iso) {
        return '';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '';
    }
    return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
};

const escapeHtml = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const renderRadioGroup = ({ container, name, options, value, onChange }) => {
    container.innerHTML = options
        .map(
            (opt) => `
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <input class="rb-ring" type="radio" name="${escapeHtml(name)}" value="${escapeHtml(opt.value)}" ${opt.value === value ? 'checked' : ''} />
              <span>${escapeHtml(opt.label)}</span>
            </label>
          `
        )
        .join('');
    for (const el of container.querySelectorAll(`input[name="${CSS.escape(name)}"]`)) {
        el.addEventListener('change', () => onChange(el.value));
    }
};

const loadMenu = () => {
    const el = qs('#rb-menu');
    if (!el) {
        return null;
    }
    return JSON.parse(el.textContent || 'null');
};

const updateActiveNav = (categoryKey) => {
    for (const a of document.querySelectorAll('[data-rb-nav]')) {
        const k = a.dataset.rbNav;
        const active = k === categoryKey;
        a.classList.toggle('text-[#165DFF]', active);
        a.classList.toggle('text-[color:var(--rb-text-2)]', !active);
        a.classList.toggle('border-[#165DFF]', active);
        a.classList.toggle('border-transparent', !active);
        a.classList.toggle('font-semibold', active);
        a.classList.toggle('font-medium', !active);
        a.classList.toggle('hover:text-[color:var(--rb-text)]', !active);
    }
};

const TAB_ICONS = {
    zhihu: '/rebang/icons/zhihu.png',
    'zhihu-daily': '/rebang/icons/zhihu.png',
    weibo: '/rebang/icons/weibo.png',
    ithome: '/rebang/icons/ithome.png',
    hupu: '/rebang/icons/hupu.png',
    'tencent-news': '/rebang/icons/tencent-news.png',
    'douban-community': '/rebang/icons/douban.png',
    'douban-media': '/rebang/icons/douban.png',
    huxiu: '/rebang/icons/huxiu.png',
    sspai: '/rebang/icons/sspai.png',
    thepaper: '/rebang/icons/thepaper.png',
    xiaohongshu: '/rebang/icons/xiaohongshu.png',
    '36kr': '/rebang/icons/36kr.png',
    ifanr: '/rebang/icons/ifanr.png',
    smzdm: '/rebang/icons/smzdm.png',
    baidu: '/rebang/icons/baidu.png',
    'baidu-tieba': '/rebang/icons/baidu.png',
    'ne-news': '/rebang/icons/netease.png',
    weread: '/rebang/icons/weread.png',
    xueqiu: '/rebang/icons/xueqiu.png',
    'guancha-user': '/rebang/icons/guancha.png',
    landian: '/rebang/icons/landian.png',
    appinn: '/rebang/icons/appinn.png',
    apprcn: '/rebang/icons/apprcn.png',
    zhibo8: '/rebang/icons/zhibo8.png',
    bilibili: '/rebang/icons/bilibili.png',
    douyin: '/rebang/icons/douyin.png',
    xmyp: '/rebang/icons/xmyp.png',
    gamersky: '/rebang/icons/gamersky.png',
    juejin: '/rebang/icons/juejin.png',
    github: '/rebang/icons/github.png',
};

const normalizeState = ({ menu, categoryKey, tabKey, subKey }) => {
    const category = menu.categories.find((c) => c.key === categoryKey) || menu.categories.find((c) => c.key === 'home');
    if (!category) {
        return null;
    }
    const tabs = category.tabs || [];
    const tab = tabs.find((t) => t.key === tabKey) || tabs.find((t) => t.key === category.defaultTabKey) || tabs[0];
    if (!tab) {
        return { category, tab: null, subKey: null };
    }
    const subTabs = tab.subTabs || [];
    const resolvedSubKey = subTabs.length ? subTabs.find((s) => s.key === subKey)?.key || tab.defaultSubTabKey || subTabs[0].key : null;
    return { category, tab, subKey: resolvedSubKey };
};

const renderTabs = ({ menu, categoryKey, tabKey, subKey }) => {
    const tabsEl = qs('#rb-tabs');
    const expandBtn = qs('#rb-tab-expand');
    const expandText = qs('#rb-tab-expand-text');
    const expandIcon = qs('#rb-tab-expand-icon');
    const nodeSelect = qs('#rb-node-select');
    if (!tabsEl || !nodeSelect || !expandBtn || !expandText || !expandIcon) {
        return;
    }

    const state = normalizeState({ menu, categoryKey, tabKey, subKey });
    if (!state) {
        return;
    }

    const expandedDefault = getSetting(STORAGE.tabBarDefault) === 'expanded';
    const isExpanded = localStorage.getItem('rebang:tabExpanded') ? localStorage.getItem('rebang:tabExpanded') === 'true' : expandedDefault;

    const tabs = state.category.tabs || [];
    const activeKey = state.tab?.key;

    tabsEl.innerHTML = tabs
        .map((t) => {
            const active = t.key === activeKey;
            const disabled = Boolean(t.disabled);
            const disabledReason = t.disabledReason ? String(t.disabledReason) : '';
            const iconUrl = TAB_ICONS[t.key];
            const icon = iconUrl
                ? `<img src="${escapeHtml(iconUrl)}" class="w-5 h-5 rounded-sm" loading="lazy" alt="" />`
                : t.iconText
                  ? `<span class="w-6 h-6 rounded-md grid place-items-center text-xs font-black ${active ? 'bg-[#165DFF] text-white' : 'rb-chip'}">${escapeHtml(t.iconText)}</span>`
                  : '';
            const cls = disabled ? 'opacity-50 cursor-not-allowed' : active ? 'rb-site-tab-active' : 'text-[color:var(--rb-text-2)] rb-site-tab-inactive';
            return `
            <button type="button" data-rb-tab="${escapeHtml(t.key)}" data-rb-disabled="${disabled ? '1' : '0'}" data-rb-disabled-reason="${escapeHtml(disabledReason)}" class="shrink-0 inline-flex items-center gap-1.5 h-8 px-2 rounded-lg text-sm ${cls} rb-ring">
              ${icon}<span class="font-semibold">${escapeHtml(t.name)}</span>
            </button>
          `;
        })
        .join('');

    tabsEl.style.flexWrap = 'wrap';
    tabsEl.style.maxHeight = 'none';
    tabsEl.style.overflow = 'visible';
    tabsEl.style.transition = '';
    tabsEl.style.paddingRight = '0';
    tabsEl.style.paddingBottom = '0';

    const tabButtons = [...tabsEl.querySelectorAll('[data-rb-tab]')];
    const topSet = new Set(tabButtons.map((el) => Math.round(el.offsetTop)));
    const showExpand = tabButtons.length > 0 && topSet.size > 1;
    const firstTop = tabButtons[0] ? Math.round(tabButtons[0].offsetTop) : 0;
    let firstRowBottom = 0;
    for (const el of tabButtons) {
        if (Math.round(el.offsetTop) !== firstTop) {
            continue;
        }
        firstRowBottom = Math.max(firstRowBottom, el.offsetTop + el.offsetHeight);
    }
    const collapsedHeight = firstRowBottom ? firstRowBottom + 2 : 44;

    expandBtn.classList.toggle('hidden', !showExpand);

    if (showExpand) {
        expandText.textContent = isExpanded ? '收起' : '展开';
        expandBtn.dataset.rbExpanded = isExpanded ? '1' : '0';
        expandIcon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        expandIcon.style.transition = '';

        expandBtn.classList.remove('hidden');
        tabsEl.style.transition = '';
        tabsEl.style.paddingRight = '0';
        tabsEl.style.paddingBottom = '0';

        if (isExpanded) {
            tabsEl.style.flexWrap = 'wrap';
            expandBtn.style.bottom = '';
            expandBtn.style.transform = '';

            tabsEl.style.maxHeight = 'none';
            tabsEl.style.overflow = 'visible';

            let lastTop = firstTop;
            for (const el of tabButtons) {
                lastTop = Math.max(lastTop, Math.round(el.offsetTop));
            }
            let lastRowHeight = 0;
            for (const el of tabButtons) {
                if (Math.round(el.offsetTop) !== lastTop) {
                    continue;
                }
                lastRowHeight = Math.max(lastRowHeight, el.offsetHeight);
            }

            // 计算展开按钮在最后一行的垂直居中位置
            const lastRowOffsetTop = lastTop;
            const btnTop = lastRowOffsetTop + Math.floor((lastRowHeight - expandBtn.offsetHeight) / 2);
            expandBtn.style.top = `${btnTop}px`;

            tabsEl.style.paddingRight = '0';
            const overlapWidth = Math.max(0, tabsEl.getBoundingClientRect().right - expandBtn.getBoundingClientRect().left);
            const pad = overlapWidth ? Math.ceil(overlapWidth + 8) : expandBtn.offsetWidth ? Math.ceil(expandBtn.offsetWidth + 8) : 88;
            tabsEl.style.paddingRight = `${pad}px`;
        } else {
            tabsEl.style.flexWrap = 'nowrap';
            expandBtn.style.top = '50%';
            expandBtn.style.bottom = '';
            expandBtn.style.transform = 'translateY(-50%)';

            tabsEl.style.maxHeight = `${collapsedHeight}px`;
            tabsEl.style.overflow = 'hidden';

            tabsEl.style.paddingRight = '0';
            const overlapWidth = Math.max(0, tabsEl.getBoundingClientRect().right - expandBtn.getBoundingClientRect().left);
            const pad = overlapWidth ? Math.ceil(overlapWidth + 8) : expandBtn.offsetWidth ? Math.ceil(expandBtn.offsetWidth + 8) : 88;
            tabsEl.style.paddingRight = `${pad}px`;
        }

        if (expandBtn.dataset.rbBound !== '1') {
            expandBtn.dataset.rbBound = '1';
            expandBtn.addEventListener('click', () => {
                const expandedDefault = getSetting(STORAGE.tabBarDefault) === 'expanded';
                const raw = localStorage.getItem('rebang:tabExpanded');
                const expandedNow = raw ? raw === 'true' : expandedDefault;
                localStorage.setItem('rebang:tabExpanded', String(!expandedNow));
                refresh();
            });
        }
    } else {
        expandBtn.dataset.rbExpanded = '0';
        expandBtn.style.top = '';
        expandBtn.style.bottom = '';
        expandBtn.style.transform = '';
        tabsEl.style.maxHeight = 'none';
        tabsEl.style.overflow = 'visible';
        tabsEl.style.transition = '';
        tabsEl.style.paddingRight = '0';
        tabsEl.style.paddingBottom = '0';
    }

    nodeSelect.innerHTML = [
        '<option value="">全部节点</option>',
        ...tabs.map((t) => {
            const label = String(t.name);
            const disabled = Boolean(t.disabled);
            const disabledReason = t.disabledReason ? `（${t.disabledReason}）` : '';
            return `<option value="${escapeHtml(t.key)}" ${t.key === activeKey ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${escapeHtml(label + (disabled ? disabledReason : ''))}</option>`;
        }),
    ].join('');

    for (const btn of tabsEl.querySelectorAll('[data-rb-tab]')) {
        btn.addEventListener('click', () => {
            if (btn.dataset.rbDisabled === '1') {
                const reason = btn.dataset.rbDisabledReason || '该节点未启用';
                setStatus(reason);
                return;
            }
            const nextTabKey = btn.dataset.rbTab;
            navigateWith({ tab: nextTabKey, sub: null }, { replace: false });
        });
    }

    nodeSelect.addEventListener('change', () => {
        const v = nodeSelect.value || null;
        if (v) {
            navigateWith({ tab: v, sub: null }, { replace: false });
        }
    });

    renderSubTabs({ menu, categoryKey, tabKey: activeKey, subKey: state.subKey });
};

const renderSubTabs = ({ menu, categoryKey, tabKey, subKey }) => {
    const el = qs('#rb-subtabs');
    if (!el) {
        return;
    }
    const state = normalizeState({ menu, categoryKey, tabKey, subKey });
    if (!state?.tab) {
        return;
    }

    const subTabs = state.tab.subTabs || [];
    if (!subTabs.length) {
        el.innerHTML = '';
        return;
    }

    el.innerHTML = subTabs
        .map((s) => {
            const active = s.key === state.subKey;
            const disabled = Boolean(s.disabled);
            const disabledReason = s.disabledReason ? String(s.disabledReason) : '';
            const cls = disabled ? 'opacity-50 cursor-not-allowed' : active ? 'text-[color:var(--rb-text)] border-b-2 border-[#165DFF]' : 'text-[color:var(--rb-text-2)] hover:text-[color:var(--rb-text)]';
            return `<button type="button" data-rb-sub="${escapeHtml(s.key)}" data-rb-disabled="${disabled ? '1' : '0'}" data-rb-disabled-reason="${escapeHtml(disabledReason)}" class="pb-1 ${cls} rb-ring">${escapeHtml(s.name)}</button>`;
        })
        .join('');

    for (const btn of el.querySelectorAll('[data-rb-sub]')) {
        btn.addEventListener('click', () => {
            if (btn.dataset.rbDisabled === '1') {
                const reason = btn.dataset.rbDisabledReason || '该子分类未启用';
                setStatus(reason);
                return;
            }
            navigateWith({ sub: btn.dataset.rbSub }, { replace: false });
        });
    }
};

const getStateFromLocation = () => {
    const url = new URL(window.location.href);
    return {
        categoryKey: getCategoryKeyByPath(url.pathname),
        page: getPageByPath(url.pathname),
        tabKey: url.searchParams.get('tab'),
        subKey: url.searchParams.get('sub'),
    };
};

const navigateWith = (patch, { replace }) => {
    const url = new URL(window.location.href);
    if (Object.hasOwn(patch, 'tab')) {
        if (patch.tab) {
            url.searchParams.set('tab', patch.tab);
        } else {
            url.searchParams.delete('tab');
        }
    }
    if (Object.hasOwn(patch, 'sub')) {
        if (patch.sub) {
            url.searchParams.set('sub', patch.sub);
        } else {
            url.searchParams.delete('sub');
        }
    }
    if (replace) {
        window.history.replaceState({}, '', url);
    } else {
        window.history.pushState({}, '', url);
    }
    refresh();
};

const renderItems = (items) => {
    const listEl = qs('#rb-items');
    if (!listEl) {
        return;
    }

    const openLink = getSetting(STORAGE.openLink);
    const listDisplay = getSetting(STORAGE.listDisplay);
    const blockWords = getSetting(STORAGE.blockWords);
    const journalTechActive = lastListState?.tabKey === 'journal-tech';
    const journalTechExcluded = journalTechActive && journalTechTransientExcluded && journalTechTransientExcluded.size ? journalTechTransientExcluded : null;

    const filtered = (items || [])
        .filter((it) => {
            if (!journalTechActive || !journalTechExcluded?.size) {
                return true;
            }
            const sourceName = it.source?.name ? String(it.source.name) : '';
            return !journalTechExcluded.has(sourceName);
        })
        .filter((it) => {
            if (!blockWords.length) {
                return true;
            }
            return !blockWords.some((w) => w && it.title && String(it.title).includes(w));
        })
        .map((it, idx) => ({ ...it, rank: idx + 1 }));

    listEl.innerHTML = filtered
        .map((it) => {
            const showImage = listDisplay !== 'noimage' && listDisplay !== 'compact';
            const showSummary = listDisplay !== 'compact';
            const summary = showSummary && it.summary ? `<div class="mt-1.5 text-sm text-[color:var(--rb-text-2)] line-clamp-2">${escapeHtml(it.summary)}</div>` : '';

            const sourceName = it.source?.name ? String(it.source.name) : '';
            const published = formatTime(it.datePublished);
            const meta =
                sourceName || published
                    ? `<div class="mt-2 flex items-center gap-2 text-xs text-[color:var(--rb-muted)]">
              ${sourceName ? `<span>${escapeHtml(sourceName)}</span>` : ''}
              ${sourceName && published ? '<span class="opacity-40">·</span>' : ''}
              ${published ? `<span>${escapeHtml(published)}</span>` : ''}
            </div>`
                    : '';

            const thumb =
                showImage && it.image
                    ? `<div class="shrink-0 w-40 h-24 rounded bg-[color:var(--rb-surface-2)] overflow-hidden flex items-center justify-center">
                    <img src="${escapeHtml(it.image)}" class="w-full h-full object-cover rounded" loading="lazy" referrerpolicy="no-referrer" />
                  </div>`
                    : '';
            const target = openLink === 'new' ? ' target="_blank" rel="noreferrer noopener"' : '';
            return `
            <li class="px-3 py-3 flex gap-3">
              <div class="w-6 text-[#f97316] font-extrabold">${escapeHtml(it.rank)}</div>
              <div class="flex-1 min-w-0">
                <a class="rb-link font-semibold text-[15px] leading-6" href="${escapeHtml(it.link)}"${target}>${escapeHtml(it.title)}</a>
                ${summary}
                ${meta}
              </div>
              ${thumb}
            </li>
          `;
        })
        .join('');
};

const fetchItems = async ({ categoryKey, tabKey, subKey }) => {
    setStatus('加载中...');

    const url = new URL('/api/rebang/items', window.location.origin);
    url.searchParams.set('category', categoryKey);
    if (tabKey) {
        url.searchParams.set('tab', tabKey);
    }
    if (subKey) {
        url.searchParams.set('sub', subKey);
    }

    const res = await fetch(url, { headers: { accept: 'application/json' } });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || '加载失败');
    }
    return data;
};

let lastListData = null;
let lastTabRenderState = null;
let lastListState = null;
let journalTechFilterState = null;
let journalTechTransientExcluded = null;

const getJournalTechExcludedSet = (sources) => {
    if (!journalTechTransientExcluded?.size) {
        return new Set();
    }
    return new Set([...journalTechTransientExcluded].filter((name) => sources.includes(name)));
};

const applyJournalTechExcludedFilter = ({ sources, excludedSources }) => {
    const allowed = new Set(sources);
    const normalized = [...excludedSources].map(String).filter((name) => allowed.has(name));
    journalTechTransientExcluded = normalized.length ? new Set(normalized) : null;
};

const closeJournalTechSourcePanel = () => {
    qs('#rb-journal-source-filter-panel')?.classList.add('hidden');
};

const isSetEqual = (a, b) => {
    if (a.size !== b.size) {
        return false;
    }
    for (const x of a) {
        if (!b.has(x)) {
            return false;
        }
    }
    return true;
};

const renderJournalTechSourceFilter = ({ tabKey, items, sources: allSources }) => {
    const container = qs('#rb-journal-source-filter');
    const labelEl = qs('#rb-journal-source-filter-label');
    const btn = qs('#rb-journal-source-filter-btn');
    const panel = qs('#rb-journal-source-filter-panel');
    const listEl = qs('#rb-journal-source-filter-list');
    const toggleAllBtn = qs('#rb-journal-source-filter-toggle-all');
    const saveBtn = qs('#rb-journal-source-filter-save');
    if (!container || !labelEl || !btn || !panel || !listEl || !toggleAllBtn || !saveBtn) {
        return;
    }

    if (tabKey !== 'journal-tech') {
        container.classList.add('hidden');
        closeJournalTechSourcePanel();
        return;
    }

    container.classList.remove('hidden');

    const derivedSources = [...new Set((items || []).map((it) => (it.source?.name ? String(it.source.name) : '')).filter(Boolean))];
    const sourcesRaw = Array.isArray(allSources) && allSources.length ? allSources.map((s) => String(s.name || s)).filter(Boolean) : derivedSources;
    const sources = [...new Set(sourcesRaw)].toSorted((a, b) => a.localeCompare(b, 'zh-Hans-CN'));

    const savedExcluded = getJournalTechExcludedSet(sources);
    const stateKey = sources.join('\u0000');
    if (!journalTechFilterState || journalTechFilterState.key !== stateKey) {
        journalTechFilterState = { key: stateKey, sources, savedExcluded, draftExcluded: new Set(savedExcluded) };
    } else {
        journalTechFilterState.sources = sources;
        journalTechFilterState.savedExcluded = savedExcluded;
    }

    const applyFilterUiState = () => {
        const { savedExcluded, draftExcluded } = journalTechFilterState;
        const dirty = !isSetEqual(savedExcluded, draftExcluded);
        const excludedCount = draftExcluded.size;
        const baseText = excludedCount ? `已排除 ${excludedCount} 位博主` : '全部博主';
        labelEl.textContent = dirty ? `${baseText}*` : baseText;
        toggleAllBtn.textContent = excludedCount === 0 ? '取消全选' : '全选';
        saveBtn.disabled = !dirty;
    };

    applyFilterUiState();

    listEl.innerHTML = sources
        .map((name) => {
            const checked = !journalTechFilterState.draftExcluded.has(name);
            return `
        <label class="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[color:var(--rb-surface-2)] rb-ring cursor-pointer">
          <input type="checkbox" data-rb-journal-source="${escapeHtml(name)}" class="w-4 h-4" ${checked ? 'checked' : ''} />
          <span class="text-sm">${escapeHtml(name)}</span>
        </label>
      `;
        })
        .join('');

    if (btn.dataset.rbBound !== '1') {
        btn.dataset.rbBound = '1';
        btn.addEventListener('click', () => {
            panel.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            const t = e.target;
            if (!(t instanceof Node)) {
                return;
            }
            if (!container.contains(t)) {
                closeJournalTechSourcePanel();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeJournalTechSourcePanel();
            }
        });
    }

    if (listEl.dataset.rbBound !== '1') {
        listEl.dataset.rbBound = '1';
        listEl.addEventListener('change', (e) => {
            if (!journalTechFilterState) {
                return;
            }
            const t = e.target;
            if (!(t instanceof HTMLInputElement) || t.type !== 'checkbox') {
                return;
            }
            const name = t.dataset.rbJournalSource;
            if (!name) {
                return;
            }
            if (t.checked) {
                journalTechFilterState.draftExcluded.delete(name);
            } else {
                journalTechFilterState.draftExcluded.add(name);
            }
            applyFilterUiState();
        });
    }

    if (toggleAllBtn.dataset.rbBound !== '1') {
        toggleAllBtn.dataset.rbBound = '1';
        toggleAllBtn.addEventListener('click', () => {
            if (!journalTechFilterState) {
                return;
            }
            const { sources, draftExcluded } = journalTechFilterState;
            journalTechFilterState.draftExcluded = draftExcluded.size === 0 ? new Set(sources) : new Set();
            for (const input of listEl.querySelectorAll('input[type="checkbox"][data-rb-journal-source]')) {
                const name = input.dataset.rbJournalSource;
                input.checked = name ? !journalTechFilterState.draftExcluded.has(name) : input.checked;
            }
            applyFilterUiState();
        });
    }

    if (saveBtn.dataset.rbBound !== '1') {
        saveBtn.dataset.rbBound = '1';
        saveBtn.addEventListener('click', () => {
            const listEl = qs('#rb-journal-source-filter-list');
            if (!listEl || !journalTechFilterState) {
                return;
            }
            applyJournalTechExcludedFilter({ sources: journalTechFilterState.sources, excludedSources: journalTechFilterState.draftExcluded });
            journalTechFilterState.savedExcluded = new Set(journalTechFilterState.draftExcluded);
            applyFilterUiState();
            closeJournalTechSourcePanel();
            rerenderListFromLastData();
        });
    }
};

const rerenderListFromLastData = () => {
    if (!lastListData) {
        return;
    }

    const input = qs('#rb-search');
    const q = input ? input.value.trim().toLowerCase() : '';

    let items = lastListData.items || [];
    if (q) {
        items = items.filter(
            (it) =>
                String(it.title).toLowerCase().includes(q) ||
                String(it.summary || '')
                    .toLowerCase()
                    .includes(q)
        );
    }

    renderItems(items);
};

const refreshList = async ({ menu, categoryKey, tabKey, subKey }) => {
    const state = normalizeState({ menu, categoryKey, tabKey, subKey });
    if (!state?.tab) {
        renderJournalTechSourceFilter({ tabKey: null, items: [], sources: null });
        renderItems([]);
        setStatus('暂无节点');
        return;
    }

    lastListState = { categoryKey: state.category.key, tabKey: state.tab.key, subKey: state.subKey };
    renderJournalTechSourceFilter({ tabKey: state.tab.key, items: [], sources: lastListData?.sources });

    if (state.tab.disabled) {
        renderItems([]);
        setStatus(state.tab.disabledReason || '该节点未启用');
        return;
    }

    if (state.subKey && state.tab.subTabs?.length) {
        const matchedSub = state.tab.subTabs.find((s) => s.key === state.subKey);
        if (matchedSub?.disabled) {
            renderItems([]);
            setStatus(matchedSub.disabledReason || '该子分类未启用');
            return;
        }
    }

    try {
        const data = await fetchItems({ categoryKey: state.category.key, tabKey: state.tab.key, subKey: state.subKey });
        lastListData = data;
        renderJournalTechSourceFilter({ tabKey: state.tab.key, items: data.items, sources: data.sources });
        renderItems(data.items);
        setStatus(data.errors?.length ? '部分来源加载失败' : '');
    } catch (error) {
        setStatus(error instanceof Error ? error.message : '加载失败');
        renderItems([]);
    }
};

let risingSeed = 1;

const refreshRising = async () => {
    const listEl = qs('#rb-rising');
    if (!listEl) {
        return;
    }
    listEl.innerHTML = '<div class="text-sm text-[color:var(--rb-muted)]">加载中...</div>';
    try {
        const url = new URL('/api/rebang/rising', window.location.origin);
        url.searchParams.set('seed', String(risingSeed));
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || '加载失败');
        }
        listEl.innerHTML = data.items
            .map((it) => {
                const target = getSetting(STORAGE.openLink) === 'new' ? ' target="_blank" rel="noreferrer noopener"' : '';
                return `
                <li class="flex items-start gap-3">
                  <div class="w-5 text-[#f97316] font-extrabold">${escapeHtml(it.rank)}</div>
                  <div class="min-w-0">
                    <a class="rb-link text-sm font-semibold leading-5 line-clamp-2" href="${escapeHtml(it.link)}"${target}>${escapeHtml(it.title)}</a>
                    <div class="mt-1 text-xs text-[color:var(--rb-muted)]">${escapeHtml(it.source?.name || '')}</div>
                  </div>
                </li>
              `;
            })
            .join('');
    } catch (error) {
        listEl.innerHTML = `<div class="text-sm text-[color:var(--rb-muted)]">${escapeHtml(error instanceof Error ? error.message : '加载失败')}</div>`;
    }
};

const bindHeader = () => {
    qs('#rb-mobile-menu')?.addEventListener('click', () => {
        qs('#rb-mobile-drawer')?.classList.toggle('hidden');
    });

    qs('#rb-theme-toggle')?.addEventListener('click', () => {
        const theme = getSetting(STORAGE.theme);
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const resolvedDark = theme === 'dark' || (theme === 'system' && mql.matches);
        const next = resolvedDark ? 'light' : 'dark';
        setSetting(STORAGE.theme, next);
        applyTheme();
    });
};

const renderSettings = (menu) => {
    const themeEl = qs('#rb-setting-theme');
    const openLinkEl = qs('#rb-setting-openLink');
    const listDisplayEl = qs('#rb-setting-listDisplay');
    const tabBarDefaultEl = qs('#rb-setting-tabBarDefault');
    const defaultMenuEl = qs('#rb-setting-defaultMenu');
    const blockwordsEl = qs('#rb-setting-blockwords');
    const addBtn = qs('#rb-setting-blockword-add');
    const input = qs('#rb-setting-blockword');

    if (!themeEl || !openLinkEl || !listDisplayEl || !tabBarDefaultEl || !defaultMenuEl || !blockwordsEl || !addBtn || !input) {
        return;
    }

    renderRadioGroup({
        container: themeEl,
        name: 'theme',
        value: getSetting(STORAGE.theme),
        options: [
            { value: 'light', label: '浅色主题' },
            { value: 'dark', label: '深色主题' },
            { value: 'system', label: '跟随系统' },
        ],
        onChange: (v) => {
            setSetting(STORAGE.theme, v);
            applyTheme();
        },
    });

    renderRadioGroup({
        container: openLinkEl,
        name: 'openLink',
        value: getSetting(STORAGE.openLink),
        options: [
            { value: 'new', label: '新标签页' },
            { value: 'current', label: '当前标签页' },
        ],
        onChange: (v) => setSetting(STORAGE.openLink, v),
    });

    renderRadioGroup({
        container: listDisplayEl,
        name: 'listDisplay',
        value: getSetting(STORAGE.listDisplay),
        options: [
            { value: 'full', label: '完整' },
            { value: 'noimage', label: '无图' },
            { value: 'compact', label: '精简' },
        ],
        onChange: (v) => {
            setSetting(STORAGE.listDisplay, v);
            rerenderListFromLastData();
        },
    });

    renderRadioGroup({
        container: tabBarDefaultEl,
        name: 'tabBarDefault',
        value: getSetting(STORAGE.tabBarDefault),
        options: [
            { value: 'collapsed', label: '折叠' },
            { value: 'expanded', label: '展开' },
        ],
        onChange: (v) => setSetting(STORAGE.tabBarDefault, v),
    });

    defaultMenuEl.innerHTML = menu.categories.map((c) => `<option value="${escapeHtml(c.key)}">${escapeHtml(c.name)}</option>`).join('');
    defaultMenuEl.value = getSetting(STORAGE.defaultMenu);
    defaultMenuEl.addEventListener('change', () => setSetting(STORAGE.defaultMenu, defaultMenuEl.value));

    const renderBlockWords = () => {
        const words = getSetting(STORAGE.blockWords);
        blockwordsEl.innerHTML = words
            .map(
                (w) => `
              <button type="button" data-rb-word="${escapeHtml(w)}" class="px-2 py-1 rounded-md rb-chip text-sm rb-ring">
                ${escapeHtml(w)} <span class="opacity-60">×</span>
              </button>
            `
            )
            .join('');
        for (const btn of blockwordsEl.querySelectorAll('[data-rb-word]')) {
            btn.addEventListener('click', () => {
                const word = btn.dataset.rbWord;
                const next = words.filter((x) => x !== word);
                setSetting(STORAGE.blockWords, next);
                renderBlockWords();
            });
        }
    };

    renderBlockWords();

    addBtn.addEventListener('click', () => {
        const word = input.value.trim();
        if (!word) {
            return;
        }
        const words = getSetting(STORAGE.blockWords);
        if (words.includes(word)) {
            return;
        }
        const next = [word, ...words].slice(0, 50);
        setSetting(STORAGE.blockWords, next);
        input.value = '';
        renderBlockWords();
    });
};

const bindSearch = () => {
    const input = qs('#rb-search');
    if (!input) {
        return;
    }
    input.addEventListener('input', () => {
        rerenderListFromLastData();
    });
};

const setVisiblePage = (page) => {
    qs('#rb-page-list')?.classList.toggle('hidden', page !== 'list');
    qs('#rb-page-setting')?.classList.toggle('hidden', page !== 'setting');
    qs('#rb-page-following')?.classList.toggle('hidden', page !== 'following');
};

const refresh = async () => {
    const menu = loadMenu();
    if (!menu) {
        return;
    }

    applyTheme();

    const { categoryKey, page, tabKey, subKey } = getStateFromLocation();
    updateActiveNav(categoryKey);
    setVisiblePage(page);

    if (page === 'setting') {
        renderSettings(menu);
        return;
    }

    if (page === 'following') {
        return;
    }

    lastTabRenderState = { menu, categoryKey, tabKey, subKey };
    renderTabs(lastTabRenderState);
    await refreshList({ menu, categoryKey, tabKey, subKey });
};

const main = async () => {
    bindHeader();
    bindSearch();
    qs('#rb-rising-refresh')?.addEventListener('click', () => {
        risingSeed++;
        refreshRising();
    });

    window.addEventListener('popstate', refresh);
    window.addEventListener('resize', () => {
        if (!lastTabRenderState) {
            return;
        }
        window.requestAnimationFrame(() => renderTabs(lastTabRenderState));
    });

    const current = new URL(window.location.href);
    if (current.pathname === '/rebang' || current.pathname === '/rebang/') {
        const preferred = getSetting(STORAGE.defaultMenu);
        const menu = loadMenu();
        const target = menu?.categories?.find((c) => c.key === preferred)?.path;
        if (target && target !== '/rebang' && target !== current.pathname) {
            window.history.replaceState({}, '', target + current.search);
        }
    }

    await refresh();
    await refreshRising();

    window.matchMedia('(prefers-color-scheme: dark)')?.addEventListener?.('change', () => applyTheme());
};

main();
