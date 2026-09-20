(function () {
  const EMOJIS = ['🐘','🐕','🐈','🐄','🐟','🐦','🍌','🍎','🥭','🍇','☀️','🌈','🚗','⚽','🎈','🌸','🐝','🦋','🐢','🐸'];
  let size = 6; // number of pairs
  let cards = [];
  let flipped = [];
  let matchedCount = 0;
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function newGame() {
    const chosen = shuffle(EMOJIS).slice(0, size);
    cards = shuffle([...chosen, ...chosen]).map((emoji, i) => ({ id: i, emoji, matched: false }));
    flipped = [];
    matchedCount = 0;
    locked = false;
    document.getElementById('puzzle-win').classList.add('hidden');
    render();
    updateStatus();
  }

  function render() {
    const board = document.getElementById('puzzle-board');
    board.style.gridTemplateColumns = `repeat(${size <= 4 ? 4 : (size <= 6 ? 4 : 4)}, 1fr)`;
    board.innerHTML = '';
    cards.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'puzzle-card' + (c.matched ? ' matched' : '') + (flipped.includes(c.id) ? ' flipped' : '');
      btn.textContent = (c.matched || flipped.includes(c.id)) ? c.emoji : '❓';
      btn.disabled = c.matched;
      btn.addEventListener('click', () => flip(c.id));
      board.appendChild(btn);
    });
  }

  function updateStatus() {
    document.getElementById('puzzle-status').textContent = `${matchedCount} / ${size} matched`;
  }

  function flip(id) {
    if (locked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.matched || flipped.includes(id)) return;
    flipped.push(id);
    render();
    if (flipped.length === 2) {
      locked = true;
      const [a, b] = flipped.map(fid => cards.find(c => c.id === fid));
      if (a.emoji === b.emoji) {
        a.matched = true; b.matched = true;
        matchedCount++;
        flipped = [];
        locked = false;
        updateStatus();
        render();
        if (matchedCount === size) {
          setTimeout(() => document.getElementById('puzzle-win').classList.remove('hidden'), 300);
        }
      } else {
        setTimeout(() => {
          flipped = [];
          locked = false;
          render();
        }, 800);
      }
    }
  }

  document.querySelectorAll('.puzzle-controls .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.puzzle-controls .chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      size = parseInt(btn.dataset.size, 10);
      newGame();
    });
  });
  document.getElementById('puzzle-again').addEventListener('click', newGame);

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-puzzle' && cards.length === 0) {
      document.querySelector('.puzzle-controls .chip-btn[data-size="6"]').classList.add('active');
      newGame();
    }
  });
})();
