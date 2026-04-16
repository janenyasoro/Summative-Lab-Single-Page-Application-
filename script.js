const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const topWordContainer = document.getElementById('top-word-container');
const posSectionsContainer = document.getElementById('pos-sections-container');

form.addEventListener('submit', handleSearch);

function handleSearch(event) {
  event.preventDefault();
  const word = input.value.trim();
  if (!word) {
    handleError("Please enter a word to search.");
    return;
  }
  fetchWord(word);
}

async function fetchWord(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) throw new Error("Word not found");
    const data = await response.json();
    displayWord(data);
  } catch (error) {
    handleError(error.message);
  }
}

// Hover effect for Z-axis card movement
function addCardMouseEffect(innerCard) {
  innerCard.addEventListener('mouseenter', () => {
    innerCard.style.transform = `translateZ(40px)`;
  });
  innerCard.addEventListener('mouseleave', () => {
    innerCard.style.transform = `translateZ(0)`;
  });
}

function displayWord(data) {
  topWordContainer.innerHTML = '';
  posSectionsContainer.innerHTML = '';

  if (!data.length) return;

  const firstEntry = data[0];

  // --- Top word card ---
  const wordCard = document.createElement('div');
  wordCard.className = 'word-card top-word-card';

  const wordInner = document.createElement('div');
  wordInner.className = 'card-inner';

  const wordName = document.createElement('h2');
  wordName.textContent = firstEntry.word;
  wordInner.appendChild(wordName);

  if (firstEntry.phonetics[0]?.text) {
    const phonetic = document.createElement('p');
    phonetic.textContent = `Pronunciation: ${firstEntry.phonetics[0].text}`;
    wordInner.appendChild(phonetic);
  }

  wordCard.appendChild(wordInner);

  // --- Audio playback ---
  if (firstEntry.phonetics[0]?.audio) {
    const audioContainer = document.createElement('div');
    audioContainer.style.textAlign = 'center';
    audioContainer.style.marginTop = '0.5rem';

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = firstEntry.phonetics[0].audio;
    audio.preload = "auto";
    audioContainer.appendChild(audio);

    wordCard.appendChild(audioContainer);
  }

  topWordContainer.appendChild(wordCard);

  // --- Merge POS across all entries ---
  const posMap = {};
  data.forEach(entry => {
    entry.meanings.forEach(meaning => {
      const pos = meaning.partOfSpeech;
      if (!posMap[pos]) posMap[pos] = [];
      meaning.definitions.forEach(def => posMap[pos].push(def));
    });
  });

  // --- Render all POS columns in a single container ---
  const posContainer = document.createElement('div');
  posContainer.className = 'pos-container';

  Object.keys(posMap).forEach(pos => {
    const posColumn = document.createElement('div');

    const posHeader = document.createElement('h3');
    posHeader.className = 'card-pos';
    posHeader.textContent = pos.charAt(0).toUpperCase() + pos.slice(1) + 's';
    posColumn.appendChild(posHeader);

    posMap[pos].forEach(def => {
      const defCard = document.createElement('div');
      defCard.className = 'word-card';

      const defInner = document.createElement('div');
      defInner.className = 'card-inner';
      defInner.innerHTML = `<span class="label">Definition:</span> ${def.definition}`;

      if (def.example) {
        const exampleP = document.createElement('p');
        exampleP.className = 'example';
        exampleP.innerHTML = `<span class="label">Example:</span> ${def.example}`;
        defInner.appendChild(exampleP);
      }

      defCard.appendChild(defInner);
      posColumn.appendChild(defCard);
      addCardMouseEffect(defInner);
    });

    posContainer.appendChild(posColumn);
  });

  posSectionsContainer.appendChild(posContainer);
}

// --- Error handler ---
function handleError(message) {
  topWordContainer.innerHTML = '';
  posSectionsContainer.innerHTML = '';
  topWordContainer.innerHTML = `<div class="word-card">
    <div class="card-inner" style="border: 2px solid #ff6b6b; background-color: #ffeaea; color: #900; text-align:center; font-weight:bold;">
      ${message}
    </div>
  </div>`;
}
