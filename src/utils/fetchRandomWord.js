import { normalizeWord } from "./normalizeWord";
import { fallbackWord } from "./fallbackWord";

export const fetchRandomWord = async (size = 5) => {
  try {
    const response = await fetch(`https://trouve-mot.fr/api/size/${size}`);
    const data = await response.json();

    const word = data?.[0]?.name;
    if (!word) {
      throw new Error("Mot invalide");
    }

    return normalizeWord(word);

  } catch (error) {
    console.error("Erreur lors de la récupération du mot :", error);

    const fallback = fallbackWord[size] || fallbackWord[5];
    return normalizeWord(fallback);
  }
};
