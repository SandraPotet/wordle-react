import { useState, useEffect, useRef } from "react";
import "./App.css";
import Row from "./components/Row";
import messages from "./messages/fr";
import { fallbackWords } from "./utils/fallbackwords";
import { normalizeWord } from "./utils/normalizeWord";
import { processWords } from "./utils/processWords";


const App = () => {
  // =============================
  // STATE PRINCIPAL
  // =============================

  const [targetWord, setTargetWord] = useState(""); // mot à deviner
  const maxAttempts = 6; // nombre maximum d'essais

  const [guesses, setGuesses] = useState([]); // liste des tentatives
  const [currentGuess, setCurrentGuess] = useState(""); // saisie en cours

  const [isGameOver, setIsGameOver] = useState(false); // fin de partie
  const [gameResult, setGameResult] = useState(null); // "win" ou "lose"

  // gestion du choix de longueur
  const [wordLength, setWordLength] = useState(null); // longueur choisie
  const [selectedLength, setSelectedLength] = useState(5); // slider

  // message utilisateur (ex: mot inconnu)
  const [message, setMessage] = useState("");

  // dictionnaire
  const [wordSet, setWordSet] = useState(null); // Set pour vérifier existence mot
  const [wordsByLength, setWordsByLength] = useState({}); // mots classés par longueur


  const inputRef = useRef(null); // permet de refocus l'input automatiquement (ici, création d'une "référence" à l'input pour pouvoir l'utiliser dans le code, ex: inputRef.current?.focus())


  // =============================
  // CHARGEMENT + PRÉPARATION DES MOTS
  // =============================

  useEffect(() => {
    // fonction asynchrone appelée au montage du composant
    const initWords = async () => {
      try {
        // 1. Récupération des mots depuis une source externe (GitHub)
        const response = await fetch(
          "https://raw.githubusercontent.com/words/an-array-of-french-words/master/index.json"
        );

        // 2. Conversion de la réponse en JSON (tableau de mots)
        const words = await response.json();

        // 3. Traitement des mots (voir utils/processWords.js)
        const { wordSet, wordsByLength } = processWords(words);

        // 4. Stockage dans le state React
        // → wordSet : servira à vérifier si un mot existe
        // → wordsByLength : servira à choisir un mot aléatoire
        setWordSet(wordSet);
        setWordsByLength(wordsByLength);

      } catch (error) {
        console.error("Erreur chargement mots :", error);

        // Récupération des mots de secours (fallbackwords.js) 
        const allFallbackWords = Object.values(fallbackWords).flat(); // on aplatit tous les tableaux de mots de secours en un seul

        // Traitement des mots de secours avec la même logique que pour les mots chargés
        const { wordSet, wordsByLength } = processWords(allFallbackWords);

        setWordSet(wordSet);
        setWordsByLength(wordsByLength);
      }
    };

    // 5. Exécution de la fonction au premier rendu uniquement
    initWords();

  }, []); // [] = ne s’exécute qu’une seule fois (au montage)


  // =============================
  // GÉNÉRATION DU MOT
  // =============================

  useEffect(() => {
    // attendre que la longueur soit choisie
    if (wordLength === null) return;

    // attendre que les mots soient chargés (String() car les clés de wordsByLength sont des strings)
    if (!wordsByLength[String(wordLength)]) return;

    // tirer un mot aléatoire
    const word = getRandomWord(wordLength);
    setTargetWord(word);
  }, [wordLength, wordsByLength]);


  // fonction utilitaire pour choisir un mot aléatoire
  const getRandomWord = (length) => {
    let list = wordsByLength[String(length)];

    // fallback si problème de chargement
    if (!list || list.length === 0) {
      console.warn("fallback utilisé");
      list = fallbackWords[length];
    }

    // sécurité +
    if (!list || list.length === 0) {
      return "";
    }

    return list[Math.floor(Math.random() * list.length)];
  };


  // =============================
  // INPUT UTILISATEUR
  // =============================

  const handleInputChange = (e) => {
    // normalisation directe pour éviter incohérences
    const value = normalizeWord(e.target.value);
    setCurrentGuess(value);
  };


  // =============================
  // LOGIQUE DE JEU
  // =============================

  const handleGuess = () => {
    // si mauvaise longueur → on ignore
    if (currentGuess.length !== wordLength) return;

    const normalizedGuess = normalizeWord(currentGuess);

    // vérification : le mot existe dans le dictionnaire ?
    const isValid = wordSet.has(normalizedGuess);

    if (!isValid) {
      setMessage("Mot inconnu");
      setTimeout(() => setMessage(""), 1200); // message temporaire
      return;
    }

    const updatedGuesses = [...guesses, normalizedGuess];
    setGuesses(updatedGuesses);

    // victoire
    if (normalizedGuess === targetWord) {
      setGameResult("win");
      setIsGameOver(true);
    }
    // défaite
    else if (updatedGuesses.length >= maxAttempts) {
      setGameResult("lose");
      setIsGameOver(true);
    }

    // reset du champ si partie continue
    if (!isGameOver) setCurrentGuess("");

    inputRef.current?.focus(); // UX : refocus automatique
  };


  // =============================
  // RESET / NAVIGATION
  // =============================

  const handleResetGame = () => {
    // reset du state
    setCurrentGuess("");
    setGuesses([]);
    setGameResult(null);
    setIsGameOver(false);

    // nouveau mot
    const word = getRandomWord(wordLength);
    setTargetWord(word);

    inputRef.current?.focus();
  };


  const handleBackToHome = () => {
    // retour à l'écran initial
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


  // =============================
  // RENDER
  // =============================

  // attente du chargement du dictionnaire
  if (!wordSet) {
    return <p>Chargement...</p>;
  }

  // écran d'accueil
  else if (wordLength === null) {
    return (
      <div className="main-container">
        <h1>Wordle</h1>

        <p>Choisis le nombre de lettres du mot à deviner :</p>

        <input
          type="range"
          min={5}
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
  }

  // écran de jeu
  else {
    return (
      <div className="main-container">
        <h1>Wordle</h1>

        {/* message utilisateur - pour les messages temporaires */}
        {message && <div className="message">{message}</div>}

        {/* affichage des lignes de jeu */}
        {guesses.map((guess, index) => (
          <Row key={index} guess={guess} targetWord={targetWord} />
        ))}

        {/* zone de saisie */}
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

        {/* affichage résultat */}
        {isGameOver && gameResult === "win" && <p>{messages.win}</p>}
        {isGameOver && gameResult === "lose" && (
          <p>{`${messages.lose} ${targetWord}`}</p>
        )}

        {/* boutons fin de partie */}
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
