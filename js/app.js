(() => {
  'use strict';

  const { qs, qsa, dom, state, utils, workspace, commandPalette } = window.App;

  dom.mobileMenu?.addEventListener('click', () => {
    const open = dom.sidebar.classList.toggle('open');
    dom.mobileMenu.classList.toggle('open', open);
    dom.mobileMenu.setAttribute('aria-expanded', String(open));
  });

  qsa('.nav-folder').forEach(folder => {
    folder.setAttribute('aria-expanded', 'false');
    folder.addEventListener('click', () => {
      const wasOpen = folder.classList.contains('open');
      folder.classList.toggle('open', !wasOpen);
      document.getElementById(`folder-${folder.dataset.folder}`)?.classList.toggle('open', !wasOpen);
      folder.setAttribute('aria-expanded', String(!wasOpen));
      workspace.focusHome(folder.dataset.folderScroll || folder.dataset.folder);
      utils.closeMobileNav();
    });
  });

  qsa('[data-scroll]').forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault();
      workspace.focusHome(element.dataset.scroll);
      utils.closeMobileNav();
    });
  });

  document.addEventListener('click', event => {
    const projectTrigger = event.target.closest('[data-project]');
    if (projectTrigger && !projectTrigger.closest('#projectWorkspace')) {
      event.preventDefault();
      workspace.openProject(projectTrigger.dataset.project);
    }

    const allProjectsTrigger = event.target.closest('[data-open-all-projects]');
    if (allProjectsTrigger) {
      event.preventDefault();
      utils.scrollToSection('work');
      workspace.openAllProjects();
    }

    const knowledgeTrigger = event.target.closest('[data-open-knowledge]');
    if (knowledgeTrigger && !knowledgeTrigger.closest('#projectWorkspace')) {
      event.preventDefault();
      workspace.openKnowledge(knowledgeTrigger.dataset.openKnowledge);
    }
  });

  qs('#closeWorkspace')?.addEventListener('click', workspace.closeWorkspace);

  window.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      commandPalette.toggle();
      return;
    }
    if (event.key === 'Escape') {
      if (dom.commandPalette.classList.contains('open')) { commandPalette.close(); return; }
      if (dom.sidebar?.classList.contains('open')) { utils.closeMobileNav(); return; }
      if (state.activeTab && state.activeTab !== 'home') workspace.closeTab(state.activeTab);
    }
  });

  document.addEventListener('click', event => {
    if (window.innerWidth > 820) return;
    if (!dom.sidebar?.classList.contains('open')) return;
    if (dom.sidebar.contains(event.target) || dom.mobileMenu?.contains(event.target)) return;
    utils.closeMobileNav();
  });

  window.addEventListener('hashchange', () => {
    const requested = utils.decodeHash();
    if (!requested) return;
    if (requested.startsWith('project:')) workspace.openProject(requested.slice('project:'.length));
    else if (requested.startsWith('knowledge:')) workspace.openKnowledge(requested.slice('knowledge:'.length));
    else if (requested === 'projects:all') workspace.openAllProjects();
  });

  qsa('.floating-project-info[data-project-open]').forEach(zone => {
    zone.addEventListener('click', () => workspace.openProject(zone.dataset.projectOpen));
    zone.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); workspace.openProject(zone.dataset.projectOpen); }
    });
  });

  qsa('.floating-project').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (window.innerWidth <= 820) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const base = card.classList.contains('project-front') ? 2 : -3;
      card.style.transform = `perspective(800px) rotate(${base + x * 2}deg) translate(${x * 5}px, ${y * 5}px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  workspace.renderProjectTree();
  workspace.renderHomepageProjects();

  qsa('[data-copy]').forEach(button => {
    button.addEventListener('click', () => {
      navigator.clipboard?.writeText(button.dataset.copy);
      const label = qs('span', button);
      if (!label) return;
      const original = label.textContent;
      label.textContent = 'Copied!';
      setTimeout(() => { label.textContent = original; }, 1500);
    });
  });

  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
      }), { threshold: 0.12 })
    : null;

  qsa('.reveal').forEach(element => revealObserver?.observe(element));

  const sections = qsa('main section[id]');
  const navLinks = qsa('.nav-item[data-scroll]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.dataset.scroll === entry.target.id));
    }), { rootMargin: '-32% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  workspace.renderWorkspace({ resetScroll: false });

  const initial = utils.decodeHash();
  if (initial) {
    if (initial.startsWith('project:')) workspace.openProject(initial.slice('project:'.length));
    else if (initial.startsWith('knowledge:')) workspace.openKnowledge(initial.slice('knowledge:'.length));
    else if (initial === 'projects:all') workspace.openAllProjects();
  }
})();
