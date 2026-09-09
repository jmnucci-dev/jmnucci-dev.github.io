(() => {
  'use strict';

  const { qs, dom, data, utils, workspace, terminal } = window.App;
  const { escapeHtml, scrollToSection } = utils;

  const sectionCommands = [
    ['Home', 'hero'], ['What I Do', 'what-i-do'], ['Selected Work', 'work'],
    ['Knowledge', 'knowledge'], ['About', 'about'], ['Experience', 'experience'],
    ['Workflow', 'workflow'], ['Contact', 'contact'],
  ];

  function buildCommandItems() {
    const items = [];
    sectionCommands.forEach(([label, id]) => items.push({ label, type: 'SECTION', icon: '○', action: () => scrollToSection(id) }));
    items.push({ label: 'All Projects', type: 'PAGE', icon: '▱', action: workspace.openAllProjects });
    items.push({ label: 'New Terminal', type: 'ACTION', icon: '>_', action: () => terminal.open() });
    data.projectNames.forEach(name => items.push({ label: name, type: 'PROJECT', icon: '◌', action: () => workspace.openProject(name) }));
    Object.entries(data.knowledgePages).forEach(([id, page]) => items.push({ label: page.title, type: 'KNOWLEDGE', icon: '□', action: () => workspace.openKnowledge(id) }));
    return items;
  }

  const commandItems = buildCommandItems();
  let cpActiveIndex = 0;
  let cpFiltered = commandItems;

  function renderCommandPalette() {
    if (!cpFiltered.length) {
      dom.commandPaletteResults.innerHTML = '<div class="cp-empty">No matches. Try a different search.</div>';
      return;
    }
    dom.commandPaletteResults.innerHTML = cpFiltered.map((item, index) => `
      <button class="cp-item ${index === cpActiveIndex ? 'active' : ''}" type="button" data-cp-index="${index}">
        <span class="cp-icon">${item.icon}</span><span class="cp-label">${escapeHtml(item.label)}</span><span class="cp-type">${item.type}</span>
      </button>`).join('');
    dom.commandPaletteResults.querySelectorAll('[data-cp-index]').forEach(button => {
      button.addEventListener('click', () => runCommandItem(Number(button.dataset.cpIndex)));
    });
  }

  function filterCommandPalette(query) {
    const q = query.trim().toLowerCase();
    cpFiltered = q ? commandItems.filter(item => item.label.toLowerCase().includes(q)) : commandItems;
    cpActiveIndex = 0;
    renderCommandPalette();
  }

  function runCommandItem(index) {
    const item = cpFiltered[index];
    if (!item) return;
    closeCommandPalette();
    item.action();
  }

  function openCommandPalette() {
    dom.commandPalette.classList.add('open');
    dom.commandPalette.setAttribute('aria-hidden', 'false');
    dom.commandPaletteInput.value = '';
    filterCommandPalette('');
    setTimeout(() => dom.commandPaletteInput.focus(), 0);
  }

  function closeCommandPalette() {
    dom.commandPalette.classList.remove('open');
    dom.commandPalette.setAttribute('aria-hidden', 'true');
  }

  function toggleCommandPalette() {
    dom.commandPalette.classList.contains('open') ? closeCommandPalette() : openCommandPalette();
  }

  qs('#cmdkHint')?.addEventListener('click', openCommandPalette);
  dom.commandPalette.querySelectorAll('[data-cp-close]').forEach(el => el.addEventListener('click', closeCommandPalette));
  dom.commandPaletteInput?.addEventListener('input', event => filterCommandPalette(event.target.value));
  dom.commandPaletteInput?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); cpActiveIndex = Math.min(cpActiveIndex + 1, cpFiltered.length - 1); renderCommandPalette(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); cpActiveIndex = Math.max(cpActiveIndex - 1, 0); renderCommandPalette(); }
    else if (event.key === 'Enter') { event.preventDefault(); runCommandItem(cpActiveIndex); }
  });

  window.App.commandPalette = {
    open: openCommandPalette,
    close: closeCommandPalette,
    toggle: toggleCommandPalette,
  };
})();
