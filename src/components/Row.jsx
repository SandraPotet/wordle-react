import React from "react";
import "./Row.css"
import { getWordleStatuses } from "../utils/wordleLogic";


const Row = ({ guess, targetWord }) => {

  const statuses = getWordleStatuses(guess, targetWord);

  return (
    <div
      className="word-row"
      style={{ "--letters-count": guess.length }}
    >
      {guess.split("").map((letter, index) => (
        <span
          key={index}
          className={`letter ${statuses[index]}`}
        >
          {letter}
        </span>
      ))}
    </div>
  );
};

export default Row;