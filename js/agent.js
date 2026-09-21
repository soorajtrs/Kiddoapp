(function () {
  const SCREENS = {
    'screen-letters': 'Malayalam letters',
    'screen-english': 'English letters and writing practice',
    'screen-words': 'Malayalam vocabulary words',
    'screen-videos': 'educational videos',
    'screen-shows': 'Movies and Shows (Netflix/Prime)',
    'screen-puzzle': 'memory match puzzle game',
    'screen-draw': 'drawing pad',
    'screen-read': 'stories and PDF read-aloud',
  };

  const SYSTEM_PROMPT =
    "You are Voice Buddy, a cheerful assistant inside a kids' learning app called " +
    "Kutty Padam, talking to a young child (around 4 years old). The app has these " +
    "sections:\n" + Object.entries(SCREENS).map(([id, d]) => `- ${id}: ${d}`).join('\n') +
    "\n\nGiven what the child said, reply with exactly two lines:\n" +
    "1. One short, warm, simple sentence a young child would enjoy hearing (no more than 20 words).\n" +
    "2. OPEN:<screen-id> naming the single best-matching section id from the list above, " +
    "or OPEN:none if nothing matches and you're just chatting.\n" +
    "Never say anything scary, adult, or unrelated to the app's kid-friendly content.";

  function getRecognition() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return null;
    const rec = new Rec();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    return rec;
  }

  async function askAgent(transcript) {
    const cfg = getAgentConfig();
    const text = cfg.provider === 'local'
      ? await askLocalLLM(cfg, transcript)
      : await askGemini(cfg, transcript);
    return parseAgentReply(text);
  }

  async function askGemini(cfg, transcript) {
    const model = cfg.model || 'gemini-2.0-flash';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cfg.key)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: transcript }] }],
          generationConfig: { maxOutputTokens: 150 },
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Gemini error ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    return parts.map(p => p.text || '').join('\n').trim();
  }

  async function askLocalLLM(cfg, transcript) {
    if (!cfg.url) throw new Error('No local server URL configured');
    const res = await fetch(`${cfg.url}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: cfg.model || undefined,
        max_tokens: 150,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: transcript },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Local LLM error ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const choice = data.choices && data.choices[0];
    return ((choice && choice.message && choice.message.content) || '').trim();
  }

  function parseAgentReply(text) {
    const match = text.match(/OPEN:\s*([a-z-]+|none)/i);
    const target = match ? match[1] : 'none';
    const reply = text.replace(/OPEN:\s*[a-z-]+/i, '').trim() || "Okay!";
    return { reply, target: target !== 'none' && SCREENS[target] ? target : null };
  }

  function initAgentScreen() {
    const micBtn = document.getElementById('agent-mic');
    const hint = document.getElementById('agent-hint');
    const transcriptEl = document.getElementById('agent-transcript');
    const replyEl = document.getElementById('agent-reply');
    if (!micBtn) return;

    let recognition = null;
    let listening = false;

    function setHint(text) { hint.textContent = text; }

    micBtn.addEventListener('click', () => {
      if (!isAgentConfigured()) {
        setHint('Set up Gemini or a Local LLM in Settings first, then come back and tap the mic.');
        return;
      }
      if (!recognition) recognition = getRecognition();
      if (!recognition) {
        setHint("This browser can't listen for speech. Try Chrome on Android or desktop.");
        return;
      }
      if (listening) { recognition.stop(); return; }

      transcriptEl.textContent = '';
      replyEl.textContent = '';
      setHint('Listening... 🎧');
      micBtn.classList.add('listening');
      listening = true;

      recognition.onresult = async (e) => {
        const said = e.results[0][0].transcript;
        transcriptEl.textContent = `"${said}"`;
        setHint('Thinking... 💭');
        try {
          const { reply, target } = await askAgent(said);
          replyEl.textContent = reply;
          speakEnglish(reply);
          setHint('Tap the mic to ask again.');
          if (target) setTimeout(() => showScreen(target), 1800);
        } catch (err) {
          replyEl.textContent = "I couldn't reach my AI brain - check the setup in Settings and your internet.";
          setHint('Tap the mic to try again.');
        }
      };
      recognition.onerror = () => {
        setHint('Tap the mic to try again.');
      };
      recognition.onend = () => {
        listening = false;
        micBtn.classList.remove('listening');
      };
      recognition.start();
    });

    document.addEventListener('screen:show', e => {
      if (e.detail.id === 'screen-agent') {
        if (!isAgentConfigured()) setHint('Set up Gemini or a Local LLM in Settings first, then come back and tap the mic.');
        else if (!getRecognition()) setHint("This browser can't listen for speech. Try Chrome on Android or desktop.");
        else setHint('Tap the mic and ask for something - "letters", "videos", "puzzle"...');
      } else if (recognition && listening) {
        recognition.stop();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initAgentScreen);
})();
