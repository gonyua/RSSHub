const STORAGE = {
    theme: 'rebang:theme',
    openLink: 'rebang:openLink',
    listDisplay: 'rebang:listDisplay',
    tabBarDefault: 'rebang:tabBarDefault',
    defaultMenu: 'rebang:defaultMenu',
    blockWords: 'rebang:blockWords',
};

const DEFAULTS = {
    [STORAGE.theme]: 'system',
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
        a.classList.toggle('text-[color:var(--rb-text)]', k === categoryKey);
        a.classList.toggle('text-[color:var(--rb-text-2)]', k !== categoryKey);
        a.classList.toggle('border-b-2', k === categoryKey);
        a.classList.toggle('border-[#2563eb]', k === categoryKey);
        a.classList.toggle('pb-3', k === categoryKey);
    }
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
    const nodeSelect = qs('#rb-node-select');
    if (!tabsEl || !nodeSelect) {
        return;
    }

    const state = normalizeState({ menu, categoryKey, tabKey, subKey });
    if (!state) {
        return;
    }

    const expandedDefault = getSetting(STORAGE.tabBarDefault) === 'expanded';
    const isExpanded = localStorage.getItem('rebang:tabExpanded') ? localStorage.getItem('rebang:tabExpanded') === 'true' : expandedDefault;

    tabsEl.classList.toggle('flex-wrap', isExpanded);

    const tabs = state.category.tabs || [];
    const activeKey = state.tab?.key;

    tabsEl.innerHTML = tabs
        .map((t) => {
            const active = t.key === activeKey;
            const disabled = Boolean(t.disabled);
            const disabledReason = t.disabledReason ? String(t.disabledReason) : '';
            const icon = t.iconText ? `<span class="w-6 h-6 rounded-md grid place-items-center text-xs font-black ${active ? 'bg-[#2563eb] text-white' : 'rb-chip'}">${escapeHtml(t.iconText)}</span>` : '';
            const cls = disabled ? 'opacity-50 cursor-not-allowed' : active ? 'bg-[#2563eb]/15 text-[color:var(--rb-text)]' : 'text-[color:var(--rb-text-2)] hover:text-[color:var(--rb-text)]';
            return `
            <button type="button" data-rb-tab="${escapeHtml(t.key)}" data-rb-disabled="${disabled ? '1' : '0'}" data-rb-disabled-reason="${escapeHtml(disabledReason)}" class="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg ${cls} rb-ring">
              ${icon}<span class="font-semibold">${escapeHtml(t.name)}</span>
            </button>
          `;
        })
        .join('');

    tabsEl.innerHTML += `
      <button type="button" id="rb-tab-expand" class="ml-auto shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[color:var(--rb-text-2)] hover:text-[color:var(--rb-text)] rb-ring">
        <span>${isExpanded ? '收起' : '展开'}</span>
        <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
    `;

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
                const statusEl = qs('#rb-status');
                if (statusEl) {
                    statusEl.textContent = reason;
                }
                return;
            }
            const nextTabKey = btn.dataset.rbTab;
            navigateWith({ tab: nextTabKey, sub: null }, { replace: false });
        });
    }

    qs('#rb-tab-expand')?.addEventListener('click', () => {
        const next = !tabsEl.classList.contains('flex-wrap');
        localStorage.setItem('rebang:tabExpanded', String(next));
        renderTabs({ menu, categoryKey, tabKey: activeKey, subKey });
    });

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
            const cls = disabled ? 'opacity-50 cursor-not-allowed' : active ? 'text-[color:var(--rb-text)] border-b-2 border-[#2563eb]' : 'text-[color:var(--rb-text-2)] hover:text-[color:var(--rb-text)]';
            return `<button type="button" data-rb-sub="${escapeHtml(s.key)}" data-rb-disabled="${disabled ? '1' : '0'}" data-rb-disabled-reason="${escapeHtml(disabledReason)}" class="pb-1 ${cls} rb-ring">${escapeHtml(s.name)}</button>`;
        })
        .join('');

    for (const btn of el.querySelectorAll('[data-rb-sub]')) {
        btn.addEventListener('click', () => {
            if (btn.dataset.rbDisabled === '1') {
                const reason = btn.dataset.rbDisabledReason || '该子分类未启用';
                const statusEl = qs('#rb-status');
                if (statusEl) {
                    statusEl.textContent = reason;
                }
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

    const filtered = (items || []).filter((it) => {
        if (!blockWords.length) {
            return true;
        }
        return !blockWords.some((w) => w && it.title && String(it.title).includes(w));
    });

    listEl.innerHTML = filtered
        .map((it) => {
            const showImage = listDisplay !== 'noimage' && listDisplay !== 'compact';
            const showSummary = listDisplay !== 'compact';
            const img = showImage && it.image ? `<img src="${escapeHtml(it.image)}" class="w-28 h-20 object-cover rounded-lg border border-[var(--rb-border)]" loading="lazy" />` : '';
            const summary = showSummary && it.summary ? `<div class="mt-2 text-sm text-[color:var(--rb-text-2)] line-clamp-2">${escapeHtml(it.summary)}</div>` : '';
            const meta = `<div class="mt-3 flex items-center gap-2 text-xs text-[color:var(--rb-muted)]">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md rb-chip text-[color:var(--rb-text-2)] font-semibold">${escapeHtml(it.source?.name || '')}</span>
              <span>${escapeHtml(formatTime(it.datePublished) || '')}</span>
            </div>`;
            const target = openLink === 'new' ? ' target="_blank" rel="noreferrer noopener"' : '';
            return `
            <li class="px-4 py-4 flex gap-4">
              <div class="w-6 text-[#f97316] font-extrabold">${escapeHtml(it.rank)}</div>
              <div class="flex-1 min-w-0">
                <a class="rb-link font-bold text-base leading-6" href="${escapeHtml(it.link)}"${target}>${escapeHtml(it.title)}</a>
                ${summary}
                ${meta}
              </div>
              ${img ? `<div class="shrink-0">${img}</div>` : ''}
            </li>
          `;
        })
        .join('');
};

const fetchItems = async ({ categoryKey, tabKey, subKey }) => {
    const statusEl = qs('#rb-status');
    if (statusEl) {
        statusEl.textContent = '加载中...';
    }

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

const refreshList = async ({ menu, categoryKey, tabKey, subKey }) => {
    const state = normalizeState({ menu, categoryKey, tabKey, subKey });
    if (!state?.tab) {
        renderItems([]);
        qs('#rb-status').textContent = '暂无节点';
        return;
    }

    if (state.tab.disabled) {
        renderItems([]);
        qs('#rb-status').textContent = state.tab.disabledReason || '该节点未启用';
        return;
    }

    if (state.subKey && state.tab.subTabs?.length) {
        const matchedSub = state.tab.subTabs.find((s) => s.key === state.subKey);
        if (matchedSub?.disabled) {
            renderItems([]);
            qs('#rb-status').textContent = matchedSub.disabledReason || '该子分类未启用';
            return;
        }
    }

    try {
        const data = await fetchItems({ categoryKey: state.category.key, tabKey: state.tab.key, subKey: state.subKey });
        lastListData = data;
        renderItems(data.items);
        qs('#rb-status').textContent = data.errors?.length ? '部分来源加载失败' : '';
    } catch (error) {
        qs('#rb-status').textContent = error instanceof Error ? error.message : '加载失败';
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
            if (lastListData) {
                renderItems(lastListData.items);
            }
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
        if (!lastListData) {
            return;
        }
        const q = input.value.trim().toLowerCase();
        if (!q) {
            renderItems(lastListData.items);
            return;
        }
        const filtered = lastListData.items.filter(
            (it) =>
                String(it.title).toLowerCase().includes(q) ||
                String(it.summary || '')
                    .toLowerCase()
                    .includes(q)
        );
        renderItems(filtered.map((it, idx) => ({ ...it, rank: idx + 1 })));
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

    renderTabs({ menu, categoryKey, tabKey, subKey });
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
