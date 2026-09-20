(function () {
  let currentCat = Object.keys(WORD_CATEGORIES)[0];

  function renderTabs() {
    const tabs = document.getElementById('word-tabs');
    tabs.innerHTML = '';
    Object.keys(WORD_CATEGORIES).forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (cat === currentCat ? ' active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        currentCat = cat;
        renderTabs();
        renderGrid();
      });
      tabs.appendChild(btn);
    });
  }

  function renderGrid() {
    const grid = document.getElementById('word-grid');
    grid.innerHTML = '';
    WORD_CATEGORIES[currentCat].forEach(w => {
      const card = document.createElement('button');
      card.className = 'word-card';
      card.innerHTML = `
        <span class="w-emoji">${w.emoji}</span>
        <span class="w-mal mal">${w.mal}</span>
        <span class="w-translit">${w.translit}</span>
        <span class="w-en">${w.en}</span>
      `;
      card.addEventListener('click', () => speak(w.mal));
      grid.appendChild(card);
    });
  }

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-words') {
      renderTabs();
      renderGrid();
    }
  });
})();
