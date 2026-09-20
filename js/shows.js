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
      const platformLabel = s.platform === 'netflix' ? 'Netflix' : 'Prime Video';
      const badgeColor = s.platform === 'netflix' ? '#E50914' : '#00A8E1';
      const card = document.createElement('a');
      card.className = 'video-thumb show-card';
      card.href = url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.innerHTML = `
        <div class="show-thumb" style="background:linear-gradient(135deg, ${badgeColor}33, ${badgeColor}11)">
          <span class="show-thumb-emoji">${s.emoji}</span>
          <span class="show-platform-badge" style="background:${badgeColor}">${platformLabel}</span>
        </div>
        <span class="v-title">${s.title}</span>
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
