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
});

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
