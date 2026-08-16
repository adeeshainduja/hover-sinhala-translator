type TranslationRecord = {
  word: string;
  translation: string;
  partOfSpeech: string;
  definition: string;
};

type TranslationResult = {
  word: string;
  translation: string;
  partOfSpeech: string;
  definition: string;
};

const MOCK_TRANSLATIONS: TranslationRecord[] = [
  {
    word: "algorithm",
    translation: "ඇල්ගොරිතම",
    partOfSpeech: "Noun",
    definition: "A set of steps used to solve a problem.",
  },
  {
    word: "computer",
    translation: "පරිගණකය",
    partOfSpeech: "Noun",
    definition: "An electronic device for storing and processing data.",
  },
  {
    word: "database",
    translation: "දත්ත සමුදාය",
    partOfSpeech: "Noun",
    definition: "An organized collection of data.",
  },
  {
    word: "technology",
    translation: "තාක්ෂණය",
    partOfSpeech: "Noun",
    definition: "The application of scientific knowledge for practical purposes.",
  },
  {
    word: "performance",
    translation: "කාර්යක්ෂමතාව",
    partOfSpeech: "Noun",
    definition: "How well something functions or works.",
  },
];

function translateWord(word: string): Promise<TranslationResult | null> {
  const normalizedWord = word.toLowerCase();
  const record = MOCK_TRANSLATIONS.find((entry) => entry.word === normalizedWord);

  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (!record) {
        resolve(null);
        return;
      }

      resolve({ ...record });
    }, 80);
  });
}

(globalThis as typeof globalThis & {
  translateWord: typeof translateWord;
}).translateWord = translateWord;
