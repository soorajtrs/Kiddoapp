(function () {
  let currentCat = Object.keys(SHOW_CATEGORIES)[0];
  const thumbCache = {};

  // Real poster art, pulled from Wikipedia's public, CORS-enabled search API
  // (no key needed, no guessed URLs - the API itself returns the image URL).
  // Falls back to the emoji tile if a page/thumbnail isn't found.
  async function fetchShowThumb(title) {
    if (title in thumbCache) return thumbCache[title];
    try {
      const q = encodeURIComponent(`${title} TV series`);
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*`
      );
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      const pages = data.query && data.query.pages;
      const first = pages && Object.values(pages)[0];
      const src = first && first.thumbnail && first.thumbnail.source;
      thumbCache[title] = src || null;
    } catch (e) {
      thumbCache[title] = null;
    }
    return thumbCache[title];
  }

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

  function sectionLabel(text) {
    const h = document.createElement('div');
    h.className = 'section-label';
    h.textContent = text;
    return h;
  }

  // Badge is derived from the real url itself, not a hand-set platform
  // field - so it can never claim a show is "on Netflix" when the actual
  // link points somewhere else (streaming rights change; JustWatch links
  // show every current option rather than one platform).
  function platformBadge(url) {
    if (url.includes('netflix.com')) return { label: 'Netflix', color: '#E50914' };
    if (url.includes('primevideo.com') || url.includes('amazon.')) return { label: 'Prime Video', color: '#00A8E1' };
    if (url.includes('hotstar.com')) return { label: 'Hotstar', color: '#1F80E0' };
    return { label: 'Where to Watch', color: '#8B5CF6' };
  }

  function renderGrid() {
    const grid = document.getElementById('shows-grid');
    grid.innerHTML = '';
    const ranked = withRecommendations(filterByAge(SHOW_CATEGORIES[currentCat]));
    if (ranked.length === 0) {
      grid.appendChild(sectionLabel(`Nothing here yet for age ${getProfileAge()} - try another tab, or raise the age in Settings.`));
      return;
    }
    let labeledRecommended = false;
    let labeledMore = false;
    ranked.forEach(s => {
      if (s.recommended && !labeledRecommended) {
        grid.appendChild(sectionLabel('🌟 Recommended for you'));
        labeledRecommended = true;
      } else if (!s.recommended && !labeledMore && labeledRecommended) {
        grid.appendChild(sectionLabel('More shows'));
        labeledMore = true;
      }
      const badge = platformBadge(s.url);
      const card = document.createElement('a');
      card.className = 'video-thumb show-card';
      card.href = s.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.innerHTML = `
        <div class="show-thumb" style="background:linear-gradient(135deg, ${badge.color}33, ${badge.color}11)">
          <span class="show-thumb-emoji">${s.emoji}</span>
          <span class="show-platform-badge" style="background:${badge.color}">${badge.label}</span>
        </div>
        <span class="v-title">${s.title}</span>
      `;
      grid.appendChild(card);

      fetchShowThumb(s.title).then(src => {
        if (!src || !card.isConnected) return;
        const thumbDiv = card.querySelector('.show-thumb');
        const img = document.createElement('img');
        img.src = src;
        img.alt = s.title;
        img.loading = 'lazy';
        thumbDiv.prepend(img);
        thumbDiv.classList.add('has-photo');
      });
    });
  }

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-shows') {
      renderTabs();
      renderGrid();
    }
  });
  document.addEventListener('profile:change', () => {
    if (document.getElementById('screen-shows').classList.contains('active')) renderGrid();
  });
})();
