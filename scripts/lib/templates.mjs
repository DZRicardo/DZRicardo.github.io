import { escapeAttr, escapeHtml, formatDate, truncate, withBase } from './utils.mjs';

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 14.2A8.5 8.5 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowUpRight: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function activeNav(currentPath, url) {
  if (url === '/') return currentPath === '/';
  return currentPath === url || currentPath.startsWith(url);
}

function navLinks(config, currentPath, base, className = '') {
  return config.nav
    .map((item) => {
      const active = activeNav(currentPath, item.url);
      return `<a class="${className}${active ? ' is-active' : ''}" href="${withBase(item.url, base)}"${active ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a>`;
    })
    .join('');
}

function socialLinks(config, base, className = '') {
  return config.social
    .map((item) => {
      const external = /^https?:\/\//i.test(item.url);
      const href = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(item.url) ? item.url : withBase(item.url, base);
      return `<a class="${className}" href="${escapeAttr(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(item.label)}${external ? '<span aria-hidden="true"> ↗</span>' : ''}</a>`;
    })
    .join('');
}

function postTags(post, base) {
  return post.tags
    .map(
      (tag) =>
        `<a class="tag" href="${withBase(tag.url, base)}">${escapeHtml(tag.name)}</a>`,
    )
    .join('');
}

function coverFor(post, base) {
  if (!post.cover) return '';
  return `<img src="${escapeAttr(withBase(post.cover, base))}" alt="" loading="${post.coverLoading || 'lazy'}" decoding="async">`;
}

export function renderLayout({
  config,
  base,
  title,
  description,
  content,
  currentPath,
  bodyClass = '',
  ogType = 'website',
  ogImage,
  canonical,
  jsonLd,
  noindex = false,
  isHome = false,
}) {
  const fullTitle = title ? `${title} — ${config.title}` : `${config.title} — ${config.tagline}`;
  const pageDescription = description || config.description;
  const canonicalUrl = canonical || config.url;
  const image = ogImage || `${config.url.replace(/\/$/, '')}${withBase('/assets/og-default.png', base)}`;
  const nav = navLinks(config, currentPath, base);
  const year = new Date().getFullYear();
  const startYear = Number(config.startYear) || year;
  const copyright = startYear < year ? `${startYear}–${year}` : `${year}`;

  return `<!doctype html>
<html lang="${escapeAttr(config.lang || 'zh-CN')}" data-theme="auto">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeAttr(pageDescription)}">
  <meta name="author" content="${escapeAttr(config.author)}">
  <meta name="site-base" content="${escapeAttr(base)}">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#f4efe4" id="theme-color">
  ${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow">'}
  <link rel="canonical" href="${escapeAttr(canonicalUrl)}">
  <link rel="icon" href="${withBase('/assets/favicon.svg', base)}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${withBase('/assets/apple-touch-icon.png', base)}">
  ${isHome && config.authorPhoto ? `<link rel="preload" as="image" href="${escapeAttr(withBase(config.authorPhoto, base))}" fetchpriority="high">` : ''}
  <link rel="stylesheet" href="${withBase('/assets/styles.css', base)}">
  <link rel="stylesheet" href="${withBase('/assets/theme.css', base)}">
  <link rel="stylesheet" href="${withBase('/assets/katex.min.css', base)}">
  <meta property="og:type" content="${escapeAttr(ogType)}">
  <meta property="og:site_name" content="${escapeAttr(config.title)}">
  <meta property="og:title" content="${escapeAttr(title || config.title)}">
  <meta property="og:description" content="${escapeAttr(pageDescription)}">
  <meta property="og:url" content="${escapeAttr(canonicalUrl)}">
  <meta property="og:image" content="${escapeAttr(image)}">
  <meta property="og:locale" content="${escapeAttr(config.locale || 'zh_CN')}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(title || config.title)}">
  <meta name="twitter:description" content="${escapeAttr(pageDescription)}">
  <meta name="twitter:image" content="${escapeAttr(image)}">
  <script>
    (function () {
      try {
        var saved = localStorage.getItem('nanchuang-theme');
        var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
      } catch (error) {}
    })();
  </script>
  ${jsonLd ? `<script type="application/ld+json">${safeJsonLd(jsonLd)}</script>` : ''}
</head>
<body class="${escapeAttr(bodyClass)}" id="top">
  <a class="skip-link" href="#main">跳到正文</a>
  <header class="site-header" id="site-header">
    <div class="header-inner">
      <a class="brand" href="${withBase('/', base)}" aria-label="${escapeAttr(config.title)} 首页">
        <span class="brand-mark" aria-hidden="true">${escapeHtml(config.mark || 'L')}</span>
        <span class="brand-text">
          <span class="brand-name">${escapeHtml(config.wordmark || config.title)}</span>
          <span class="brand-sub">psychology &amp; life</span>
        </span>
      </a>
      <nav class="site-nav" id="site-nav" aria-label="主导航">
        ${nav}
      </nav>
      <div class="header-actions">
        <button class="icon-btn" type="button" data-search-open aria-label="搜索文章" title="搜索 (Ctrl+K)">
          ${ICONS.search}
        </button>
        <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="切换明暗主题" title="切换主题">
          ${ICONS.sun}${ICONS.moon}
        </button>
        <button class="icon-btn menu-toggle" type="button" data-menu-toggle aria-label="打开菜单" aria-controls="site-nav" aria-expanded="false">
          <span class="menu-open">${ICONS.menu}</span><span class="menu-close">${ICONS.close}</span>
        </button>
      </div>
    </div>
    ${bodyClass.includes('is-post') ? '<div class="reading-progress" data-reading-progress aria-hidden="true"><span></span></div>' : ''}
  </header>

  <main id="main">
    ${content}
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <a class="brand brand-footer" href="${withBase('/', base)}">
          <span class="brand-mark" aria-hidden="true">${escapeHtml(config.mark || 'L')}</span>
          <span class="brand-name">${escapeHtml(config.wordmark || config.title)}</span>
        </a>
        <p>${escapeHtml(config.tagline)}</p>
        <p class="footer-note">${escapeHtml(config.footerNote || '在南方读心理学，也练习好好生活。')}</p>
      </div>
      <div class="footer-column">
        <p class="footer-label">浏览</p>
        ${navLinks(config, currentPath, base, 'footer-link')}
        <a class="footer-link" href="${withBase('/search/', base)}">搜索</a>
      </div>
      <div class="footer-column">
        <p class="footer-label">连接</p>
        ${socialLinks(config, base, 'footer-link') || '<p class="footer-empty">这里暂时没有别的入口。</p>'}
      </div>
    </div>
    <div class="container footer-disclaimer">
      <p>${escapeHtml(config.psychNote || '本站内容为个人学习与生活记录，不构成心理诊断或治疗建议。')}</p>
    </div>
    <div class="container footer-bottom">
      <p>© ${copyright} ${escapeHtml(config.author)}</p>
      <p class="footer-motto">${escapeHtml(config.motto || 'Slowly, honestly, and with care.')}</p>
      <a href="#top" class="back-top">回到顶部 <span aria-hidden="true">↑</span></a>
    </div>
  </footer>

  <dialog class="search-dialog" id="search-dialog" aria-labelledby="search-title">
    <div class="search-shell">
      <div class="search-head">
        <span class="search-icon">${ICONS.search}</span>
        <label class="sr-only" for="search-input" id="search-title">搜索文章</label>
        <input id="search-input" type="search" placeholder="搜索文章、情绪，或某个下午…" autocomplete="off" spellcheck="false">
        <kbd>Esc</kbd>
        <button class="icon-btn search-close" type="button" data-search-close aria-label="关闭搜索">${ICONS.close}</button>
      </div>
      <div class="search-results" data-search-results>
        <p class="search-hint">输入一个词，看看它在哪些日子里出现过。</p>
      </div>
      <div class="search-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
        <span><kbd>Enter</kbd> 打开</span>
        <span class="search-count" data-search-count></span>
      </div>
    </div>
  </dialog>

  <script src="${withBase('/assets/app.js', base)}" defer></script>
</body>
</html>`;
}

