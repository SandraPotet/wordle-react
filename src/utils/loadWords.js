export const loadWords = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/words/an-array-of-french-words/master/index.json"
  );

  const data = await response.json();

  return data;
};