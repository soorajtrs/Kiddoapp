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
  initSettings();
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
  const mascot = document.getElementById('home-mascot');
  if (mascot) mascot.textContent = profile.emoji;
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

// Drops items whose ageMin is above the active profile's set age (nothing
// they're not old enough for yet). Items without an ageMin pass through -
// age rating only applies where we curated one (Movies & Shows).
function filterByAge(items) {
  const age = getProfileAge();
  return items.filter(item => item.ageMin === undefined || item.ageMin <= age);
}

// ---- Age setting (Settings screen) -------------------------------------
// Each profile remembers its own age, so switching Girl/Boy also switches
// which shows are age-appropriate for that kid as they grow.
const DEFAULT_AGE = 4;
const MIN_AGE = 2;
const MAX_AGE = 10;

function getProfileAge(id) {
  id = id || getActiveProfile().id;
  let age;
  try { age = parseInt(localStorage.getItem('kp_age_' + id), 10); } catch (e) { age = NaN; }
  return Number.isFinite(age) ? age : DEFAULT_AGE;
}

function setProfileAge(id, age) {
  age = Math.max(MIN_AGE, Math.min(MAX_AGE, age));
  try { localStorage.setItem('kp_age_' + id, String(age)); } catch (e) { /* ignore */ }
  document.dispatchEvent(new CustomEvent('profile:change', { detail: { id, age } }));
  return age;
}

function initSettings() {
  const ageValue = document.getElementById('settings-age-value');
  const ageMinus = document.getElementById('settings-age-minus');
  const agePlus = document.getElementById('settings-age-plus');
  if (!ageValue || !ageMinus || !agePlus) return;

  function refresh() {
    ageValue.textContent = getProfileAge();
    document.getElementById('settings-profile-name').textContent = getActiveProfile().name;
  }
  ageMinus.addEventListener('click', () => { setProfileAge(getActiveProfile().id, getProfileAge() - 1); refresh(); });
  agePlus.addEventListener('click', () => { setProfileAge(getActiveProfile().id, getProfileAge() + 1); refresh(); });
  document.addEventListener('screen:show', e => { if (e.detail.id === 'screen-settings') refresh(); });
  document.addEventListener('profile:change', refresh);

  initApiKeySettings();
}

// ---- Voice Buddy provider config -----------------------------------------
// Stored only in this browser's localStorage on this device - the app has
// no server to hold it instead. Used only for a direct browser->provider
// call from js/agent.js; see the warning text in the Settings screen itself.
function getAgentProvider() {
  try { return localStorage.getItem('kp_agent_provider') || 'gemini'; } catch (e) { return 'gemini'; }
}
function setAgentProvider(p) {
  try { localStorage.setItem('kp_agent_provider', p); } catch (e) { /* ignore */ }
}

function getAgentConfig() {
  const provider = getAgentProvider();
  try {
    if (provider === 'local') {
      return {
        provider: 'local',
        url: (localStorage.getItem('kp_local_url') || '').replace(/\/$/, ''),
        model: localStorage.getItem('kp_local_model') || '',
      };
    }
    return {
      provider: 'gemini',
      key: localStorage.getItem('kp_gemini_key') || '',
      model: localStorage.getItem('kp_gemini_model') || 'gemini-2.0-flash',
    };
  } catch (e) {
    return { provider };
  }
}

function isAgentConfigured() {
  const cfg = getAgentConfig();
  return cfg.provider === 'local' ? !!cfg.url : !!cfg.key;
}

function saveAgentConfig(fields) {
  try {
    Object.entries(fields).forEach(([k, v]) => {
      if (v) localStorage.setItem(k, v); else localStorage.removeItem(k);
    });
  } catch (e) { /* ignore */ }
}

function clearAgentConfig() {
  try {
    ['kp_gemini_key', 'kp_gemini_model', 'kp_local_url', 'kp_local_model'].forEach(k => localStorage.removeItem(k));
  } catch (e) { /* ignore */ }
}

