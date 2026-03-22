import { normalizeWord } from "./normalizeWord";

export const processWords = (words) => {
  const normalized = words.map(w => normalizeWord(w));

  const filtered = normalized.filter(
    w => w.length >= 5 && w.length <= 12
  );

  const wordSet = new Set(filtered);

  const wordsByLength = {};

  filtered.forEach(word => {
    const len = word.length;

    if (!wordsByLength[len]) {
      wordsByLength[len] = [];
    }

    wordsByLength[len].push(word);
  });

  return {
    wordSet,
    wordsByLength
  };
};