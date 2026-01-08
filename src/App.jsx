import { useState, useEffect, useRef } from "react";
import "./App.css";
import Row from "./Row";

const App = () => {
  const [targetWord, setTargetWord] = useState("");
  const maxAttempts = 6;
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    const fetchRandomWord = async () => {
      try {
        const response = await fetch("https://trouve-mot.fr/api/size/5");
        const data = await response.json();
        const word = data[0].name;
        setTargetWord(word.toUpperCase());
      } catch (error) {
        console.error("Erreur lors de la récupération du mot :", error);
        setTargetWord("APPLE");
      }
    };
    fetchRandomWord();
  }, []);

  const handleInputChange = (event) => {
    setCurrentGuess(event.target.value.toUpperCase());
  };

  const handleGuess = () => {
    if (currentGuess.length !== 5) {
      return;
    }

    const updatedGuesses = [...guesses, currentGuess];
    setGuesses(updatedGuesses);

    if (currentGuess === targetWord) {
      setGameResult("win");
      setIsGameOver(true);
    } else if (updatedGuesses.length >= maxAttempts) {
      setGameResult("lose");
      setIsGameOver(true);
    }

    if (!isGameOver) setCurrentGuess("");

    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleGuess();
  };

  return (
    <div className="main-container">
      <h1>Wordle</h1>
      {guesses.map((guess, index) => (
        <Row key={index} guess={guess} targetWord={targetWord} />
      ))}
      {!isGameOver && (
        <>
          <input
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            maxLength={targetWord.length}
            placeholder="Enter your guess (5 letters)"
            value={currentGuess}
            ref={inputRef}
            autoFocus
          />
          <button onClick={handleGuess}>Guess</button>
        </>
      )}
      {isGameOver && gameResult === "win" && <p>You win !</p>}
      {isGameOver && gameResult === "lose" && (
        <p>{`Game over! The word was: ${targetWord}`}</p>
      )}
    </div>
  );
};

export default App;