function initApiKeySettings() {
  const tabs = document.getElementById('agent-provider-tabs');
  const geminiFields = document.getElementById('agent-provider-gemini');
  const localFields = document.getElementById('agent-provider-local');
  const saveBtn = document.getElementById('settings-key-save');
  const clearBtn = document.getElementById('settings-key-clear');
  const status = document.getElementById('settings-key-status');
  if (!tabs) return;

  function showProvider(p) {
    tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.provider === p));
    geminiFields.classList.toggle('hidden', p !== 'gemini');
    localFields.classList.toggle('hidden', p !== 'local');
  }

  function refreshStatus() {
    status.textContent = isAgentConfigured()
      ? `✅ ${getAgentProvider() === 'local' ? 'Local LLM' : 'Gemini'} configured on this device.`
      : 'Not set up yet - Voice Buddy will ask you to configure a provider.';
  }

  tabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => { setAgentProvider(btn.dataset.provider); showProvider(btn.dataset.provider); refreshStatus(); });
  });

  document.addEventListener('screen:show', e => {
    if (e.detail.id === 'screen-settings') {
      showProvider(getAgentProvider());
      refreshStatus();
    }
  });

  saveBtn.addEventListener('click', () => {
    const provider = getAgentProvider();
    if (provider === 'local') {
      saveAgentConfig({
        kp_local_url: document.getElementById('settings-local-url').value.trim(),
        kp_local_model: document.getElementById('settings-local-model').value.trim(),
      });
    } else {
      saveAgentConfig({
        kp_gemini_key: document.getElementById('settings-gemini-key').value.trim(),
        kp_gemini_model: document.getElementById('settings-gemini-model').value.trim(),
      });
    }
    refreshStatus();
  });
  clearBtn.addEventListener('click', () => {
    clearAgentConfig();
    [geminiFields, localFields].forEach(el => el.querySelectorAll('input').forEach(i => i.value = ''));
    refreshStatus();
  });

  showProvider(getAgentProvider());
  refreshStatus();
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

// Chrome (and some other engines) can silently drop a speak() call made
// right after cancel() - a long-standing bug - and can also leave the
// queue "paused" after being idle for a while. cancel() + resume() +
// a same-tick-later speak() is the standard workaround, so a tap never
// goes silent for no visible reason.
function queueSpeak(utter) {
  window.speechSynthesis.cancel();
  setTimeout(() => {
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utter);
  }, 0);
}

// Malayalam audio ships pre-rendered with the app (see js/ml-audio.js,
// generated by scripts/gen-ml-audio.js from espeak-ng's own Malayalam
// voice) - so pronunciation for every letter/word/story in the app never
// depends on the visiting device having a Malayalam voice installed. This
// is checked first and covers everything speak() is normally called with;
// the speechSynthesis path below only runs for text outside that fixed set.
let mlAudioEl = null;
function playBundledMalayalamAudio(text) {
  if (typeof ML_AUDIO_MANIFEST === 'undefined') return false;
  const src = ML_AUDIO_MANIFEST[text];
  if (!src) return false;
  if (!mlAudioEl) mlAudioEl = new Audio();
  mlAudioEl.pause();
  mlAudioEl.src = src;
  mlAudioEl.currentTime = 0;
  mlAudioEl.play().catch(() => { /* blocked until a user gesture; taps always count as one */ });
  return true;
}

async function speak(text, fallbackText) {
  if (playBundledMalayalamAudio(text)) {
    showVoiceNotice(false);
    return;
  }

  if (!('speechSynthesis' in window)) return;
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
  queueSpeak(utter);
  showVoiceNotice(!mlVoice);
}

// For English content - never borrows a Malayalam voice (which would
// mispronounce English), and always speaks the lowercase form of a single
// letter: many TTS engines say "capital A" instead of just "A" for an
// isolated uppercase character, and the sound is identical either way.
async function speakEnglish(text) {
  if (!('speechSynthesis' in window)) return;
  if (!voicesCache) voicesCache = await getVoicesAsync();
  const enVoice = voicesCache.find(v => v.lang && v.lang.toLowerCase().startsWith('en'));
  const utter = new SpeechSynthesisUtterance(text.length === 1 ? text.toLowerCase() : text);
  if (enVoice) utter.voice = enVoice;
  utter.rate = 0.85;
  queueSpeak(utter);
}

// This device doesn't have an installed Malayalam voice, so the browser
// can only approximate pronunciation by reading the romanized spelling in
// English - it will never sound truly correct until a real Malayalam voice
// is installed. Say so, once per screen visit, rather than pretend it's
// right. (Android: Settings > System > Languages > Text-to-speech >
// [engine] > Install voice data > Malayalam. iOS: Settings >
// Accessibility > Spoken Content > Voices > Malayalam.)
let voiceNoticeShown = false;
function showVoiceNotice(usingFallback) {
  const note = document.getElementById('voice-notice');
  if (!note) return;
  if (usingFallback) {
    note.classList.remove('hidden');
    voiceNoticeShown = true;
  } else {
    note.classList.add('hidden');
  }
}
document.addEventListener('screen:show', () => { voiceNoticeShown = false; });