function renderCategoryBoard(categories, base, limit = 3) {
  return `<div class="category-board">${categories
    .map(
      (category, index) => `<section class="category-column">
        <a class="category-column-head" href="${withBase(category.url, base)}">
          <span class="category-column-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="category-column-name">${escapeHtml(category.name)}</span>
          <span class="category-column-count">${category.count} 篇</span>
        </a>
        <div class="category-column-list">
          ${category.posts
            .slice(0, limit)
            .map(
              (post) => `<a class="category-post" href="${withBase(post.url, base)}">
                <time datetime="${post.date}">${formatDate(post.date, 'short')}</time>
                <strong>${escapeHtml(post.title)}</strong>
                <p>${escapeHtml(truncate(post.summary, 120))}</p>
              </a>`,
            )
            .join('') || '<p class="category-empty">这个分类还在等第一篇文章。</p>'}
        </div>
        <a class="category-column-more" href="${withBase(category.url, base)}">查看全部 <span aria-hidden="true">→</span></a>
      </section>`,
    )
    .join('')}</div>`;
}

function renderSeriesCard(item, base) {
  const target = item.target || item.count || 1;
  const percent = Math.min(100, Math.round((item.count / target) * 100));
  return `<a class="series-card" href="${withBase(item.url, base)}">
    <div class="series-card-media">${item.cover ? `<img src="${escapeAttr(withBase(item.cover, base))}" alt="" loading="lazy" decoding="async">` : `<span class="series-glyph" aria-hidden="true">${escapeHtml(item.mark || '系')}</span><span class="series-media-label">长期专栏</span>`}</div>
    <div class="series-card-body">
      <div class="series-card-meta"><span>专栏</span><span>${escapeHtml(item.status)}</span></div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(truncate(item.description, 110))}</p>
      <div class="series-progress"><span style="width:${percent}%"></span></div>
      <div class="series-card-foot"><span>${item.count} 篇${item.target ? ` / 目标 ${item.target} 篇` : ''}</span><span>${item.latest ? `最近 ${escapeHtml(item.latest.series?.label || '')}` : '准备中'}</span></div>
    </div>
  </a>`;
}

