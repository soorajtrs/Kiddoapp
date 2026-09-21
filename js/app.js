// ---- Screen navigation ----------------------------------------------------

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  document.dispatchEvent(new CustomEvent('screen:show', { detail: { id } }));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.target));
  });
  initProfiles();
});

// ---- Profiles ---------------------------------------------------------
// Two switchable kid profiles (girl/boy) that theme the UI and steer which
// videos/shows/puzzle emoji get recommended first, without hiding anything.

function getActiveProfile() {
  let id;
  try { id = localStorage.getItem('kp_profile'); } catch (e) { id = null; }
  return PROFILES[id] || PROFILES.girl;
}

function setActiveProfile(id) {
  try { localStorage.setItem('kp_profile', id); } catch (e) { /* ignore */ }
  applyProfileTheme(id);
  document.dispatchEvent(new CustomEvent('profile:change', { detail: { id } }));
}

function applyProfileTheme(id) {
  const profile = PROFILES[id] || PROFILES.girl;
  document.body.setAttribute('data-profile', profile.id);
  document.documentElement.style.setProperty('--accent', profile.accent);
  document.documentElement.style.setProperty('--accent2', profile.accent2);
  document.documentElement.style.setProperty('--bg', profile.bg);
  renderDecor(profile);
  const picker = document.getElementById('profile-picker');
  if (picker) {
    picker.querySelectorAll('.profile-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.profile === profile.id));
  }
}

function renderDecor(profile) {
  const layer = document.getElementById('decor-layer');
  if (!layer) return;
  layer.innerHTML = '';
  profile.decor.forEach((emoji, i) => {
    const span = document.createElement('span');
    span.className = 'decor-item';
    span.textContent = emoji;
    span.style.left = (8 + i * 16) % 96 + '%';
    span.style.animationDelay = (i * 1.3) + 's';
    span.style.animationDuration = (10 + (i % 3) * 3) + 's';
    layer.appendChild(span);
  });
}

function initProfiles() {
  const profile = getActiveProfile();
  applyProfileTheme(profile.id);
  const picker = document.getElementById('profile-picker');
  if (!picker) return;
  picker.querySelectorAll('.profile-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveProfile(btn.dataset.profile));
  });
}

// Sorts items with a `tags` array so ones matching the active profile's
// interests come first (stable order within each group) - nothing is
// hidden, just reordered, and a `recommended` flag is set for the UI.
function withRecommendations(items) {
  const interests = getActiveProfile().interests;
  return items
    .map(item => ({ item, hit: (item.tags || []).some(t => interests.includes(t)) }))
    .sort((a, b) => b.hit - a.hit)
    .map(({ item, hit }) => Object.assign({}, item, { recommended: hit }));
}

// Shared speech helper - prefers a Malayalam voice. Most devices don't have
// one installed, and asking for an unsupported lang/voice combo makes many
// browsers stay silent rather than fall back - so when no Malayalam voice
// exists, we speak `fallbackText` (e.g. the transliteration) with whatever
// default voice the device has, so a tap always produces sound.
let voicesCache = null;
function getVoicesAsync() {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) { resolve([]); return; }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) { resolve(existing); return; }
    const onChange = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onChange);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', onChange);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onChange);
      resolve(window.speechSynthesis.getVoices());
    }, 600);
  });
}

async function speak(text, fallbackText) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  if (!voicesCache) voicesCache = await getVoicesAsync();
  const mlVoice = voicesCache.find(v => v.lang && v.lang.toLowerCase().startsWith('ml'));

  let utter;
  if (mlVoice) {
    utter = new SpeechSynthesisUtterance(text);
    utter.voice = mlVoice;
    utter.lang = mlVoice.lang;
  } else {
    utter = new SpeechSynthesisUtterance(fallbackText || text);
  }
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}
