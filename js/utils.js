(() => {
  'use strict';

  const { qs, data, state, dom } = window.App;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }

  const CODE_TOKEN_PATTERN = /(--\[\[[\s\S]*?\]\]|--[^\n]*|#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:function|local|if|then|else|elseif|end|return|not|and|or|true|false|nil|for|while|do|in|break|continue|self|repeat|until|class|def|import|from|as|with|None|True|False|const|let|var|new)\b)|(\b\d+\.?\d*\b)/g;

  function highlightCode(raw) {
    const source = String(raw ?? '');
    let output = '';
    let lastIndex = 0;
    let match;
    CODE_TOKEN_PATTERN.lastIndex = 0;
    while ((match = CODE_TOKEN_PATTERN.exec(source))) {
      if (match.index > lastIndex) output += escapeHtml(source.slice(lastIndex, match.index));
      if (match[1]) output += `<span class="tok-comment">${escapeHtml(match[1])}</span>`;
      else if (match[2]) output += `<span class="tok-string">${escapeHtml(match[2])}</span>`;
      else if (match[3]) output += `<span class="tok-keyword">${escapeHtml(match[3])}</span>`;
      else if (match[4]) output += `<span class="tok-number">${escapeHtml(match[4])}</span>`;
      lastIndex = CODE_TOKEN_PATTERN.lastIndex;
    }
    output += escapeHtml(source.slice(lastIndex));
    return output.split('\n').map(line => `<span class="code-line">${line}</span>`).join('\n');
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function itemKey(type, id) {
    return `${type}:${id}`;
  }

  const YT_ID_PATTERN = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|watch\?v=|watch\?[^#]*&v=))([\w-]{11})/;
  const YT_BARE_ID_PATTERN = /^[\w-]{11}$/;

  function extractYouTubeId(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const match = raw.match(YT_ID_PATTERN);
    if (match) return match[1];
    return YT_BARE_ID_PATTERN.test(raw) ? raw : null;
  }

  function youtubeThumbnail(id) {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }

  function youtubeEmbedSrc(id, autoplay) {
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
    if (autoplay) params.set('autoplay', '1');
    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
  }

  function decodeHash() {
    const hash = location.hash.replace(/^#/, '');
    if (!hash) return null;
    const parts = hash.split('/');
    if (parts[0] === 'project' && parts[1]) {
      const project = data.projectNames.find(name => slugify(name) === parts[1]);
      return project ? itemKey('project', project) : null;
    }
    if (parts[0] === 'knowledge' && parts[1] && data.knowledgePages[parts[1]]) {
      return itemKey('knowledge', parts[1]);
    }
    if (parts[0] === 'projects') return 'projects:all';
    return null;
  }

  function updateHashForTab(key) {
    if (!key) {
      history.replaceState(null, '', location.pathname + location.search);
      return;
    }
    const [type, id] = key.split(':');
    if (type === 'project') history.replaceState(null, '', `#project/${slugify(id)}`);
    else if (type === 'knowledge') history.replaceState(null, '', `#knowledge/${id}`);
    else if (key === 'projects:all') history.replaceState(null, '', '#projects');
  }

  function scrollToSection(id) {
    const element = document.getElementById(id);
    if (!element) return;
    state.lastScrollY = window.scrollY;
    const top = element.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function closeMobileNav() {
    if (window.innerWidth > 820) return;
    dom.sidebar?.classList.remove('open');
    dom.mobileMenu?.classList.remove('open');
    dom.mobileMenu?.setAttribute('aria-expanded', 'false');
  }

  function openFolder(folderName, shouldScroll = true) {
    const folderButton = qs(`.nav-folder[data-folder="${folderName}"]`);
    const folderContent = document.getElementById(`folder-${folderName}`);
    if (!folderButton || !folderContent) return;
    folderButton.classList.add('open');
    folderButton.setAttribute('aria-expanded', 'true');
    folderContent.classList.add('open');
    if (shouldScroll) scrollToSection(folderButton.dataset.folderScroll || folderName);
  }

  window.App.utils = {
    escapeHtml, highlightCode, slugify, itemKey,
    decodeHash, updateHashForTab, scrollToSection,
    closeMobileNav, openFolder,
    extractYouTubeId, youtubeThumbnail, youtubeEmbedSrc,
  };
})();
