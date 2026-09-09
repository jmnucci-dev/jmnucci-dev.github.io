(() => {
  'use strict';

  const { qs, qsa, dom, data, state, utils } = window.App;
  const { escapeHtml, highlightCode, itemKey, scrollToSection, closeMobileNav, openFolder, extractYouTubeId, youtubeThumbnail, youtubeEmbedSrc } = utils;

  function youtubeEmbedHtml(rawValue) {
    const id = extractYouTubeId(rawValue);
    if (!id) return `<div class="yt-embed yt-missing"><span>Video not found</span></div>`;
    return `<div class="yt-embed" data-yt-embed="${id}">
      <img src="${youtubeThumbnail(id)}" alt="" loading="lazy">
      <button type="button" class="yt-play" aria-label="Play video">▶</button>
    </div>`;
  }

  function bindYoutubeEmbeds(root, onPlay) {
    qsa('[data-yt-embed]', root).forEach(el => {
      el.addEventListener('click', event => {
        event.stopPropagation();
        const id = el.dataset.ytEmbed;
        el.innerHTML = `<iframe src="${youtubeEmbedSrc(id, true)}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`;
        el.classList.add('yt-playing');
        onPlay?.();
      }, { once: true });
    });
  }

  function mediaShowcase(name, p) {
    const folder = encodeURIComponent(name);
    const videos = Array.isArray(p.videos) ? p.videos : [];
    const images = Array.isArray(p.images) ? p.images : [];
    const items = [...videos.map(filename => ({ type: 'video', filename })), ...images.map(filename => ({ type: 'image', filename }))];

    if (!items.length) {
      return `<div class="media-showcase-empty"><span>${escapeHtml((p.category || 'PROJECT').split(' / ')[0])}</span><strong>${escapeHtml(name)}</strong></div>`;
    }

    const slides = items.map((item, index) => {
      const media = item.type === 'video'
        ? youtubeEmbedHtml(item.filename)
        : `<img src="projects/${folder}/images/${encodeURIComponent(item.filename)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.closest('.showcase-slide')?.classList.add('showcase-fallback')">`;
      return `<div class="showcase-slide ${index === 0 ? 'active' : ''}">${media}</div>`;
    }).join('');

    const nav = items.length > 1 ? `
      <button type="button" class="showcase-nav showcase-prev" data-showcase-prev aria-label="Previous media">‹</button>
      <button type="button" class="showcase-nav showcase-next" data-showcase-next aria-label="Next media">›</button>
      <div class="showcase-dots">${items.map((_, index) => `<span class="showcase-dot ${index === 0 ? 'active' : ''}" data-showcase-dot="${index}"></span>`).join('')}</div>` : '';

    return `<div class="media-showcase" data-showcase>
      <div class="showcase-track">${slides}</div>
      ${nav}
    </div>`;
  }

  function bindShowcase(root) {
    const slides = qsa('.showcase-slide', root);
    const dots = qsa('[data-showcase-dot]', root);
    let current = 0;
    let timer = null;

    function show(index) {
      current = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => show(current + 1), 5000);
    }

    bindYoutubeEmbeds(root, () => { if (timer) clearInterval(timer); });

    if (slides.length <= 1) return;

    qs('[data-showcase-prev]', root)?.addEventListener('click', event => { event.stopPropagation(); show(current - 1); restart(); });
    qs('[data-showcase-next]', root)?.addEventListener('click', event => { event.stopPropagation(); show(current + 1); restart(); });
    dots.forEach(dot => dot.addEventListener('click', event => { event.stopPropagation(); show(Number(dot.dataset.showcaseDot)); restart(); }));

    restart();
  }

  function renderMediaShowcases() {
    qsa('[data-showcase-target]').forEach(element => {
      const name = element.dataset.showcaseProject;
      const p = data.projectConfigs[name];
      if (!p) return;
      element.innerHTML = mediaShowcase(name, p);
      bindShowcase(element);
    });
  }

  function projectMedia(p, name) {
    const folder = encodeURIComponent(name);
    const images = Array.isArray(p.images) ? p.images : [];
    const videos = Array.isArray(p.videos) ? p.videos : [];

    const items = [
      ...videos.map((filename, index) => ({ type: 'video', filename, tag: `V${String(index + 1).padStart(2, '0')}` })),
      ...images.map((filename, index) => ({ type: 'image', filename, tag: String(index + 1).padStart(2, '0') })),
    ];

    if (!items.length) {
      return `<div class="media-empty"><span>MEDIA</span><p>Add screenshots or videos inside <code>projects/${escapeHtml(name)}/images/</code> and list their filenames in <code>config.js</code>.</p></div>`;
    }

    const slides = items.map((item, index) => {
      const label = item.type === 'video' ? 'YouTube' : escapeHtml(item.filename);
      const media = item.type === 'video'
        ? youtubeEmbedHtml(item.filename)
        : `<img src="projects/${folder}/images/${encodeURIComponent(item.filename)}" alt="${escapeHtml(name)}: ${label}" loading="lazy" onerror="this.remove(); this.closest('.media-slide')?.classList.add('media-fallback')">`;
      return `<figure class="media-slide ${index === 0 ? 'active' : ''}" data-media-index="${index}">
        ${media}
        <figcaption><span>${item.tag}</span><strong>${label}</strong></figcaption>
      </figure>`;
    }).join('');

    const nav = items.length > 1 ? `
      <div class="media-carousel-nav">
        <button type="button" class="media-nav-btn" data-media-prev aria-label="Previous media">‹</button>
        <span class="media-counter"><span data-media-current>1</span> / ${items.length}</span>
        <button type="button" class="media-nav-btn" data-media-next aria-label="Next media">›</button>
      </div>` : '';

    return `<div class="project-media-carousel">
      <div class="media-carousel-track">${slides}</div>
      ${nav}
    </div>`;
  }

  function renderProjectView(name) {
    const p = data.projectConfigs[name];
    if (!p) return '';
    const tags = (p.stack || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
    const features = (p.features || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const github = p.github && p.github !== '#' ? `<a class="text-link" href="${escapeHtml(p.github)}" target="_blank" rel="noopener">Open repository <span>↗</span></a>` : '<span class="private-label">SOURCE NOT PUBLIC</span>';
    const code = p.code ? `<section class="editor-panel code-panel">
      <div class="editor-panel-heading"><h2>Code example</h2></div>
      <div class="code-window"><div class="code-window-bar"><span>${escapeHtml(p.codeTitle || 'example')}</span><span>${escapeHtml(p.language || 'Source')}</span></div><pre><code>${highlightCode(p.code)}</code></pre></div>
      ${p.note ? `<p class="code-note">${escapeHtml(p.note)}</p>` : ''}
    </section>` : '';

    return `<article class="workspace-view project-editor-view">
      <div class="workspace-breadcrumb">projects / ${escapeHtml(name)} / config.js</div>
      <div class="project-editor-header">
        <div><p class="section-label">${escapeHtml(p.category || 'PROJECT')}</p><h1>${escapeHtml(name)}</h1><p class="project-editor-description">${escapeHtml(p.description || '')}</p></div>
        <div class="project-editor-meta">
          <div><span>STATUS</span><strong>${escapeHtml(p.status || '—')}</strong></div>
          <div><span>MAIN CHALLENGE</span><strong>${escapeHtml(p.challenge || '—')}</strong></div>
        </div>
      </div>
      <div class="project-editor-grid">
        <section class="editor-panel editor-overview">
          <div class="editor-panel-heading"><h2>Overview</h2></div>
          <p>${escapeHtml(p.architecture || 'No architecture notes added yet.')}</p>
          <div class="project-tech">${tags}</div>
        </section>
        <section class="editor-panel">
          <div class="editor-panel-heading"><h2>What I built</h2></div>
          <ul class="feature-list">${features || '<li>Add features to config.js</li>'}</ul>
        </section>
        <section class="editor-panel media-panel">
          <div class="editor-panel-heading"><h2>Media</h2></div>
          ${projectMedia(p, name)}
        </section>
        ${code}
        <section class="editor-panel editor-next">
          <div class="editor-panel-heading"><h2>Notes</h2></div>
          <p>${escapeHtml(p.extra || 'This page can contain anything that does not belong in the public repository: architecture notes, videos, screenshots, diagrams and source excerpts.')}</p>
          <div class="editor-footer-action">${github}</div>
        </section>
      </div>
    </article>`;
  }

  function renderAllProjectsView() {
    return `<article class="workspace-view all-projects-view">
      <div class="workspace-breadcrumb">projects / index</div>
      <div class="workspace-page-header"><p class="section-label">PROJECT INDEX</p><h1>All projects</h1><p>Everything I want to keep in the portfolio, not just the projects featured on the homepage.</p></div>
      <div class="all-projects-grid">${data.projectNames.map(name => {
        const p = data.projectConfigs[name] || {};
        return `<button class="all-project-card" type="button" data-project-open="${escapeHtml(name)}">
          <span class="project-kicker">${escapeHtml(p.category || 'PROJECT')}</span>
          <h3>${escapeHtml(name)}</h3>
          <p>${escapeHtml(p.description || '')}</p>
          <span class="text-link">Open project <span>→</span></span>
        </button>`;
      }).join('')}</div>
    </article>`;
  }

  function renderKnowledgeView(id) {
    const page = data.knowledgePages[id];
    if (!page) return '';
    const body = page.groups
      ? page.groups.map(([title, items]) => `<section class="knowledge-detail-block"><span>${escapeHtml(title)}</span><div class="knowledge-tags">${items.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div></section>`).join('')
      : page.sections.map(([title, text, target]) => `<button class="knowledge-detail-card" type="button" data-knowledge-open="${escapeHtml(target)}"><span>${escapeHtml(title)}</span><p>${escapeHtml(text)}</p><strong>Open page →</strong></button>`).join('');

    return `<article class="workspace-view knowledge-view">
      <div class="workspace-breadcrumb">knowledge / ${escapeHtml(id)}.md</div>
      <div class="workspace-page-header"><p class="section-label">${escapeHtml(page.category)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></div>
      <div class="knowledge-detail-grid">${body}</div>
      ${page.note ? `<aside class="knowledge-note"><span>NOTE</span><p>${escapeHtml(page.note)}</p></aside>` : ''}
    </article>`;
  }

  function tabLabel(key) {
    if (key === 'home') return 'Home';
    const [type, id] = key.split(':');
    if (key === 'projects:all') return 'All Projects';
    if (type === 'project') return id;
    if (type === 'terminal') return `Terminal ${id}`;
    return data.knowledgePages[id]?.title || id;
  }

  function renderTabs() {
    dom.workspaceTabs.innerHTML = state.openTabs.map(key => {
      const title = tabLabel(key);
      const icon = key === 'home' ? '⌂' : key.startsWith('project:') ? '◌' : key === 'projects:all' ? '▱' : key.startsWith('terminal:') ? '>_' : '□';
      const closeButton = key === 'home' ? '' : `<span class="tab-close" role="button" tabindex="0" aria-label="Close ${escapeHtml(title)}" data-close-key="${escapeHtml(key)}">×</span>`;
      return `<button class="project-tab ${state.activeTab === key ? 'active' : ''} ${key === 'home' ? 'pinned' : ''}" type="button" role="tab" aria-selected="${state.activeTab === key}" data-tab-key="${escapeHtml(key)}">
        <span class="tab-icon">${icon}</span><span class="tab-title">${escapeHtml(title)}</span>${closeButton}
      </button>`;
    }).join('');

    dom.workspaceTabs.querySelectorAll('[data-tab-key]').forEach(tab => {
      tab.addEventListener('click', event => {
        if (event.target.closest('[data-close-key]')) return;
        activateTab(tab.dataset.tabKey);
      });
    });
    dom.workspaceTabs.querySelectorAll('[data-close-key]').forEach(close => {
      close.addEventListener('click', event => {
        event.stopPropagation();
        closeTab(close.dataset.closeKey);
      });
      close.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          closeTab(close.dataset.closeKey);
        }
      });
    });
  }

  function renderActiveView() {
    if (!state.activeTab || state.activeTab === 'home') {
      dom.projectViews.innerHTML = '';
      return;
    }
    if (state.activeTab === 'projects:all') {
      dom.projectViews.innerHTML = renderAllProjectsView();
    } else {
      const [type, id] = state.activeTab.split(':');
      if (type === 'project') {
        dom.projectViews.innerHTML = renderProjectView(id);
      } else if (type === 'terminal') {
        dom.projectViews.innerHTML = `<article class="workspace-view terminal-view"><div class="workspace-breadcrumb">terminal / session ${escapeHtml(id)}</div></article>`;
        qs('.terminal-view', dom.projectViews)?.appendChild(window.App.terminal.render(id));
        setTimeout(() => window.App.terminal.focus(id), 30);
      } else {
        dom.projectViews.innerHTML = renderKnowledgeView(id);
      }
    }

    qsa('[data-project-open]', dom.projectViews).forEach(card => {
      card.addEventListener('click', () => openProject(card.dataset.projectOpen));
    });
    qsa('[data-knowledge-open]', dom.projectViews).forEach(card => {
      card.addEventListener('click', () => openKnowledge(card.dataset.knowledgeOpen));
    });
    qsa('.project-media-carousel', dom.projectViews).forEach(carousel => {
      bindYoutubeEmbeds(carousel);
      const slides = qsa('.media-slide', carousel);
      const counter = qs('[data-media-current]', carousel);
      let current = 0;
      function show(index) {
        current = ((index % slides.length) + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
        if (counter) counter.textContent = current + 1;
      }
      qs('[data-media-prev]', carousel)?.addEventListener('click', () => show(current - 1));
      qs('[data-media-next]', carousel)?.addEventListener('click', () => show(current + 1));
    });
  }

  function setWorkspaceOpen(open) {
    dom.workspace.classList.toggle('open', open);
    dom.workspace.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('project-open', open);
  }

  function syncSidebarActive() {
    qsa('.project-tree-item').forEach(el => {
      el.classList.toggle('active', state.activeTab === itemKey('project', el.dataset.projectOpen));
    });
    qsa('#folder-knowledge [data-open-knowledge]').forEach(el => {
      el.classList.toggle('active', state.activeTab === itemKey('knowledge', el.dataset.openKnowledge));
    });
    const allProjectsButton = qs('[data-open-all-projects]');
    allProjectsButton?.classList.toggle('active', state.activeTab === 'projects:all');
  }

  function updateStatusBar() {
    if (!dom.statusBreadcrumb || !dom.statusLang) return;
    if (!state.activeTab) {
      dom.statusBreadcrumb.textContent = 'No file open';
      dom.statusLang.textContent = '—';
      return;
    }
    if (state.activeTab === 'home') {
      dom.statusBreadcrumb.textContent = 'Home';
      dom.statusLang.textContent = '—';
      return;
    }
    if (state.activeTab === 'projects:all') {
      dom.statusBreadcrumb.textContent = 'projects / index';
      dom.statusLang.textContent = 'Directory';
      return;
    }
    const [type, id] = state.activeTab.split(':');
    if (type === 'project') {
      const p = data.projectConfigs[id] || {};
      dom.statusBreadcrumb.textContent = `projects / ${id} / config.js`;
      dom.statusLang.textContent = p.language || 'Config';
    } else if (type === 'terminal') {
      dom.statusBreadcrumb.textContent = `terminal / session ${id}`;
      dom.statusLang.textContent = 'Shell';
    } else {
      dom.statusBreadcrumb.textContent = `knowledge / ${id}.md`;
      dom.statusLang.textContent = 'Markdown';
    }
  }

  function renderWorkspace({ resetScroll = true } = {}) {
    renderTabs();
    renderActiveView();
    setWorkspaceOpen(!!state.activeTab && state.activeTab !== 'home');
    syncSidebarActive();
    updateStatusBar();
    if (resetScroll) dom.projectViews.scrollTop = 0;
  }

  function openTab(key) {
    if (!key) return;
    if (!state.openTabs.includes(key)) state.openTabs.push(key);
    state.activeTab = key;
    renderWorkspace();
    utils.updateHashForTab(key);
  }

  function activateTab(key) {
    if (!state.openTabs.includes(key)) return;
    state.activeTab = key;
    renderWorkspace();
    utils.updateHashForTab(key);
  }

  function closeTab(key) {
    if (key === 'home') return;
    const index = state.openTabs.indexOf(key);
    if (index < 0) return;
    if (key.startsWith('terminal:')) window.App.terminal.forget(key.split(':')[1]);
    const wasActive = state.activeTab === key;
    state.openTabs.splice(index, 1);
    if (wasActive) {
      state.activeTab = state.openTabs[index] || state.openTabs[index - 1] || 'home';
    }
    renderWorkspace();
    utils.updateHashForTab(state.activeTab === 'home' ? null : state.activeTab);
  }

  function closeWorkspace() {
    state.openTabs = ['home'];
    state.activeTab = 'home';
    renderWorkspace({ resetScroll: false });
    history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo({ top: state.lastScrollY, behavior: 'smooth' });
  }

  function focusHome(scrollId) {
    if (state.activeTab !== 'home') {
      state.activeTab = 'home';
      renderWorkspace({ resetScroll: false });
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (scrollId) scrollToSection(scrollId);
  }

  function openProject(name) {
    if (!data.projectConfigs[name]) return;
    openFolder('projects', false);
    openTab(itemKey('project', name));
    closeMobileNav();
  }

  function openAllProjects() {
    openFolder('projects', false);
    openTab('projects:all');
    closeMobileNav();
  }

  function openKnowledge(id) {
    if (!data.knowledgePages[id]) return;
    openFolder('knowledge', false);
    openTab(itemKey('knowledge', id));
    closeMobileNav();
  }

  function renderProjectTree() {
    if (!dom.projectTree) return;
    dom.projectTree.innerHTML = data.projectNames.map(name => `<button class="project-tree-item" type="button" data-project-open="${escapeHtml(name)}"><span>◌</span>${escapeHtml(name)}</button>`).join('');
    qsa('[data-project-open]', dom.projectTree).forEach(element => element.addEventListener('click', () => openProject(element.dataset.projectOpen)));
  }

  function renderHomepageProjects() {
    if (!dom.selectedWorkGrid) return;
    dom.selectedWorkGrid.innerHTML = data.homepageProjects.slice(0, 3).map(name => {
      const p = data.projectConfigs[name] || {};
      return `<article class="work-card reveal">
        <div class="work-media" data-showcase-target data-showcase-project="${escapeHtml(name)}"></div>
        <div class="work-card-body" data-project-open="${escapeHtml(name)}" tabindex="0" role="button">
          <div class="work-title-row"><div><span class="project-kicker">${escapeHtml((p.category || 'PROJECT').split(' / ')[0])}</span><h3>${escapeHtml(name)}</h3></div><span>↗</span></div>
          <p>${escapeHtml(p.description || '')}</p>
          <div class="tech-list">${(p.stack || []).slice(0, 4).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
        </div>
      </article>`;
    }).join('');
    qsa('[data-project-open]', dom.selectedWorkGrid).forEach(element => {
      element.addEventListener('click', () => openProject(element.dataset.projectOpen));
      element.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProject(element.dataset.projectOpen); }
      });
    });
    renderMediaShowcases();
  }

  window.App.workspace = {
    renderProjectTree, renderHomepageProjects, renderMediaShowcases, renderWorkspace,
    openTab, activateTab, closeTab, closeWorkspace, focusHome,
    openProject, openAllProjects, openKnowledge,
  };
})();