export function renderHome({ config, base, posts, series, tags, categories, latest }) {
  const hero = config.hero || {};

  const feature = latest
    ? `<a class="latest-feature" href="${withBase(latest.url, base)}">
        <div class="latest-art">
          <span class="latest-glyph" aria-hidden="true">${escapeHtml(latest.glyph || '记')}</span>
          <span class="latest-category">${escapeHtml(latest.category.name)}</span>
          <span class="latest-stamp">NO. ${String(posts.length).padStart(2, '0')}</span>
        </div>
        <div class="latest-copy">
          <div class="latest-meta"><span>最新手记</span><time datetime="${latest.date}">${formatDate(latest.date, 'short')}</time><span>${latest.readingTime} 分钟</span></div>
          <h2>${escapeHtml(latest.title)}</h2>
          <p>${escapeHtml(truncate(latest.summary, 100))}</p>
          <span class="text-link">读这一篇 ${ICONS.arrow}</span>
        </div>
      </a>`
    : `<div class="latest-feature is-empty"><p>第一篇文章，正在路上。</p></div>`;

  const rest = posts.filter((post) => post.slug !== latest?.slug).slice(0, 4);
  const list = rest
    .map(
      (post) => `<a class="latest-item" href="${withBase(post.url, base)}">
        <div class="latest-item-meta"><time datetime="${post.date}">${formatDate(post.date, 'short')}</time><span>${escapeHtml(post.category.name)}</span></div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(truncate(post.summary, 64))}</p>
        <span class="latest-item-arrow" aria-hidden="true">↗</span>
      </a>`,
    )
    .join('');

  const categoryCards = categories
    .map((category, index) => {
      const mark = (config.categoryMarks && config.categoryMarks[category.name]) || '·';
      const recent = category.posts
        .slice(0, 2)
        .map((post) => post.title)
        .join(' · ');
      return `<a class="home-category" href="${withBase(category.url, base)}">
        <span class="home-category-mark" aria-hidden="true">${escapeHtml(mark)}</span>
        <span class="home-category-body">
          <span class="home-category-top"><strong>${escapeHtml(category.name)}</strong><span>${String(index + 1).padStart(2, '0')} / ${category.count} 篇</span></span>
          <span class="home-category-desc">${escapeHtml(category.description || '')}</span>
          <span class="home-category-recent">${escapeHtml(recent)}</span>
        </span>
        <span class="home-category-arrow" aria-hidden="true">↗</span>
      </a>`;
    })
    .join('');

  const tagCloud = tags
    .slice(0, 12)
    .map(
      (tag) =>
        `<a class="tag-pill" href="${withBase(tag.url, base)}"><span>${escapeHtml(tag.name)}</span><sup>${tag.count}</sup></a>`,
    )
    .join('');

  const now = config.now
    ? `<div class="now-card">
        <div class="now-head"><span class="live-dot" aria-hidden="true"></span><span>${escapeHtml(config.now.title || '此刻')}</span><span class="now-line"></span></div>
        <dl>${config.now.items.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join('')}</dl>
      </div>`
    : '';

  return `  <section class="home-hero container">
      <div class="home-hero-copy">
        <p class="eyebrow"><span class="live-dot" aria-hidden="true"></span>${escapeHtml(hero.eyebrow || '心理学 · 生活')}</p>
        <h1>${escapeHtml(hero.title || '把日子，')}<br><em>${escapeHtml(hero.titleAccent || '写成注脚。')}</em></h1>
        <p class="hero-intro">${escapeHtml(hero.intro || config.description)}</p>
        <div class="hero-actions">
          <a class="button" href="${latest ? withBase(latest.url, base) : withBase('/posts/', base)}">读最近一篇 ${ICONS.arrow}</a>
          <a class="text-link" href="${withBase('/about/', base)}">关于我 ${ICONS.arrowUpRight}</a>
        </div>
        <div class="hero-foot">
          <span>${posts.length} 篇文章</span>
          <span>${series.length} 个专栏</span>
          <span>${categories.length} 个分类</span>
          <span>${tags.length} 个标签</span>
        </div>
      </div>
      <div class="home-hero-art home-hero-art--author">
        ${hero.image ? `<img class="hero-window-backdrop" src="${escapeAttr(withBase(hero.image, base))}" alt="" aria-hidden="true" loading="eager" decoding="async">` : ''}
        <figure class="hero-author-card">
          <div class="hero-author-photo">
            <img src="${escapeAttr(withBase(config.authorPhoto, base))}" alt="${escapeAttr(config.authorPhotoAlt || `${config.author}的照片`)}" loading="eager" decoding="async" fetchpriority="high">
          </div>
          <figcaption class="hero-author-copy">
            <p class="hero-author-kicker">写这个博客的人</p>
            <p class="hero-author-name">${escapeHtml(config.author)}</p>
            <p class="hero-author-role">${escapeHtml(config.authorRole || '应用心理学硕士生 · 在南方生活')}</p>
            <p class="hero-author-note">“${escapeHtml(config.authorNote || '心理学不是读心术，是愿意多听一会儿。')}”</p>
            <a class="text-link" href="${withBase('/about/', base)}">认识一下 ${ICONS.arrowUpRight}</a>
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="section container latest-section">
      <div class="section-head">
        <div>
          <p class="section-kicker">01 / Recent notes</p>
          <h2>最近写下</h2>
        </div>
        <a class="section-more" href="${withBase('/posts/', base)}">全部手记 <span aria-hidden="true">→</span></a>
      </div>
      <div class="latest-layout">
        ${feature}
        <div class="latest-list">${list || '<p class="empty-state">更多文章正在路上。</p>'}</div>
      </div>
    </section>

    <section class="section container">
      <div class="section-head">
        <div>
          <p class="section-kicker">02 / Categories</p>
          <h2>常写的地方</h2>
        </div>
        <a class="section-more" href="${withBase('/categories/', base)}">全部分类 <span aria-hidden="true">→</span></a>
      </div>
      <div class="home-categories">${categoryCards || '<p class="empty-state">还没有分类。</p>'}</div>
    </section>

    <section class="section container">
      <div class="section-head">
        <div>
          <p class="section-kicker">03 / Series</p>
          <h2>慢慢写成的专栏</h2>
        </div>
        <a class="section-more" href="${withBase('/series/', base)}">全部专栏 <span aria-hidden="true">→</span></a>
      </div>
      <div class="series-grid">${series.map((item) => renderSeriesCard(item, base)).join('') || '<p class="empty-state">专栏正在筹备中。</p>'}</div>
    </section>

    <section class="section container">
      <div class="section-head">
        <div>
          <p class="section-kicker">04 / About</p>
          <h2>关于这个房间</h2>
        </div>
        <a class="section-more" href="${withBase('/about/', base)}">完整介绍 <span aria-hidden="true">→</span></a>
      </div>
      <div class="about-layout">
        <div class="about-quote-wrap">
          <p class="about-quote">“心理学不是读心术，<br>是愿意多听一会儿。”</p>
          <p class="about-bio">${escapeHtml(config.bio)}</p>
          <a class="text-link" href="${withBase('/about/', base)}">继续了解我 ${ICONS.arrow}</a>
        </div>
        ${now}
      </div>
    </section>

    <section class="section container">
      <div class="home-tags">
        <div class="home-tags-copy">
          <p class="section-kicker">05 / Keywords</p>
          <h2>常出现的词</h2>
          <p>标签把不同书架上的文章连在一起。可以随便点一个，看看它通向哪里。</p>
        </div>
        <div class="tag-cloud">${tagCloud || '<p class="empty-state">还没有标签。</p>'}</div>
      </div>
    </section>`;
}

