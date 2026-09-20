// ---- Malayalam learning content -----------------------------------------

const LETTER_GROUPS = {
  "Vowels": [
    { ch: "അ", translit: "a", word: "അമ്മ (amma) - Mother" },
    { ch: "ആ", translit: "aa", word: "ആന (aana) - Elephant" },
    { ch: "ഇ", translit: "i", word: "ഇല (ila) - Leaf" },
    { ch: "ഈ", translit: "ee", word: "ഈച്ച (eecha) - Fly" },
    { ch: "ഉ", translit: "u", word: "ഉറുമ്പ് (urumbu) - Ant" },
    { ch: "ഊ", translit: "oo", word: "ഊഞ്ഞാൽ (oonjaal) - Swing" },
    { ch: "എ", translit: "e", word: "എലി (eli) - Mouse" },
    { ch: "ഏ", translit: "ae", word: "ഏണി (aeni) - Ladder" },
    { ch: "ഒ", translit: "o", word: "ഒട്ടകം (ottakam) - Camel" },
    { ch: "ഓ", translit: "oa", word: "ഓണം (onam) - Onam" },
  ],
  "Consonants 1": [
    { ch: "ക", translit: "ka", word: "കടല്‍ (kadal) - Sea" },
    { ch: "ഖ", translit: "kha", word: "ഖഡ്ഗം (khadgam) - Sword" },
    { ch: "ഗ", translit: "ga", word: "ഗജം (gajam) - Elephant" },
    { ch: "ഘ", translit: "gha", word: "ഘടികാരം (ghadikaram) - Clock" },
    { ch: "ങ", translit: "nga", word: "പങ്കജം (pankajam) - Lotus" },
    { ch: "ച", translit: "cha", word: "ചക്ക (chakka) - Jackfruit" },
    { ch: "ഛ", translit: "chha", word: "ഛായ (chhaya) - Shadow" },
    { ch: "ജ", translit: "ja", word: "ജലം (jalam) - Water" },
    { ch: "ഝ", translit: "jha", word: "ഝരി (jhari) - Stream" },
    { ch: "ഞ", translit: "nja", word: "ഞാവൽ (njaval) - Jamun" },
  ],
  "Consonants 2": [
    { ch: "ട", translit: "ta", word: "മുട്ട (mutta) - Egg" },
    { ch: "ഠ", translit: "tta", word: "ഠപ്പ് (thapp)" },
    { ch: "ഡ", translit: "da", word: "ഡ്രം (drum) - Drum" },
    { ch: "ണ", translit: "na", word: "പണം (panam) - Money" },
    { ch: "ത", translit: "tha", word: "തേൻ (then) - Honey" },
    { ch: "ദ", translit: "dha", word: "ദൂരം (dooram) - Distance" },
    { ch: "ന", translit: "na", word: "നായ (naaya) - Dog" },
    { ch: "പ", translit: "pa", word: "പൂവ് (poovu) - Flower" },
    { ch: "ഫ", translit: "pha", word: "ഫലം (phalam) - Fruit" },
    { ch: "ബ", translit: "ba", word: "ബലൂൺ (balloon)" },
  ],
  "Consonants 3": [
    { ch: "ഭ", translit: "bha", word: "ഭവനം (bhavanam) - House" },
    { ch: "മ", translit: "ma", word: "മീൻ (meen) - Fish" },
    { ch: "യ", translit: "ya", word: "യന്ത്രം (yanthram) - Machine" },
    { ch: "ര", translit: "ra", word: "രാജാവ് (rajavu) - King" },
    { ch: "ല", translit: "la", word: "ലഡു (laddu) - Sweet" },
    { ch: "വ", translit: "va", word: "വീട് (veedu) - House" },
    { ch: "ശ", translit: "sha", word: "ശലഭം (shalabham) - Butterfly" },
    { ch: "ഷ", translit: "sha", word: "ഷഡ്ഭുജം (shadbhujam) - Hexagon" },
    { ch: "സ", translit: "sa", word: "സൂര്യൻ (sooryan) - Sun" },
    { ch: "ഹ", translit: "ha", word: "ഹംസം (hamsam) - Swan" },
  ],
};

// English alphabet - spoken English comes first for a 4-year-old, so this
// section focuses on connecting the letter shape + sound to writing it.
const ENGLISH_LETTERS = {
  "Uppercase": "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(ch => ({ ch, word: exampleWord(ch) })),
  "Lowercase": "abcdefghijklmnopqrstuvwxyz".split("").map(ch => ({ ch, word: exampleWord(ch.toUpperCase()) })),
};

