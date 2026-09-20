(function () {
  let currentCat = Object.keys(SHOW_CATEGORIES)[0];

  function renderTabs() {
    const tabs = document.getElementById('shows-tabs');
    tabs.innerHTML = '';
    Object.keys(SHOW_CATEGORIES).forEach(cat => {
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
    const grid = document.getElementById('shows-grid');
    grid.innerHTML = '';
    SHOW_CATEGORIES[currentCat].forEach(s => {
      const url = s.platform === 'netflix' ? netflixSearch(s.title) : primeSearch(s.title);
      const label = s.platform === 'netflix' ? '▶ Open in Netflix' : '▶ Open in Prime Video';
      const badgeColor = s.platform === 'netflix' ? '#E50914' : '#00A8E1';
      const card = document.createElement('div');
      card.className = 'video-thumb show-card';
      card.innerHTML = `
        <div class="show-emoji" style="background:${badgeColor}22">${s.emoji}</div>
        <span class="v-title">${s.title}</span>
        <a class="show-link" style="background:${badgeColor}" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>
      `;
      grid.appendChild(card);
    });
  }

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-shows') {
      renderTabs();
      renderGrid();
    }
  });
})();