export function renderPostCard(post, base, index) {
  return `<article class="post-card" style="--i:${index}">
    <a class="card-media" href="${withBase(post.url, base)}" aria-label="阅读：${escapeAttr(post.title)}">
      ${post.cover ? coverFor(post, base) : `<span class="card-glyph" aria-hidden="true">${escapeHtml(post.glyph || '记')}</span>`}
      <span class="card-category">${escapeHtml(post.category.name)}</span>
      <span class="card-number">${String(index).padStart(2, '0')}</span>
    </a>
    <div class="card-body">
      <div class="card-meta">
        <time datetime="${post.date}">${formatDate(post.date, 'short')}</time>
        <span class="dot" aria-hidden="true">·</span>
        <span>${post.readingTime} 分钟</span>
      </div>
      <h3><a class="card-title-link" href="${withBase(post.url, base)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(truncate(post.summary, 88))}</p>
      <div class="card-foot">
        <div class="tag-row">${postTags(post, base)}</div>
        <a class="card-arrow" href="${withBase(post.url, base)}" aria-label="阅读全文：${escapeAttr(post.title)}">${ICONS.arrowUpRight}</a>
      </div>
    </div>
  </article>`;
}

export function renderPostsIndex({ config, base, posts }) {
  const cards = posts.map((post, index) => renderPostCard(post, base, index + 1)).join('');
  return `  <section class="page-hero container">
      <p class="eyebrow">All notes · ${posts.length}</p>
      <h1>写过的，<em>都在这里。</em></h1>
      <p class="page-intro">从最近的一篇开始，或者随便挑一个顺眼的标题。写作是线性的，阅读不必是。心理学、生活、南方的天气，都在这里慢慢放着。</p>
    </section>
    <section class="container section section-tight">
      <div class="post-grid post-grid-all">${cards || '<p class="empty-state">还没有文章。</p>'}</div>
    </section>`;
}