function exampleWord(upper) {
  const words = {
    A: "🍎 Apple", B: "🎈 Balloon", C: "🐱 Cat", D: "🐶 Dog", E: "🥚 Egg",
    F: "🐟 Fish", G: "🍇 Grapes", H: "🏠 House", I: "🍦 Ice cream", J: "🧃 Juice",
    K: "🪁 Kite", L: "🦁 Lion", M: "🌙 Moon", N: "👃 Nose", O: "🍊 Orange",
    P: "🐷 Pig", Q: "👑 Queen", R: "🌈 Rainbow", S: "☀️ Sun", T: "🌳 Tree",
    U: "☂️ Umbrella", V: "🚐 Van", W: "🕐 Watch", X: "📦 Box (x)", Y: "🪀 Yo-yo", Z: "🦓 Zebra",
  };
  return words[upper] || "";
}

const WORD_CATEGORIES = {
  "Animals": [
    { emoji: "🐘", mal: "ആന", translit: "aana", en: "Elephant" },
    { emoji: "🐕", mal: "നായ", translit: "naaya", en: "Dog" },
    { emoji: "🐈", mal: "പൂച്ച", translit: "poocha", en: "Cat" },
    { emoji: "🐄", mal: "പശു", translit: "pashu", en: "Cow" },
    { emoji: "🐟", mal: "മീൻ", translit: "meen", en: "Fish" },
    { emoji: "🐦", mal: "പക്ഷി", translit: "pakshi", en: "Bird" },
    { emoji: "🐒", mal: "കുരങ്ങ്", translit: "kurangu", en: "Monkey" },
    { emoji: "🦁", mal: "സിംഹം", translit: "simham", en: "Lion" },
  ],
  "Fruits": [
    { emoji: "🍌", mal: "പഴം", translit: "pazham", en: "Banana" },
    { emoji: "🍎", mal: "ആപ്പിൾ", translit: "apple", en: "Apple" },
    { emoji: "🥭", mal: "മാമ്പഴം", translit: "maambazham", en: "Mango" },
    { emoji: "🍇", mal: "മുന്തിരി", translit: "munthiri", en: "Grapes" },
    { emoji: "🍊", mal: "ഓറഞ്ച്", translit: "orange", en: "Orange" },
    { emoji: "🍍", mal: "കൈതച്ചക്ക", translit: "kaithachakka", en: "Pineapple" },
  ],
  "Family": [
    { emoji: "👩", mal: "അമ്മ", translit: "amma", en: "Mother" },
    { emoji: "👨", mal: "അച്ഛൻ", translit: "achan", en: "Father" },
    { emoji: "👵", mal: "അമ്മൂമ്മ", translit: "ammoomma", en: "Grandmother" },
    { emoji: "👴", mal: "അപ്പൂപ്പൻ", translit: "appooppan", en: "Grandfather" },
    { emoji: "👦", mal: "ആൺകുട്ടി", translit: "aankutty", en: "Boy" },
    { emoji: "👧", mal: "പെൺകുട്ടി", translit: "penkutty", en: "Girl" },
  ],
  "Colours": [
    { emoji: "🔴", mal: "ചുവപ്പ്", translit: "chuvappu", en: "Red" },
    { emoji: "🟢", mal: "പച്ച", translit: "pacha", en: "Green" },
    { emoji: "🔵", mal: "നീല", translit: "neela", en: "Blue" },
    { emoji: "🟡", mal: "മഞ്ഞ", translit: "manja", en: "Yellow" },
    { emoji: "⚪", mal: "വെള്ള", translit: "vella", en: "White" },
    { emoji: "⚫", mal: "കറുപ്പ്", translit: "karuppu", en: "Black" },
  ],
  "Numbers": [
    { emoji: "1️⃣", mal: "ഒന്ന്", translit: "onnu", en: "One" },
    { emoji: "2️⃣", mal: "രണ്ട്", translit: "randu", en: "Two" },
    { emoji: "3️⃣", mal: "മൂന്ന്", translit: "moonu", en: "Three" },
    { emoji: "4️⃣", mal: "നാല്", translit: "naalu", en: "Four" },
    { emoji: "5️⃣", mal: "അഞ്ച്", translit: "anju", en: "Five" },
  ],
};

