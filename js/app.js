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

// Shared speech helper - prefers a Malayalam voice, falls back gracefully.
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const mlVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ml'));
  utter.lang = mlVoice ? mlVoice.lang : 'ml-IN';
  if (mlVoice) utter.voice = mlVoice;
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}
