(function () {
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

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
    speak(p.mal, p.en);
  }

  document.getElementById('story-prev').addEventListener('click', () => {
    pageIndex = (pageIndex - 1 + story().pages.length) % story().pages.length;
    renderPage();
  });
  document.getElementById('story-next').addEventListener('click', () => {
    pageIndex = (pageIndex + 1) % story().pages.length;
    renderPage();
  });
  document.getElementById('story-say').addEventListener('click', () => speak(page().mal, page().en));

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-read') {
      renderTabs();
      renderPage();
    }
  });

  // ---- PDF read-aloud -----------------------------------------------------
  // Fully client-side: pdf.js (loaded from cdnjs) extracts the text, and the
  // browser's own speech synthesis reads it - no upload, no backend, no
  // account. We pick the gentlest-sounding voice available and slow the
  // rate down a little for a calmer, storytime feel.
  let pdfPages = [];
  let pdfPageIndex = 0;
  let pdfUtterance = null;

  document.getElementById('read-mode-stories').addEventListener('click', () => setReadMode('stories'));
  document.getElementById('read-mode-pdf').addEventListener('click', () => setReadMode('pdf'));

  function setReadMode(mode) {
    document.getElementById('read-mode-stories').classList.toggle('active', mode === 'stories');
    document.getElementById('read-mode-pdf').classList.toggle('active', mode === 'pdf');
    document.getElementById('stories-panel').classList.toggle('hidden', mode !== 'stories');
    document.getElementById('pdf-panel').classList.toggle('hidden', mode !== 'pdf');
    window.speechSynthesis.cancel();
  }

  function pickGentleVoice(voices) {
    const byName = /samantha|zira|female|natural|aria|jenny|victoria|google uk english female/i;
    return voices.find(v => byName.test(v.name) && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
  }

  async function speakGentle(text) {
    if (!text) return;
    const voices = await getVoicesAsync();
    pdfUtterance = new SpeechSynthesisUtterance(text);
    const voice = pickGentleVoice(voices);
    if (voice) pdfUtterance.voice = voice;
    pdfUtterance.rate = 0.82;
    pdfUtterance.pitch = 1.05;
    document.getElementById('pdf-pause').textContent = '⏸ Pause';
    queueSpeak(pdfUtterance);
  }

  document.getElementById('pdf-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    window.speechSynthesis.cancel();
    document.getElementById('pdf-filename').textContent = file.name;
    document.getElementById('pdf-page-wrap').classList.add('hidden');
    const status = document.getElementById('pdf-status');
    status.textContent = 'Loading your PDF...';

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      pdfPages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        status.textContent = `Reading page ${i} of ${pdf.numPages}...`;
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(it => it.str).join(' ').replace(/\s+/g, ' ').trim();
        pdfPages.push(text || '(This page has no readable text.)');
      }
      pdfPageIndex = 0;
      status.textContent = '';
      document.getElementById('pdf-page-wrap').classList.remove('hidden');
      renderPdfPage();
    } catch (err) {
      status.textContent = "Sorry, I couldn't read that PDF. Try a different file.";
    }
  });

  function renderPdfPage() {
    document.getElementById('pdf-text').textContent = pdfPages[pdfPageIndex];
    document.getElementById('pdf-page-info').textContent = `Page ${pdfPageIndex + 1} of ${pdfPages.length}`;
    window.speechSynthesis.cancel();
  }

  document.getElementById('pdf-prev').addEventListener('click', () => {
    pdfPageIndex = (pdfPageIndex - 1 + pdfPages.length) % pdfPages.length;
    renderPdfPage();
  });
  document.getElementById('pdf-next').addEventListener('click', () => {
    pdfPageIndex = (pdfPageIndex + 1) % pdfPages.length;
    renderPdfPage();
  });
  document.getElementById('pdf-say').addEventListener('click', () => speakGentle(pdfPages[pdfPageIndex]));
  document.getElementById('pdf-pause').addEventListener('click', () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      document.getElementById('pdf-pause').textContent = '▶ Resume';
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      document.getElementById('pdf-pause').textContent = '⏸ Pause';
    }
  });
})();
