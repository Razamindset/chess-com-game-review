import { useCallback } from "react";
import { Chess } from "chess.js"; // Ensure you have chess.js installed

import moveSound from "../../assets/sounds/move.mp3";
import captureSound from "../../assets/sounds/capture.mp3";
import checkSound from "../../assets/sounds/check.mp3";
import castleSound from "../../assets/sounds/castle.mp3";
import promoteSound from "../../assets/sounds/promote.mp3";
import gameStartSound from "../../assets/sounds/ping.mp3";
import gameEndSound from "../../assets/sounds/game_end.mp3";

const sounds: Record<string, HTMLAudioElement> = {
  movePiece: new Audio(moveSound),
  capturePiece: new Audio(captureSound),
  check: new Audio(checkSound),
  castle: new Audio(castleSound),
  promote: new Audio(promoteSound),
  gameStart: new Audio(gameStartSound),
  gameEnd: new Audio(gameEndSound),
};

const useChessSounds = () => {
  const chess = new Chess();

  const playSound = useCallback((soundName: keyof typeof sounds) => {
    const sound = sounds[soundName];

    if (sound) {
      sound.play().catch((error) => {
        console.error(`Error playing sound "${soundName}":`, error);
      });
    } else {
      console.error(`Sound "${soundName}" not found.`);
    }
  }, []);

  const handleMoveSounds = useCallback(
    (position: Position) => {
      chess.load(position.before);

      const move = chess.move({
        from: position.from,
        to: position.to,
        promotion: "q",
      });

      if (!move) {
        console.error("Invalid move:", position);
        return;
      }

      if (move.captured && !move.promotion && !chess.isGameOver()) {
        playSound(chess.isCheck() ? "check" : "capturePiece");
      } else if (move.san.includes("+")) {
        playSound("check");
      } else if (chess.isGameOver()) {
        playSound("gameEnd");
      } else if (move.san === "O-O" || move.san === "O-O-O") {
        playSound("castle");
      } else if (move.promotion) {
        playSound("promote");
      } else {
        playSound("movePiece");
      }
    },
    [chess, playSound]
  );

  return { playSound, handleMoveSounds };
};

export default useChessSounds;
