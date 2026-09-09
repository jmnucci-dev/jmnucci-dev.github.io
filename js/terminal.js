(() => {
  'use strict';

  const { qs, data, utils, workspace } = window.App;
  const { escapeHtml, itemKey, closeMobileNav } = utils;

  const HANGMAN_WORDS = [
    'javascript', 'python', 'luau', 'roblox', 'function', 'variable', 'recursion',
    'algorithm', 'bytecode', 'compiler', 'interface', 'database', 'frontend',
    'backend', 'terminal', 'keyboard', 'network', 'pointer', 'encryption',
    'debugging', 'raycast', 'component', 'parkour', 'workspace',
  ];

  let terminalSeq = 0;
  const terminalControllers = {};

  function getOrCreateTerminal(id) {
    if (terminalControllers[id]) return terminalControllers[id].container;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="mini-terminal mini-terminal-full">
        <div class="mini-terminal-bar"><span class="term-dot dot-red"></span><span class="term-dot dot-yellow"></span><span class="term-dot dot-green"></span><span class="mini-terminal-title">guest@jmnucci.dev: zsh — session ${escapeHtml(id)}</span></div>
        <div class="mini-terminal-body" aria-live="polite"></div>
        <div class="mini-terminal-input-row">
          <span class="mini-terminal-prompt">guest@jmnucci.dev:~$</span>
          <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal input">
        </div>
      </div>`;
    const container = wrapper.firstElementChild;
    const termBody = qs('.mini-terminal-body', container);
    const termInput = qs('.mini-terminal-input-row input', container);

    const termHistory = [];
    let termHistoryIndex = 0;
    let game = null;

    function termPrint(text, cls) {
      const line = document.createElement('p');
      line.className = `term-line ${cls || 'out'}`;
      line.textContent = text;
      termBody.appendChild(line);
      termBody.scrollTop = termBody.scrollHeight;
    }

    function termPrintCmd(text) {
      const line = document.createElement('p');
      line.className = 'term-line cmd';
      line.textContent = text;
      termBody.appendChild(line);
      termBody.scrollTop = termBody.scrollHeight;
    }

    function startHangman() {
      const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
      game = { type: 'hangman', word, guessed: new Set(), wrong: 0, maxWrong: 6 };
      termPrint('Hangman started. Guess the word one letter at a time.', 'accent');
      termPrint(`${game.maxWrong} wrong guesses allowed. Type a letter, or 'quit' to give up.`);
      renderHangman();
    }
    function maskedWord() {
      return game.word.split('').map(ch => (game.guessed.has(ch) ? ch : '_')).join(' ');
    }
    function renderHangman() {
      termPrint(`word: ${maskedWord()}`, 'accent');
      const wrongLetters = [...game.guessed].filter(letter => !game.word.includes(letter));
      termPrint(`wrong: ${game.wrong}/${game.maxWrong}${wrongLetters.length ? ` (${wrongLetters.join(', ')})` : ''}`);
    }
    function handleHangmanInput(raw) {
      const low = raw.toLowerCase();
      if (!/^[a-z]$/.test(low)) { termPrint('type a single letter (a-z), or "quit"', 'warn'); return; }
      if (game.guessed.has(low)) { termPrint(`already tried "${low}"`, 'warn'); return; }
      game.guessed.add(low);
      if (game.word.includes(low)) termPrint(`"${low}" is in the word.`, 'accent');
      else { game.wrong += 1; termPrint(`"${low}" is not in the word.`, 'warn'); }
      if ([...game.word].every(ch => game.guessed.has(ch))) {
        termPrint(`you got it! the word was "${game.word}".`, 'accent');
        game = null;
        return;
      }
      if (game.wrong >= game.maxWrong) {
        termPrint(`out of tries. the word was "${game.word}".`, 'warn');
        game = null;
        return;
      }
      renderHangman();
    }

    function startGuess() {
      game = { type: 'guess', target: 1 + Math.floor(Math.random() * 100), attempts: 0 };
      termPrint("Thinking of a number between 1 and 100. Start guessing.", 'accent');
      termPrint("Type a number, or 'quit' to give up.");
    }
    function handleGuessInput(raw) {
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 1 || n > 100) { termPrint('type a whole number between 1 and 100, or "quit"', 'warn'); return; }
      game.attempts += 1;
      if (n === game.target) {
        termPrint(`correct! it was ${game.target}. took ${game.attempts} guess${game.attempts === 1 ? '' : 'es'}.`, 'accent');
        game = null;
        return;
      }
      termPrint(n < game.target ? 'higher ↑' : 'lower ↓', 'warn');
    }

    function handleGameInput(raw) {
      const low = raw.toLowerCase();
      if (low === 'quit' || low === 'exit') {
        termPrint(game.type === 'hangman' ? `gave up. the word was "${game.word}".` : `gave up. the number was ${game.target}.`, 'warn');
        game = null;
        return;
      }
      if (game.type === 'hangman') handleHangmanInput(raw);
      else handleGuessInput(raw);
    }

    const termCommands = {
      help() {
        termPrint('Available commands:');
        [
          ['help', 'list every command'],
          ['about', 'quick bio'],
          ['projects', 'list every project'],
          ['open <project>', 'open a project, e.g. open Weapon System'],
          ['skills', 'main stack'],
          ['contact', 'how to reach me'],
          ['github', 'open my GitHub'],
          ['whoami', "who's typing right now"],
          ['neofetch', 'a little system-ish flex'],
          ['date', "current date, if you're curious"],
          ['hangman', 'guess the word, one letter at a time'],
          ['guess', 'guess a number between 1-100'],
          ['clear', 'clear the screen'],
        ].forEach(([cmd, desc]) => termPrint(`  ${cmd.padEnd(18, ' ')} ${desc}`));
      },
      about() {
        termPrint("JM, aka Syyst3m. I build systems, games and software. Started in 2022 and haven't stopped taking things apart to see how they work.");
      },
      whoami() {
        termPrint("guest: probably a recruiter, a fellow dev, or just curious. Either way, hey.");
      },
      projects() {
        if (!data.projectNames.length) { termPrint('no projects loaded right now.', 'warn'); return; }
        termPrint(`${data.projectNames.length} project(s) tracked:`);
        data.projectNames.forEach(name => termPrint(`  - ${name}`, 'accent'));
        termPrint("type: open <project name> to open one");
      },
      ls() { termCommands.projects(); },
      open(args) {
        const query = args.join(' ').trim();
        if (!query) { termPrint('usage: open <project name>', 'warn'); return; }
        const lower = query.toLowerCase();
        const match = data.projectNames.find(name => name.toLowerCase() === lower)
          || data.projectNames.find(name => name.toLowerCase().includes(lower));
        if (!match) { termPrint(`no project matching "${query}", try 'projects' to see the list`, 'warn'); return; }
        termPrint(`opening ${match}…`, 'accent');
        workspace.openProject(match);
      },
      skills() {
        termPrint('Luau · Python · HTML/CSS · SQL · C++ · JavaScript');
      },
      contact() {
        termPrint('email: hello@jmnucci.dev');
        termPrint("or just scroll to the Contact section, there's a button for that.");
      },
      github() {
        termPrint('opening github…', 'accent');
        window.open('https://github.com/', '_blank', 'noopener');
      },
      neofetch() {
        termPrint('jm@jmnucci.dev', 'accent');
        termPrint('----------------');
        termPrint('OS: Human, since 2022');
        termPrint('Stack: Luau, Python, Web');
        termPrint('Uptime: still debugging');
        termPrint('Status: Available');
      },
      sudo() {
        termPrint("Nice try. You're 'guest' here, not root.", 'warn');
      },
      date() {
        termPrint(new Date().toString());
      },
      echo(args) {
        termPrint(args.join(' '));
      },
      hangman() { startHangman(); },
      guess() { startGuess(); },
      clear() {
        termBody.innerHTML = '';
      },
    };

    function termRun(raw) {
      const trimmed = raw.trim();
      if (!trimmed) return;
      termPrintCmd(trimmed);
      termHistory.push(trimmed);
      termHistoryIndex = termHistory.length;
      if (game) { handleGameInput(trimmed); return; }
      const [cmd, ...args] = trimmed.split(/\s+/);
      const key = cmd.toLowerCase();
      if (termCommands[key]) termCommands[key](args);
      else termPrint(`command not found: ${cmd}. type 'help'`, 'warn');
    }

    termPrint("Welcome. Type 'help' to see what's available.", 'accent');

    termInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        termRun(termInput.value);
        termInput.value = '';
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (termHistory.length) {
          termHistoryIndex = Math.max(0, termHistoryIndex - 1);
          termInput.value = termHistory[termHistoryIndex] || '';
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (termHistory.length) {
          termHistoryIndex = Math.min(termHistory.length, termHistoryIndex + 1);
          termInput.value = termHistory[termHistoryIndex] || '';
        }
      }
    });

    termBody.addEventListener('click', () => termInput.focus());

    terminalControllers[id] = { container, focus: () => termInput.focus() };
    return container;
  }

  function openNewTerminal() {
    terminalSeq += 1;
    workspace.openTab(itemKey('terminal', String(terminalSeq)));
    closeMobileNav();
  }

  qs('#newTerminalBtn')?.addEventListener('click', openNewTerminal);

  window.App.terminal = {
    render: getOrCreateTerminal,
    focus(id) { terminalControllers[id]?.focus(); },
    forget(id) { delete terminalControllers[id]; },
    open: openNewTerminal,
  };
})();
