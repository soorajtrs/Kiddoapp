(function () {
  const COLORS = ['#33334D', '#FF6B6B', '#FFD93D', '#4ECDC4', '#6BCB77', '#A78BFA', '#FF8FAB', '#FFFFFF'];
  let canvas, ctx;
  let drawing = false;
  let color = COLORS[0];
  let size = 10;
  let erasing = false;
  let last = null;
  let sized = false;

  function init() {
    canvas = document.getElementById('draw-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('resize', resizeCanvas);

    const swatches = document.getElementById('color-swatches');
    COLORS.forEach((c, i) => {
      const s = document.createElement('button');
      s.className = 'swatch' + (i === 0 ? ' active' : '');
      s.style.background = c;
      s.addEventListener('click', () => {
        color = c;
        erasing = false;
        document.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
      });
      swatches.appendChild(s);
    });

    document.getElementById('brush-size').addEventListener('input', e => size = parseInt(e.target.value, 10));
    document.getElementById('draw-erase').addEventListener('click', () => { erasing = true; });
    document.getElementById('draw-clear').addEventListener('click', () => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    document.getElementById('draw-save').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'my-drawing.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
    sized = true;
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const prev = sized ? canvas.toDataURL() : null;
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (prev) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = prev;
    }
  }

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e) {
    drawing = true;
    last = pos(e);
  }
  function move(e) {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = erasing ? '#fff' : color;
    ctx.lineWidth = erasing ? size * 2 : size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  }
  function stop() { drawing = false; }

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-draw') {
      if (!canvas) init();
      else resizeCanvas();
    }
  });
})();
