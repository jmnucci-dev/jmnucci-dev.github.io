(() => {
  'use strict';

  window.App = window.App || {};

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const projectConfigs = window.PROJECT_CONFIGS || {};
  const projectNames = (window.PROJECT_REGISTRY || []).filter(name => projectConfigs[name]);
  const featuredHeroName = document.querySelector('.featured-project [data-project]')?.dataset.project;
  const gridPool = projectNames.filter(name => name !== featuredHeroName);
  const gridFeatured = gridPool.filter(name => projectConfigs[name]?.featured);
  const homepageProjects = (gridFeatured.length ? gridFeatured : gridPool).slice(0, 3);

  const knowledgePages = {
    overview: {
      number: 'K0', category: 'KNOWLEDGE', title: 'Knowledge overview',
      description: 'A compact map of the areas I work in most. Open a page when you want the deeper version.',
      sections: [
        ['Programming', 'Luau and Python are the languages I use most, with HTML/CSS, SQL, C++ and JavaScript around them.', 'programming'],
        ['Roblox / Game Dev', 'Systems architecture, client/server, networking, physics, CFrame, AI, animation and UI.', 'roblox'],
        ['Web / Data', 'Flask, Jinja2, REST APIs, JSON, caching, MySQL and SQL Server.', 'web'],
      ],
    },
    programming: {
      number: 'K1', category: 'KNOWLEDGE / PROGRAMMING', title: 'Programming',
      description: 'The languages and programming concepts I reach for when building systems and software.',
      groups: [
        ['Strongest / most used', ['Luau', 'Python']],
        ['Comfortable', ['HTML', 'CSS', 'SQL', 'OOP', 'Modules / ModuleScripts', 'REST', 'JSON', 'Caching']],
        ['Learning / growing', ['C++', 'JavaScript', 'Advanced Typed Luau']],
      ],
      note: 'I prefer showing what a project solved instead of attaching fake skill percentages to a language.',
    },
    roblox: {
      number: 'K2', category: 'KNOWLEDGE / ROBLOX', title: 'Roblox / Game Development',
      description: 'Most of my deepest system work comes from Roblox and gameplay programming.',
      groups: [
        ['Architecture', ['OOP', 'Typed Luau', 'ModuleScripts', 'Services / Controllers', 'Client / Server']],
        ['Gameplay', ['Raycasting', 'Physics', 'CFrame', 'Vector3', 'NPC AI', 'Combat', 'Movement', 'Animations', 'UI']],
        ['Platform / systems', ['RemoteEvents', 'RemoteFunctions', 'Blink', 'DataStore', 'Attributes', 'CollectionService', 'RunService', 'UserInputService', 'Optimization']],
      ],
      note: 'A lot of this knowledge comes from building, breaking and rebuilding systems rather than just following tutorials.',
    },
    web: {
      number: 'K3', category: 'KNOWLEDGE / WEB', title: 'Web / Data',
      description: 'A smaller part of my work, but useful when a project needs a real backend or a data-driven interface.',
      groups: [
        ['Frontend', ['HTML', 'CSS', 'Jinja2', 'Responsive layout']],
        ['Backend', ['Python', 'Flask', 'REST APIs', 'Requests', 'JSON']],
        ['Data', ['MySQL', 'SQL Server', 'Caching', 'Local JSON data']],
      ],
      note: 'The Pokédex (WORK IN PROGRESS, NOT AVAILABLE YET) is the clearest current example: frontend + Flask backend + REST consumption + caching.',
    },
  };

  const state = {
    openTabs: ['home'],
    activeTab: 'home',
    lastScrollY: 0,
  };

  App.qs = qs;
  App.qsa = qsa;
  App.state = state;
  App.data = { projectConfigs, projectNames, homepageProjects, knowledgePages };
  App.dom = {
    sidebar: qs('#sidebar'),
    mobileMenu: qs('#mobileMenu'),
    workspace: qs('#projectWorkspace'),
    workspaceTabs: qs('#workspaceTabs'),
    projectViews: qs('#projectViews'),
    projectTree: qs('#project-tree'),
    selectedWorkGrid: qs('#selected-work-grid'),
    commandPalette: qs('#commandPalette'),
    commandPaletteInput: qs('#commandPaletteInput'),
    commandPaletteResults: qs('#commandPaletteResults'),
    statusBreadcrumb: qs('#statusBreadcrumb'),
    statusLang: qs('#statusLang'),
  };
})();
