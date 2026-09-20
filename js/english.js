(function () {
  let currentCase = 'Uppercase';
  let currentIndex = 0;
  let traceCanvas, traceCtx, tracing = false, traceLast = null;

  function letters() { return ENGLISH_LETTERS[currentCase]; }

  function renderTabs() {
    const tabs = document.getElementById('english-tabs');
    tabs.innerHTML = '';
    Object.keys(ENGLISH_LETTERS).forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (c === currentCase ? ' active' : '');
      btn.textContent = c;
      btn.addEventListener('click', () => {
        currentCase = c;
        currentIndex = 0;
        renderTabs();
        renderGrid();
        showLetter();
      });
      tabs.appendChild(btn);
    });
  }

  function renderGrid() {
    const grid = document.getElementById('english-grid');
    grid.innerHTML = '';
    letters().forEach((l, i) => {
      const btn = document.createElement('button');
      btn.className = 'letter-tile' + (i === currentIndex ? ' active' : '');
      btn.textContent = l.ch;
      btn.addEventListener('click', () => { currentIndex = i; showLetter(); });
      grid.appendChild(btn);
    });
  }

  function showLetter() {
    const l = letters()[currentIndex];
    document.getElementById('english-display').textContent = l.ch;
    document.getElementById('english-word').textContent = l.word;
    [...document.querySelectorAll('#english-grid .letter-tile')].forEach((t, i) =>
      t.classList.toggle('active', i === currentIndex));
    document.getElementById('trace-guide').textContent = l.ch;
    clearTrace();
    speak(l.ch);
  }

  document.getElementById('english-display').addEventListener('click', () => speak(letters()[currentIndex].ch));
  document.getElementById('english-say').addEventListener('click', () => speak(letters()[currentIndex].ch));
  document.getElementById('english-prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + letters().length) % letters().length;
    showLetter();
  });
  document.getElementById('english-next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % letters().length;
    showLetter();
  });

  // --- Writing / tracing practice ---
  function initTrace() {
    traceCanvas = document.getElementById('trace-canvas');
    traceCtx = traceCanvas.getContext('2d');
    resizeTrace();
    traceCanvas.addEventListener('pointerdown', e => { tracing = true; traceLast = tracePos(e); });
    traceCanvas.addEventListener('pointermove', e => {
      if (!tracing) return;
      const p = tracePos(e);
      traceCtx.strokeStyle = '#FF6B6B';
      traceCtx.lineWidth = 10;
      traceCtx.lineCap = 'round';
      traceCtx.lineJoin = 'round';
      traceCtx.beginPath();
      traceCtx.moveTo(traceLast.x, traceLast.y);
      traceCtx.lineTo(p.x, p.y);
      traceCtx.stroke();
      traceLast = p;
    });
    window.addEventListener('pointerup', () => { tracing = false; });
    window.addEventListener('resize', resizeTrace);
    document.getElementById('trace-clear').addEventListener('click', clearTrace);
  }

  function resizeTrace() {
    if (!traceCanvas) return;
    const rect = traceCanvas.getBoundingClientRect();
    traceCanvas.width = rect.width;
    traceCanvas.height = rect.height;
  }

  function tracePos(e) {
    const rect = traceCanvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function clearTrace() {
    if (!traceCtx) return;
    traceCtx.clearRect(0, 0, traceCanvas.width, traceCanvas.height);
  }

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-english') {
      renderTabs();
      renderGrid();
      if (!traceCanvas) initTrace(); else resizeTrace();
      showLetter();
    }
  });
})();