export function renderArchives({ config, base, posts }) {
  const years = new Map();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(post);
  }
  const groups = [...years.entries()]
    .map(
      ([year, yearPosts]) => `<section class="archive-year">
        <div class="archive-year-label">
          <h2>${year}</h2>
          <span>${yearPosts.length} 篇</span>
        </div>
        <div class="archive-list">
          ${yearPosts
            .map(
              (post) => `<a class="archive-item" href="${withBase(post.url, base)}">
                <time datetime="${post.date}">${formatDate(post.date, 'month-day')}</time>
                <span class="archive-title">${escapeHtml(post.title)}</span>
                <span class="archive-tags">${escapeHtml(post.category.name)}${post.tags.length ? ` · ${post.tags.map((tag) => escapeHtml(tag.name)).join(' / ')}` : ''}</span>
                <span class="archive-arrow" aria-hidden="true">↗</span>
              </a>`,
            )
            .join('')}
        </div>
      </section>`,
    )
    .join('');

  return `  <section class="page-hero container">
      <p class="eyebrow">Archive · ${posts.length}</p>
      <h1>日子叠在<em>一起。</em></h1>
      <p class="page-intro">按年份排列的全部文字。有些想法已经改变，有些仍然成立，这大概就是记录的意义。</p>
    </section>
    <section class="container section section-tight archive">${groups || '<p class="empty-state">还没有文章。</p>'}</section>`;
}

export function renderPost({ config, base, post, prev, next }) {
  const toc =
    post.headings.length > 1
      ? `<aside class="post-aside">
          <div class="toc">
            <p class="toc-label">目录</p>
            <nav aria-label="文章目录">
              ${post.headings
                .map(
                  (heading) =>
                    `<a class="toc-link toc-level-${heading.level}" href="#${escapeAttr(heading.id)}">${escapeHtml(heading.text)}</a>`,
                )
                .join('')}
            </nav>
          </div>
        </aside>`
      : '';

  const pager = prev || next
    ? `<nav class="post-pager" aria-label="上一篇和下一篇">
        ${prev ? `<a class="pager-card pager-prev" href="${withBase(prev.url, base)}"><span class="pager-label">← 上一篇</span><strong>${escapeHtml(prev.title)}</strong></a>` : '<span></span>'}
        ${next ? `<a class="pager-card pager-next" href="${withBase(next.url, base)}"><span class="pager-label">下一篇 →</span><strong>${escapeHtml(next.title)}</strong></a>` : '<span></span>'}
      </nav>`
    : '';

  const taxonomy = `<div class="post-taxonomy">
    <div class="post-tax-row">
      <span class="post-tax-label">分类：</span>
      <a class="post-tax-link" href="${withBase(post.category.url, base)}">${escapeHtml(post.category.name)}</a>
    </div>
    <div class="post-tax-row">
      <span class="post-tax-label">标签：</span>
      ${post.tags.length ? post.tags.map((tag) => `<a class="post-tax-link" href="${withBase(tag.url, base)}">${escapeHtml(tag.name)}</a>`).join(' ') : '<span class="post-tax-empty">暂无</span>'}
    </div>
    ${
      post.series
        ? `<div class="post-tax-row post-tax-series">
            <span class="post-tax-label">本文收录于</span>
            <a class="post-tax-link" href="${withBase(post.series.url, base)}">《${escapeHtml(post.series.title)}》</a>
            <span class="post-tax-extra">${escapeHtml(post.series.label)}</span>
          </div>`
        : ''
    }
  </div>`;

  return `  <article class="post container template-post">
      <header class="post-header">
        <a class="back-link" href="${withBase('/posts/', base)}">← 所有文章</a>
        <div class="post-heading">
          <div class="post-meta">
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            <span class="dot" aria-hidden="true">·</span>
            <span>${post.readingTime} 分钟阅读</span>
          </div>
          <h1>${escapeHtml(post.title)}</h1>
          ${post.summary ? `<p class="post-dek">${escapeHtml(post.summary)}</p>` : ''}
          ${taxonomy}
        </div>
      </header>

      ${post.cover ? `<figure class="post-cover">${coverFor({ ...post, coverLoading: 'eager' }, base)}</figure>` : ''}

      <div class="post-layout">
        <div class="prose" data-prose>
          ${post.html}
        </div>
        ${toc}
      </div>

      <footer class="post-footer">
        <div class="post-end-mark" aria-hidden="true">○</div>
        <p>写到这里。谢谢你读到这里。</p>
        <div class="tag-row post-tags">${postTags(post, base)}</div>
        <a class="text-link" href="${withBase('/posts/', base)}">继续翻阅其他手记 ${ICONS.arrow}</a>
        <p class="post-disclaimer">${escapeHtml(config.psychNote || '本文为个人学习与生活记录，不构成心理诊断或治疗建议。')}</p>
      </footer>
      ${pager}
      ${renderComments(config, base)}
    </article>`;
}

