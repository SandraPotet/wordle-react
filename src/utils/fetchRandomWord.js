import { normalizeWord } from "./normalizeWord";

export const fetchRandomWord = async () => {
  try {
    const response = await fetch("https://trouve-mot.fr/api/size/5");
    const data = await response.json();
    const word = data[0].name;

    return normalizeWord(word);
    
  } catch (error) {
    console.error("Erreur lors de la récupération du mot :", error);
    return normalizeWord("APPLE");
  }
};
