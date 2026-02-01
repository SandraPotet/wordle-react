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
  const [wordLength, setWordLength] = useState(null);
  const [selectedLength, setSelectedLength] = useState(5);


  const inputRef = useRef(null);

  useEffect(() => {
    if (wordLength === null) return;

    const startGame = async () => {
      const word = await fetchRandomWord(wordLength);
      setTargetWord(word);
    };
    startGame();
  }, [wordLength]);

  const handleInputChange = (event) => {
    const rawGuess = event.target.value;
    const normalizedGuess = normalizeWord(rawGuess);

    setCurrentGuess(normalizedGuess.slice(0, wordLength));
  };

  const handleGuess = () => {
    if (currentGuess.length !== wordLength) {
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

    const word = await fetchRandomWord(wordLength);
    setTargetWord(word);

    inputRef.current?.focus();
  };

  const handleBackToHome = () => {
    setWordLength(null);
    setTargetWord("");
    setCurrentGuess("");
    setGuesses([]);
    setGameResult(null);
    setIsGameOver(false);
  };


  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleGuess();
  };


  if (wordLength === null) {
    return (
      <div className="main-container">
        <h1>Wordle</h1>

        <p>Choisis le nombre de lettres du mot à deviner :</p>

        <input
          type="range"
          min={3}
          max={12}
          step={1}
          value={selectedLength}
          onChange={(e) => setSelectedLength(Number(e.target.value))}
        />

        <p>
          {selectedLength} lettres
        </p>

        <button onClick={() => setWordLength(selectedLength)}>
          Commencer la partie
        </button>
      </div>
    );
  } else {
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
              placeholder={`${messages.placeholder}${targetWord.length} lettres`}
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
        {isGameOver && (
          <button onClick={handleBackToHome}>
            {messages.backToHome}
          </button>
        )}
      </div>
    );
  }
};

export default App;
