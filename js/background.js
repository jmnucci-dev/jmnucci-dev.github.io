(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.id = 'bg-circuit';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const buffer = document.createElement('canvas');
  const bufferCtx = buffer.getContext('2d');

  const accentVar = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#8b8cff';
  const hexToRgb = hex => {
    const m = hex.replace('#', '');
    const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  const rgb = hexToRgb(accentVar);
  const rgba = a => `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;
  let traces = [];
  let mouseNX = 0, mouseNY = 0, offsetX = 0, offsetY = 0;

  function buildTraces() {
    const cell = width < 700 ? 72 : 112;
    const cols = Math.ceil(width / cell) + 1;
    const rows = Math.ceil(height / cell) + 1;
    const count = Math.min(28, Math.max(10, Math.round((width * height) / 100000)));
    const list = [];
    for (let i = 0; i < count; i++) {
      let cx = Math.floor(Math.random() * cols) * cell;
      let cy = Math.floor(Math.random() * rows) * cell;
      const points = [{ x: cx, y: cy }];
      const segments = 2 + Math.floor(Math.random() * 4);
      let dir = Math.floor(Math.random() * 4);
      for (let s = 0; s < segments; s++) {
        if (Math.random() < 0.4) dir = (dir + (Math.random() < 0.5 ? 1 : 3)) % 4;
        const len = (1 + Math.floor(Math.random() * 3)) * cell;
        if (dir === 0) cx += len;
        else if (dir === 1) cy += len;
        else if (dir === 2) cx -= len;
        else cy -= len;
        points.push({ x: cx, y: cy });
      }
      list.push(points);
    }
    traces = list;
  }

  function drawStatic() {
    buffer.width = width * dpr;
    buffer.height = height * dpr;
    bufferCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bufferCtx.clearRect(0, 0, width, height);
    bufferCtx.lineWidth = 1;
    bufferCtx.strokeStyle = rgba(0.07);
    traces.forEach(points => {
      bufferCtx.beginPath();
      points.forEach((p, i) => (i === 0 ? bufferCtx.moveTo(p.x, p.y) : bufferCtx.lineTo(p.x, p.y)));
      bufferCtx.stroke();
      points.forEach((p, i) => {
        const isEnd = i === 0 || i === points.length - 1;
        bufferCtx.beginPath();
        bufferCtx.fillStyle = rgba(isEnd ? 0.16 : 0.1);
        bufferCtx.arc(p.x, p.y, isEnd ? 2.6 : 1.6, 0, Math.PI * 2);
        bufferCtx.fill();
      });
    });
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildTraces();
    drawStatic();
  }

  function frame() {
    if (!document.hidden && width) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(buffer, 0, 0, width, height);

      if (!reduceMotion) {
        offsetX += (mouseNX * 10 - offsetX) * 0.04;
        offsetY += (mouseNY * 8 - offsetY) * 0.04;
        canvas.style.transform = `translate(${offsetX}px,${offsetY}px)`;
      }
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove', e => {
    if (!width || !height) return;
    mouseNX = (e.clientX / width - 0.5) * 2;
    mouseNY = (e.clientY / height - 0.5) * 2;
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 250);
  });

  resize();
  requestAnimationFrame(frame);
})();
