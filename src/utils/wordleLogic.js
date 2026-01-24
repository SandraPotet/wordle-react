export const getWordleStatuses = (guess, targetWord) => {

    const statuses = Array(guess.length).fill("absent");
    const targetLetters = targetWord.split("");

    guess.split("").forEach((letter, index) => {
        if(letter === targetLetters[index]){
            statuses[index] = "correct";
            targetLetters[index] = null;
        }
    });

    guess.split("").forEach((letter, index) => {
        if(statuses[index] !== "correct") {
            const foundIndex = targetLetters.indexOf(letter);
            if(foundIndex !== -1){
                statuses[index] = "present";
                targetLetters[foundIndex] = null;
            }
        }
    });

    return statuses;
};