export function renderTags({ config, base, tags }) {
  const cards = tags
    .map(
      (tag, index) => `<a class="tag-card" href="${withBase(tag.url, base)}" data-tag-name="${escapeAttr(tag.name.toLowerCase())}">
        <span class="tag-card-index">${String(index + 1).padStart(2, '0')}</span>
        <h2>${escapeHtml(tag.name)}</h2>
        <p>${tag.count} 篇文章</p>
        <span class="tag-card-arrow" aria-hidden="true">↗</span>
      </a>`,
    )
    .join('');

  return `  <section class="page-hero container tags-hero">
      <div class="tags-hero-copy">
        <p class="eyebrow">Tags · ${tags.length}</p>
        <h1>散落的<em>关键词。</em></h1>
        <p class="page-intro">标签不隶属于某一个分类：同一个“倾听”可以出现在心理学笔记、生活切片和阅读里。它们负责把不同书架上的文章连在一起。</p>
      </div>
      <div class="tag-search-panel">
        <label for="tag-filter-input">搜索标签</label>
        <div class="tag-search-field">
          <span class="search-icon">${ICONS.search}</span>
          <input id="tag-filter-input" type="search" placeholder="输入标签名…" autocomplete="off" spellcheck="false">
        </div>
        <p class="tag-search-count" data-tag-count>${tags.length} 个标签</p>
      </div>
    </section>
    <section class="container section section-tight">
      <div class="tag-grid" data-tag-grid>${cards || '<p class="empty-state">还没有标签。</p>'}</div>
      <p class="tag-filter-empty" data-tag-empty hidden>没有找到匹配的标签。</p>
    </section>`;
}

export function renderTag({ config, base, tag, posts }) {
  const cards = posts.map((post, index) => renderPostCard(post, base, index + 1)).join('');
  return `  <section class="page-hero container tag-page-hero">
      <a class="back-link" href="${withBase('/tags/', base)}">← 所有标签</a>
      <p class="eyebrow">Topic · ${tag.count} notes</p>
      <h1>关于<em>「${escapeHtml(tag.name)}」</em></h1>
      <p class="page-intro">${escapeHtml(tag.description || `所有标记为「${tag.name}」的文字，按时间从新到旧排列。`)}</p>
    </section>
    <section class="container section section-tight">
      <div class="post-grid post-grid-all">${cards}</div>
    </section>`;
}

export function renderSeriesIndex({ config, base, series }) {
  return `  <section class="page-hero container">
      <p class="eyebrow">Series · ${series.length}</p>
      <h1>慢慢写成的<em>文章集。</em></h1>
      <p class="page-intro">专栏不是零散的文章，而是一条会持续很久的路径。可以按顺序从头读，也可以在需要时回来查某一篇。</p>
    </section>
    <section class="container section section-tight">
      <div class="series-grid series-grid-page">${series.map((item) => renderSeriesCard(item, base)).join('') || '<p class="empty-state">专栏正在筹备中。</p>'}</div>
    </section>`;
}

export function renderSeries({ config, base, series }) {
  const target = series.target || series.count || 1;
  const percent = Math.min(100, Math.round((series.count / target) * 100));
  const parts = series.posts
    .map(
      (post) => `<a class="series-part" href="${withBase(post.url, base)}">
        <span class="series-part-label">${escapeHtml(post.series.label || '')}</span>
        <span class="series-part-body">
          <strong>${escapeHtml(post.title)}</strong>
          <p>${escapeHtml(truncate(post.summary, 120))}</p>
        </span>
        <time datetime="${post.date}">${formatDate(post.date, 'short')}</time>
        <span class="series-part-arrow" aria-hidden="true">↗</span>
      </a>`,
    )
    .join('');

  return `  <section class="series-hero container">
      <div class="series-hero-cover">${series.cover ? `<img src="${escapeAttr(withBase(series.cover, base))}" alt="" loading="eager" decoding="async">` : `<span class="series-hero-glyph" aria-hidden="true">${escapeHtml(series.mark || '系')}</span><span class="series-hero-label">长期专栏</span>`}</div>
      <div class="series-hero-copy">
        <a class="back-link" href="${withBase('/series/', base)}">← 所有专栏</a>
        <p class="eyebrow">Series · ${escapeHtml(series.status)}</p>
        <h1>${escapeHtml(series.title)}</h1>
        <p class="page-intro">${escapeHtml(series.description)}</p>
        <div class="series-hero-stats">
          <span><strong>${series.count}</strong> 篇已更新</span>
          ${series.target ? `<span><strong>${series.target}</strong> 篇计划</span>` : ''}
          <span>${percent}% 完成</span>
        </div>
        <div class="series-progress series-progress-large"><span style="width:${percent}%"></span></div>
      </div>
    </section>
    <section class="container section series-parts-section">
      <div class="section-head">
        <div>
          <p class="section-kicker">01 / Contents</p>
          <h2>篇目</h2>
        </div>
        <span class="section-more">${series.latest ? `最近更新 ${escapeHtml(series.latest.series?.label || '')}` : '等待第一篇'}</span>
      </div>
      <div class="series-parts">${parts || '<p class="empty-state">这个专栏还在准备中。</p>'}</div>
    </section>
    ${
      series.html.trim()
        ? `<section class="container series-about"><div class="prose">${series.html}</div></section>`
        : ''
    }`;
}

