(function () {
  let ytPlayer = null;
  let ytReady = false;
  let maxWatched = 0;
  let pollTimer = null;
  let lastTick = null;
  let watchedSeconds = 0;
  let unlocked = false;
  const TOLERANCE = 1.5;       // seconds of slack before we call it a "skip"
  const LOCK_SECONDS = 15 * 60; // suggestions stay hidden for 15 min of watching

  function sectionLabel(text) {
    const h = document.createElement('div');
    h.className = 'section-label';
    h.textContent = text;
    return h;
  }

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) { ytReady = true; return; }
    if (document.getElementById('yt-api-script')) return;
    const tag = document.createElement('script');
    tag.id = 'yt-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => { ytReady = true; };
  }

  function renderList() {
    const list = document.getElementById('video-list');
    list.innerHTML = '';
    const ranked = withRecommendations(VIDEOS);
    let labeledRecommended = false;
    let labeledMore = false;
    ranked.forEach(v => {
      if (v.recommended && !labeledRecommended) {
        list.appendChild(sectionLabel('🌟 Recommended for you'));
        labeledRecommended = true;
      } else if (!v.recommended && !labeledMore && labeledRecommended) {
        list.appendChild(sectionLabel('More videos'));
        labeledMore = true;
      }
      const card = document.createElement('button');
      card.className = 'video-thumb';
      card.innerHTML = `
        <img loading="lazy" src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="${v.title}">
        <span class="v-title">${v.title}</span>
      `;
      card.addEventListener('click', () => {
        if (document.getElementById('video-player-wrap').classList.contains('hidden')) {
          playVideo(v);
        }
      });
      list.appendChild(card);
    });
  }

  function playVideo(v) {
    document.querySelector('#screen-videos .video-list').classList.add('hidden');
    document.getElementById('video-player-wrap').classList.remove('hidden');
    maxWatched = 0;
    watchedSeconds = 0;
    lastTick = null;
    lockSuggestions();

    const start = () => {
      if (ytPlayer) {
        ytPlayer.loadVideoById(v.id);
      } else {
        ytPlayer = new YT.Player('yt-player', {
          videoId: v.id,
          playerVars: {
            controls: 0,      // no native scrub bar / skip controls
            disablekb: 1,      // no arrow-key seeking
            rel: 0,
            modestbranding: 1,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
          },
          events: {
            onReady: () => { ytPlayer.playVideo(); startGuard(); },
            onStateChange: onStateChange,
          },
        });
      }
    };

    if (ytReady) start(); else {
      const wait = setInterval(() => { if (ytReady) { clearInterval(wait); start(); } }, 150);
    }
  }

  function onStateChange(e) {
    const btn = document.getElementById('video-playpause');
    if (e.data === YT.PlayerState.PLAYING) {
      btn.textContent = '⏸ Pause';
      startGuard();
    } else if (e.data === YT.PlayerState.PAUSED) {
      btn.textContent = '▶ Play';
    } else if (e.data === YT.PlayerState.ENDED) {
      btn.textContent = '▶ Play';
      stopGuard();
      unlockSuggestions(); // a video that ends naturally always unlocks, even if short
    }
  }

  // Poll playback position; if it jumps forward past what's been watched
  // (a scrub, a keyboard seek, anything) snap it back. This is what
  // blocks "skipping ahead" - kids can only watch straight through.
  // The same tick also accumulates real watched time toward the 15-minute
  // lock, so the "Show suggestions" button stays hidden/disabled until a
  // kid has actually watched (not skipped through) 15 minutes.
  function startGuard() {
    stopGuard();
    lastTick = performance.now();
    pollTimer = setInterval(() => {
      if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
      const t = ytPlayer.getCurrentTime();
      const dur = ytPlayer.getDuration() || 0;
      if (t > maxWatched + TOLERANCE) {
        ytPlayer.seekTo(maxWatched, true);
      } else {
        maxWatched = Math.max(maxWatched, t);
      }

      const now = performance.now();
      if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING && lastTick) {
        watchedSeconds += (now - lastTick) / 1000;
      }
      lastTick = now;
      updateLockUi();

      const pct = dur ? Math.min(100, (t / dur) * 100) : 0;
      document.getElementById('video-progress').style.width = pct + '%';
      document.getElementById('video-time').textContent = `${fmt(t)} / ${fmt(dur)}`;
    }, 400);
  }

  function stopGuard() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }

  function lockSuggestions() {
    unlocked = false;
    updateLockUi();
  }

  function unlockSuggestions() {
    if (unlocked) return;
    unlocked = true;
    const backBtn = document.getElementById('video-back');
    backBtn.disabled = false;
    backBtn.textContent = '⬅ All Videos';
  }

  function updateLockUi() {
    if (unlocked) return;
    if (watchedSeconds >= LOCK_SECONDS) {
      unlockSuggestions();
      return;
    }
    const remaining = Math.ceil(LOCK_SECONDS - watchedSeconds);
    document.getElementById('video-lock-timer').textContent = fmt(remaining);
  }

  function fmt(s) {
    s = Math.floor(s || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  }

  document.getElementById('video-playpause').addEventListener('click', () => {
    if (!ytPlayer) return;
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
    else ytPlayer.playVideo();
  });

  document.getElementById('video-back').addEventListener('click', () => {
    if (!unlocked) return; // still locked - button is disabled but guard the handler too
    document.getElementById('video-player-wrap').classList.add('hidden');
    document.querySelector('#screen-videos .video-list').classList.remove('hidden');
    if (ytPlayer) ytPlayer.pauseVideo();
    stopGuard();
  });

  document.addEventListener('profile:change', () => {
    if (document.getElementById('screen-videos').classList.contains('active')
        && document.getElementById('video-player-wrap').classList.contains('hidden')) {
      renderList();
    }
  });

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-videos') {
      loadYouTubeAPI();
      renderList();
    } else if (ytPlayer) {
      ytPlayer.pauseVideo();
      stopGuard();
    }
  });
})();
