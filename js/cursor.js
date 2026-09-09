(() => {
  'use strict';

  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  const root = document.documentElement;
  root.classList.add('cx-active');

  const dot = document.createElement('div');
  dot.id = 'cx-dot';
  document.body.appendChild(dot);

  const frame = document.createElement('div');
  frame.id = 'cx-frame';
  frame.innerHTML = '<i class="cx-tl"></i><i class="cx-tr"></i><i class="cx-bl"></i><i class="cx-br"></i>';
  document.body.appendChild(frame);

  const label = document.createElement('div');
  label.id = 'cx-label';
  document.body.appendChild(label);

  const CLICKABLE = 'a[href],button,[role="button"],[data-project-open],[data-scroll],[data-copy],.nav-item,.project-tree-item,.folder-summary,.knowledge-folder button,.all-project-card,.knowledge-detail-card,.knowledge-row,.project-tab,.tab-close,.workspace-close,.cp-item,.cmdk-hint,.topbar-action,.media-nav-btn,.showcase-nav,.showcase-dot,.text-link,.social-link,.brand-button,.explorer-root,[tabindex]:not([tabindex="-1"])';
  const TEXT_INPUT = 'input,textarea';

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX, dotY = mouseY;
  let frameX = mouseX, frameY = mouseY;
  let hoverTarget = null;
  let isDown = false;
  let idleAngle = 0;
  const FRAME_IDLE = 26;

  function labelFor(el) {
    return el.dataset.cursorLabel || el.tagName.toLowerCase();
  }

  function spawnRipple(x, y, kind) {
    const r = document.createElement('div');
    r.className = 'cx-ripple ' + (kind === 'hit' ? 'cx-ripple-hit' : 'cx-ripple-miss');
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    document.body.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const el = document.elementFromPoint(mouseX, mouseY);
    const textEl = el ? el.closest(TEXT_INPUT) : null;
    const clickEl = el ? el.closest(CLICKABLE) : null;
    dot.classList.toggle('cx-text', !!textEl && !clickEl);

    if (clickEl !== hoverTarget) {
      hoverTarget = clickEl;
      if (hoverTarget) {
        label.textContent = labelFor(hoverTarget);
        label.classList.add('cx-show');
        frame.classList.add('cx-lock');
      } else {
        label.classList.remove('cx-show');
        frame.classList.remove('cx-lock');
      }
    }
  }, { passive: true });

  window.addEventListener('mousedown', () => {
    isDown = true;
    if (hoverTarget) {
      frame.classList.add('cx-hit');
      spawnRipple(mouseX, mouseY, 'hit');
    } else {
      spawnRipple(mouseX, mouseY, 'miss');
    }
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    frame.classList.remove('cx-hit');
  });

  window.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    frame.style.opacity = '0';
    label.classList.remove('cx-show');
  });

  window.addEventListener('mouseenter', () => {
    dot.style.opacity = '';
    frame.style.opacity = '';
  });

  function tick() {
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    const dotScale = isDown && !hoverTarget ? 0.55 : 1;
    dot.style.transform = `translate(${dotX}px,${dotY}px) translate(-50%,-50%) scale(${dotScale})`;

    if (hoverTarget && hoverTarget.isConnected) {
      const rect = hoverTarget.getBoundingClientRect();
      const pad = 6;
      const targetX = rect.left - pad;
      const targetY = rect.top - pad;
      frameX += (targetX - frameX) * 0.3;
      frameY += (targetY - frameY) * 0.3;
      const w = rect.width + pad * 2;
      const h = rect.height + pad * 2;
      frame.style.width = w + 'px';
      frame.style.height = h + 'px';
      frame.style.transform = `translate(${frameX}px,${frameY}px)`;
      label.style.transform = `translate(${frameX}px,${frameY - 22}px)`;
    } else {
      const targetX = mouseX - FRAME_IDLE / 2;
      const targetY = mouseY - FRAME_IDLE / 2;
      frameX += (targetX - frameX) * 0.14;
      frameY += (targetY - frameY) * 0.14;
      frame.style.width = FRAME_IDLE + 'px';
      frame.style.height = FRAME_IDLE + 'px';
      idleAngle += isDown ? 0.6 : 0.12;
      frame.style.transform = `translate(${frameX}px,${frameY}px) rotate(${idleAngle}deg)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
