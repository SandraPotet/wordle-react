import { useState, useEffect, useRef } from "react";
import "./App.css";
import Row from "./components/Row";
import messages from "./messages/fr";
import { normalizeWord } from "./utils/normalizeWord";
import { fetchRandomWord } from "./utils/fetchRandomWord";


const App = () => {
  const [targetWord, setTargetWord] = useState("");
  const maxAttempts = 6;
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    const startGame = async () => {
      try {
        const word = await fetchRandomWord();
        setTargetWord(word);
      } catch (error) {
        console.error("Erreur lors de la récupération du mot :", error);
        setTargetWord(normalizeWord("APPLE"));
      }
    };
    startGame();
  }, []);

  const handleInputChange = (event) => {
    const rawGuess = event.target.value;
    const normalizedGuess = normalizeWord(rawGuess);

    setCurrentGuess(normalizedGuess.slice(0, 5));
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

  const handleResetGame = async () => {
    setCurrentGuess("");
    setGuesses([]);
    setGameResult(null);
    setIsGameOver(false);

    const word = await fetchRandomWord();
    setTargetWord(word);

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
            type="text"
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            maxLength={targetWord.length}
            placeholder={messages.placeholder}
            value={currentGuess}
            ref={inputRef}
            autoFocus
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
          <button onClick={handleGuess}>{messages.guess}</button>
        </>
      )}
      {isGameOver && gameResult === "win" && <p>{messages.win}</p>}
      {isGameOver && gameResult === "lose" && (
        <p>{`${messages.lose} ${targetWord}`}</p>
      )}
      {isGameOver && (
        <button onClick={handleResetGame}>
          {messages.playAgain}
        </button>
      )}
    </div>
  );
};

export default App;
