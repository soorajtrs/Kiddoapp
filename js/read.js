(function () {
  let storyIndex = 0;
  let pageIndex = 0;

  function story() { return STORIES[storyIndex]; }
  function page() { return story().pages[pageIndex]; }

  function renderTabs() {
    const tabs = document.getElementById('story-tabs');
    tabs.innerHTML = '';
    STORIES.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (i === storyIndex ? ' active' : '');
      btn.textContent = s.title;
      btn.addEventListener('click', () => {
        storyIndex = i;
        pageIndex = 0;
        renderTabs();
        renderPage();
      });
      tabs.appendChild(btn);
    });
  }

  function renderPage() {
    const p = page();
    document.getElementById('story-emoji').textContent = p.emoji;
    document.getElementById('story-mal').textContent = p.mal;
    document.getElementById('story-en').textContent = p.en;
    const dots = document.getElementById('story-page-dots');
    dots.innerHTML = '';
    story().pages.forEach((_, i) => {
      const d = document.createElement('span');
      if (i === pageIndex) d.classList.add('active');
      dots.appendChild(d);
    });
    speak(p.mal);
  }

  document.getElementById('story-prev').addEventListener('click', () => {
    pageIndex = (pageIndex - 1 + story().pages.length) % story().pages.length;
    renderPage();
  });
  document.getElementById('story-next').addEventListener('click', () => {
    pageIndex = (pageIndex + 1) % story().pages.length;
    renderPage();
  });
  document.getElementById('story-say').addEventListener('click', () => speak(page().mal));

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-read') {
      renderTabs();
      renderPage();
    }
  });
})();
