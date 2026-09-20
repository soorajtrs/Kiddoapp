(function () {
  let currentGroup = Object.keys(LETTER_GROUPS)[0];
  let currentIndex = 0;

  function letters() { return LETTER_GROUPS[currentGroup]; }

  function renderTabs() {
    const tabs = document.getElementById('letter-tabs');
    tabs.innerHTML = '';
    Object.keys(LETTER_GROUPS).forEach(group => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (group === currentGroup ? ' active' : '');
      btn.textContent = group;
      btn.addEventListener('click', () => {
        currentGroup = group;
        currentIndex = 0;
        renderTabs();
        renderGrid();
        showLetter();
      });
      tabs.appendChild(btn);
    });
  }

  function renderGrid() {
    const grid = document.getElementById('letter-grid');
    grid.innerHTML = '';
    letters().forEach((l, i) => {
      const btn = document.createElement('button');
      btn.className = 'letter-tile mal' + (i === currentIndex ? ' active' : '');
      btn.textContent = l.ch;
      btn.addEventListener('click', () => { currentIndex = i; showLetter(); });
      grid.appendChild(btn);
    });
  }

  function showLetter() {
    const l = letters()[currentIndex];
    document.getElementById('letter-display').textContent = l.ch;
    document.getElementById('letter-display').classList.add('mal');
    document.getElementById('letter-translit').textContent = l.translit;
    document.getElementById('letter-word').textContent = l.word;
    document.getElementById('letter-word').classList.add('mal');
    [...document.querySelectorAll('.letter-tile')].forEach((t, i) =>
      t.classList.toggle('active', i === currentIndex));
    speak(l.ch);
  }

  document.getElementById('letter-display').addEventListener('click', () => speak(letters()[currentIndex].ch));
  document.getElementById('letter-say').addEventListener('click', () => speak(letters()[currentIndex].ch));
  document.getElementById('letter-prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + letters().length) % letters().length;
    showLetter();
  });
  document.getElementById('letter-next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % letters().length;
    showLetter();
  });

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-letters') {
      renderTabs();
      renderGrid();
      showLetter();
    }
  });
})();