// Curated Malayalam kids' educational videos (verified titles/channels).
// Add more by pushing { id: '<youtube-id>', title, thumb } — id is the
// part after v= in a YouTube URL.
const VIDEOS = [
  { id: "LEK2Vk1jRes", title: "Letter മ (Ma) - Thumbi TV" },
  { id: "GdoVLVGuO8k", title: "Letter വ (Va) - Thumbi TV" },
  { id: "JIuSZdgIkx8", title: "Letter ക (Ka) - Thumbi TV" },
  { id: "2kk3Y2JsQq8", title: "അക്ഷരമാല - Malayalam Letters" },
  { id: "3mG34YXaSbM", title: "Malayalam Alphabets & Words" },
  { id: "4Bie_8QkOEs", title: "Malayalam Alphabet Song" },
];

// Curated kid-appropriate titles. Each links out to a Netflix/Prime Video
// *search* page for that title (not a guessed catalog ID) - the parent
// signs in there themselves; this app never touches Netflix/Prime credentials.
function netflixSearch(title) {
  return `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
}
function primeSearch(title) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`;
}

const SHOW_CATEGORIES = {
  "Shows for age 4": [
    { title: "Bluey", emoji: "🐶", platform: "netflix" },
    { title: "CoComelon", emoji: "🚜", platform: "netflix" },
    { title: "Peppa Pig", emoji: "🐷", platform: "netflix" },
    { title: "Ada Twist, Scientist", emoji: "🔬", platform: "netflix" },
    { title: "Gabby's Dollhouse", emoji: "🏠", platform: "netflix" },
    { title: "Word Party", emoji: "🎉", platform: "netflix" },
  ],
  "Prime Video picks": [
    { title: "Pete the Cat", emoji: "🐱", platform: "prime" },
    { title: "Dinotrux", emoji: "🦕", platform: "prime" },
    { title: "Wishenpoof", emoji: "✨", platform: "prime" },
    { title: "The Stinky and Dirty Show", emoji: "🚚", platform: "prime" },
  ],
  "Malayalam & Indian": [
    { title: "Chhota Bheem", emoji: "💪", platform: "prime" },
    { title: "Motu Patlu", emoji: "😄", platform: "prime" },
    { title: "Mighty Little Bheem", emoji: "👶", platform: "netflix" },
  ],
};

const STORIES = [
  {
    title: "കുഞ്ഞു പൂച്ച",
    pages: [
      { emoji: "🐱", mal: "ഇതാ ഒരു കുഞ്ഞു പൂച്ച.", en: "Here is a little cat." },
      { emoji: "🥛", mal: "പൂച്ചയ്ക്ക് പാൽ ഇഷ്ടമാണ്.", en: "The cat loves milk." },
      { emoji: "🧶", mal: "പൂച്ച നൂലുമായി കളിക്കുന്നു.", en: "The cat plays with yarn." },
      { emoji: "😴", mal: "പൂച്ച ഉറങ്ങാൻ പോകുന്നു. ശുഭരാത്രി!", en: "The cat goes to sleep. Goodnight!" },
    ],
  },
  {
    title: "സൂര്യനും പൂവും",
    pages: [
      { emoji: "🌻", mal: "ഒരു ചെറിയ പൂവ് ഉണ്ടായിരുന്നു.", en: "There was a little flower." },
      { emoji: "☀️", mal: "സൂര്യൻ ഉദിച്ചു, പൂവ് വിരിഞ്ഞു.", en: "The sun rose, and the flower bloomed." },
      { emoji: "🐝", mal: "ഒരു തേനീച്ച വന്നു സന്തോഷിച്ചു.", en: "A bee came and was happy." },
      { emoji: "🌈", mal: "എല്ലാവരും സന്തോഷമായി കളിച്ചു.", en: "Everyone played happily." },
    ],
  },
  {
    title: "മഴയും കുട്ടിയും",
    pages: [
      { emoji: "☁️", mal: "ആകാശത്ത് കാർമേഘങ്ങൾ വന്നു.", en: "Dark clouds came in the sky." },
      { emoji: "🌧️", mal: "മഴ പെയ്തു, കുട്ടി സന്തോഷിച്ചു.", en: "It rained, and the child was happy." },
      { emoji: "☂️", mal: "കുട്ടി കുട ചൂടി പുറത്തിറങ്ങി.", en: "The child went out with an umbrella." },
      { emoji: "🌈", mal: "മഴ മാറി, മഴവില്ല് വന്നു!", en: "The rain stopped, and a rainbow came!" },
    ],
  },
];