export function renderCategories({ config, base, categories }) {
  return `  <section class="page-hero container">
      <p class="eyebrow">Categories · ${categories.length}</p>
      <h1>固定的<em>书架。</em></h1>
      <p class="page-intro">分类是稳定的书架：每篇文章只归入一个分类。每一栏下面是这个分类最近更新的三篇文章；标签则是可以同时贴在很多书架上的关键词。</p>
    </section>
    <section class="container section section-tight">
      ${renderCategoryBoard(categories, base) || '<p class="empty-state">还没有分类。</p>'}
      <div class="category-note">
        <p><strong>分类</strong> 用来回答「这篇文章属于哪个领域」；<strong>标签</strong> 用来回答「它还和什么有关」。</p>
        <a class="text-link" href="${withBase('/tags/', base)}">去看标签索引 ${ICONS.arrow}</a>
      </div>
    </section>`;
}

export function renderCategory({ config, base, category, posts }) {
  const cards = posts.map((post, index) => renderPostCard(post, base, index + 1)).join('');
  return `  <section class="page-hero container category-page-hero">
      <a class="back-link" href="${withBase('/categories/', base)}">← 所有分类</a>
      <p class="eyebrow">Category · ${category.count} notes</p>
      <h1><em>${escapeHtml(category.name)}</em></h1>
      <p class="page-intro">${escapeHtml(category.description || `归在这个分类下的全部文章，按时间从新到旧排列。`)}</p>
    </section>
    <section class="container section section-tight">
      <div class="post-grid post-grid-all">${cards}</div>
    </section>`;
}

function renderComments(config, base) {
  const comments = config.comments || {};
  const provider = String(comments.provider || 'none').toLowerCase();
  if (provider === 'none') return '';

  const repo = String(comments.repo || '').trim();
  const repoReady = repo && !/yourname|your-name|username|example/i.test(repo);

  const pending = `<section class="comments comments-pending" id="comments" data-comments-pending>
      <div class="comments-head">
        <div>
          <p class="section-kicker">Discussion</p>
          <h2>讨论</h2>
        </div>
        <p>留言框等 Giscus 配置完成后就会出现。</p>
      </div>
      <div class="comments-pending-body">
        <span class="comments-pending-mark" aria-hidden="true">○</span>
        <div>
          <h3>评论区正在准备中</h3>
          <p>这里以后会用 GitHub Discussions 留言。评论会公开显示，请不要写下自己或他人的隐私信息。</p>
        </div>
      </div>
    </section>`;

  if (!repoReady) return pending;
  if (provider !== 'giscus') return pending;
  if (!comments.repoId || !comments.categoryId) return pending;

  const widget = `<script src="https://giscus.app/client.js"
        data-repo="${escapeAttr(repo)}"
        data-repo-id="${escapeAttr(comments.repoId)}"
        data-category="${escapeAttr(comments.category || 'Announcements')}"
        data-category-id="${escapeAttr(comments.categoryId)}"
        data-mapping="${escapeAttr(comments.mapping || 'pathname')}"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async></script>`;

  return `<section class="comments" id="comments" data-comments data-provider="giscus">
      <div class="comments-head">
        <div>
          <p class="section-kicker">Discussion</p>
          <h2>讨论</h2>
        </div>
        <p>评论由 GitHub Discussions 托管。登录 GitHub 后即可留言。评论会公开显示，请保护自己和他人的隐私。</p>
      </div>
      <div class="comments-body">${widget}<noscript><p>评论区需要启用 JavaScript。</p></noscript></div>
      <p class="comments-fallback">如果留言框没有加载，可以尝试关掉watttoolkit等加速器，或者直接去 <a href="https://github.com/${escapeAttr(repo)}/discussions" target="_blank" rel="noopener noreferrer">GitHub Discussions</a> 参与讨论。</p>
    </section>`;
}

export function renderSearchPage({ config, base, posts }) {
  return `  <section class="page-hero container search-page-hero">
      <p class="eyebrow">Search · ${posts.length}</p>
      <h1>找一个<em>词。</em></h1>
      <p class="page-intro">标题、分类、标签、正文都可以搜。输入一个你记得的片段，剩下的交给这里。</p>
      <div class="page-search">
        <span class="search-icon">${ICONS.search}</span>
        <label class="sr-only" for="page-search-input">搜索文章</label>
        <input id="page-search-input" type="search" placeholder="例如：梅雨、共情、边界…" autocomplete="off">
      </div>
      <div class="page-search-results" data-page-search-results>
        <p class="search-hint">输入关键词开始搜索。</p>
      </div>
    </section>`;
}

