# Kutty Padam — Malayalam Learning App for Kids

A colorful, no-build web app for a 4-year-old to learn Malayalam and play.
Just static HTML/CSS/JS — open `index.html` in a browser or serve the folder.

## Run locally
```
python3 -m http.server 8000
```
Then open http://localhost:8000

## Sections
- **Letters** — Malayalam vowels & consonants with tap-to-hear pronunciation
  (uses the browser's speech synthesis, Malayalam voice if available).
- **Words** — categorized vocabulary (animals, fruits, family, colours,
  numbers) with emoji + transliteration + English meaning.
- **Videos** — curated Malayalam kids' educational YouTube videos, played
  with custom controls only (no scrub bar, no keyboard seeking). The player
  actively snaps playback back if it detects a forward jump, so kids can't
  skip ahead — they watch the whole video.
- **Puzzle** — an emoji memory-match game with Easy/Medium/Hard sizes.
- **Draw** — a simple canvas drawing pad with colors, brush size, eraser,
  clear, and save-as-image.
- **Read** — illustrated Malayalam mini-stories with a "read to me" button.

## Adding more videos
Edit `js/data.js` → `VIDEOS` array. Each entry is
`{ id: '<youtube-video-id>', title: '...' }` — the id is the part after
`v=` in a normal YouTube URL.

## Adding more letters/words/stories
Edit `js/data.js` — `LETTER_GROUPS`, `WORD_CATEGORIES`, and `STORIES` are
plain arrays/objects, easy to extend.