export function renderPage({ config, base, page }) {
  return `  <article class="page container">
      <header class="page-hero page-hero-inner${page.photo ? ' page-hero-with-photo' : ''}">
        <div class="page-hero-copy">
          ${page.eyebrow ? `<p class="eyebrow">${escapeHtml(page.eyebrow)}</p>` : ''}
          <h1>${escapeHtml(page.title)}</h1>
          ${page.summary ? `<p class="page-intro">${escapeHtml(page.summary)}</p>` : ''}
        </div>
        ${page.photo ? `<figure class="page-portrait">
          <img src="${escapeAttr(withBase(page.photo, base))}" alt="${escapeAttr(page.photoAlt || `${config.author}的照片`)}" loading="eager" decoding="async">
          ${page.photoCaption ? `<figcaption>${escapeHtml(page.photoCaption)}</figcaption>` : ''}
        </figure>` : ''}
      </header>
      <div class="prose page-prose">
        ${page.html}
      </div>
      <div class="page-signoff">
        <span class="brand-mark" aria-hidden="true">${escapeHtml(config.mark || '窗')}</span>
        <p>${escapeHtml(config.author)}<br><span>${escapeHtml(config.tagline)}</span></p>
      </div>
    </article>`;
}

export function renderLinks({ config, base }) {
  const friends = Array.isArray(config.friends) ? config.friends : [];
  const hostname = (url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const cards = friends
    .map((friend) => {
      const initial = [...String(friend.name || '?')][0] || '·';
      return `<a class="friend-card" href="${escapeAttr(friend.url)}" target="_blank" rel="noopener noreferrer">
        <span class="friend-avatar">${friend.avatar ? `<img src="${escapeAttr(withBase(friend.avatar, base))}" alt="" loading="lazy" decoding="async">` : escapeHtml(initial)}</span>
        <span class="friend-body">
          <strong>${escapeHtml(friend.name)}</strong>
          <span class="friend-host">${escapeHtml(hostname(friend.url))}</span>
          <p>${escapeHtml(friend.description || '一个值得去看看的地方。')}</p>
        </span>
        <span class="friend-arrow" aria-hidden="true">${ICONS.arrowUpRight}</span>
      </a>`;
    })
    .join('');

  const applyUrl = config.friendApplyUrl || '';

  return `  <section class="page-hero container links-hero">
      <p class="eyebrow">Links · ${friends.length}</p>
      <h1>去别人家的<em>花园坐坐。</em></h1>
      <p class="page-intro">互联网不只有信息流和推荐算法。这里以后会收集一些朋友的站点，以及那些值得绕路去看的地方。</p>
    </section>

    <section class="container section section-tight">
      <div class="section-head">
        <div>
          <p class="section-kicker">01 / Friends</p>
          <h2>友邻</h2>
        </div>
        <span class="section-more">${friends.length ? `${friends.length} 个链接` : '虚位以待'}</span>
      </div>
      ${
        friends.length
          ? `<div class="friends-grid">${cards}</div>`
          : `<div class="friend-empty">
              <span class="friend-empty-mark" aria-hidden="true">○</span>
              <div>
                <h3>这里还空着。</h3>
                <p>第一批友邻正在路上。这个站点还很年轻，想先把自己的院子打理好，再慢慢邀请别人进来坐。</p>
                <a class="text-link" href="#exchange">关于交换友邻 ${ICONS.arrow}</a>
              </div>
            </div>`
      }
    </section>

    <section class="container section links-exchange" id="exchange">
      <div class="exchange-main">
        <p class="section-kicker">02 / Exchange</p>
        <h2>交换友邻</h2>
        <p>我喜欢那些有自己节奏的网站：不一定要日更，但能看出主人在认真照料它。</p>
        <ul class="exchange-rules">
          <li>站点有持续更新的原创内容，生活、心理、阅读或设计都欢迎；</li>
          <li>没有大面积广告、弹窗或强制跳转；</li>
          <li>愿意在站内保留一个友情链接入口；</li>
          <li>不要求日更，但要能看出这是一个具体的人在写字。</li>
        </ul>
        ${applyUrl ? `<a class="button" href="${escapeAttr(applyUrl)}" target="_blank" rel="noopener noreferrer">申请交换 ${ICONS.arrowUpRight}</a>` : '<p class="exchange-note">友邻申请暂时没有开放。等这里再长大一点，我会把联系方式放在这一页。</p>'}
      </div>
      <aside class="site-badge">
        <p class="footer-label">This site</p>
        <span class="site-badge-mark" aria-hidden="true">${escapeHtml(config.mark || '窗')}</span>
        <h3>${escapeHtml(config.title)}</h3>
        <p>${escapeHtml(config.tagline)}</p>
        <dl>
          <div><dt>地址</dt><dd>${escapeHtml(config.url)}</dd></div>
          <div><dt>简介</dt><dd>${escapeHtml(config.description)}</dd></div>
        </dl>
      </aside>
    </section>`;
}

export function render404({ config, base }) {
  return `  <section class="not-found container">
      <p class="eyebrow">404 · Undefined</p>
      <p class="not-found-number" aria-hidden="true">404</p>
      <h1>这一页，<em>走神了。</em></h1>
      <p>可能是链接变了，也可能它从来没有存在过。不如回到首页，慢慢重新开始。</p>
      <a class="button" href="${withBase('/', base)}">回到首页 ${ICONS.arrow}</a>
    </section>`;
}
