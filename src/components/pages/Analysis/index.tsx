import { useEffect, useState } from "react";
import usePgnStore from "../../../lib/store/usePgnStore";
import Chessboard from "../../board/Chessboard";
import MoveList from "../../board/MoveList";
import {
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaFastBackward,
  FaFastForward,
  FaPlay,
} from "react-icons/fa";
import useChessSounds from "../../../lib/hooks/useSound";
import { apiInitialEval } from "./evaluation";
import { Chess } from "chess.js";
import { classifyMove } from "./classifications";

export default function ChessViewer() {
  const INITIAL_BOARD_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const { positions: parsedPositions, gameHeaders } = usePgnStore();
  const { handleMoveSounds } = useChessSounds();

  // State management
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentFen, setCurrentFen] = useState(INITIAL_BOARD_FEN);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [evaluations, setEvaluations] = useState<ApiInitialEval[]>([
    apiInitialEval,
  ]);
  const [loading, setLoading] = useState(false);
  const [showSuggestionArrows, setShowSuggestionArrows] = useState(false);

  useEffect(() => {
    if (parsedPositions?.length) {
      setPositions(parsedPositions);
      resetToStart();
    }
  }, [parsedPositions]);

  // Auto-play functionality
  // useEffect(() => {
  //   let intervalId: any;
  //   if (isAutoPlaying) {
  //     intervalId = setInterval(() => {
  //       if (loading) return;
  //       if (currentIndex >= positions.length - 1) {
  //         setIsAutoPlaying(false);
  //         return;
  //       }
  //       handleNextMove();
  //     }, 1000); // 2 second delay between moves
  //   }
  //   return () => clearInterval(intervalId);
  // }, [isAutoPlaying, currentIndex, positions]);

  const reviewPostion = async (position: Position, depth = 18) => {
    const game = new Chess(position.after);
    const isCheckMate = game.isCheckmate();

    const isDraw = game.isDraw();
    if (isCheckMate || isDraw) {
      console.log("Game is over");
      return {
        isCheckMate,
        isDraw,
      };
    }

    const res = await fetch(`https://chess-api.com/v1`, {
      method: "POST",
      body: JSON.stringify({
        fen: position.after,
        depth,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 70901713-134c-484c-9107-47b295663715",
      },
      cache: "force-cache",
    });
    return res.json();
  };

  // Navigation functions
  const resetToStart = () => {
    setCurrentIndex(-1);
    setCurrentFen(INITIAL_BOARD_FEN);
  };

  const jumpToEnd = () => {
    if (!positions.length) return;
    setCurrentIndex(positions.length - 1);
    setCurrentFen(positions[positions.length - 1].after);
  };

  const handleNextMove = async () => {
    if (!positions.length || currentIndex >= positions.length - 1) return;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCurrentFen(positions[nextIndex].after);
    handleMoveSounds(positions[nextIndex]);

    setLoading(true);

    const currentEvaluation: ApiInitialEval = await reviewPostion(
      positions[nextIndex]
    );

    setEvaluations((prev) => [...prev, currentEvaluation]);

    const prevEvaluation = evaluations[currentIndex + 1];

    const classification = classifyMove(
      positions[nextIndex],
      currentEvaluation,
      prevEvaluation
    );

    //Update the last evalution with the classification
    setEvaluations((prev) => {
      const updatedEvaluations = [...prev];
      updatedEvaluations[evaluations.length - 1] = {
        ...updatedEvaluations[evaluations.length - 1],
        classification,
      };
      return updatedEvaluations;
    });
    setLoading(false);
    return;
  };

  const handlePreviousMove = () => {
    if (currentIndex === -1) return;
    const prevIndex = currentIndex - 1;

    if (prevIndex === -1) {
      resetToStart();
    } else {
      setCurrentIndex(prevIndex);
      setCurrentFen(positions[prevIndex].after);
      handleMoveSounds(positions[prevIndex]);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const getCurrentMove = (): MoveInfo | null => {
    if (currentIndex === -1 || !positions[currentIndex]) return null;
    return {
      from: positions[currentIndex].from,
      to: positions[currentIndex].to,
      classification: evaluations[currentIndex].classification || "null",
    };
  };

  const getBestMove = () => {
    const wasBestMove = evaluations[currentIndex + 1]?.move;
    if (!wasBestMove) return [];
    const from = wasBestMove.slice(0, 2);
    const to = wasBestMove.slice(2);

    console.log(wasBestMove);

    return [
      {
        from,
        to,
        color: "green",
        size: 10,
      },
    ];
  };

  const handleSuggestionArrowsToggle = () => {
    setShowSuggestionArrows(!showSuggestionArrows);
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center">
      <div className="w-full h-full max-w-6xl flex items-center gap-6">
        <div className="flex flex-col items-center w-2/3">
          <Chessboard
            initialFen={currentFen}
            boardWidth={500}
            whitePlayer={{
              name: gameHeaders?.white ?? "Player White",
              image: "/src/assets/icon.png",
              rating: 2400,
              title: "GM",
            }}
            blackPlayer={{
              name: gameHeaders?.black ?? "Player Black",
              image: "/src/assets/icon.png",
              rating: 2300,
              title: "IM",
            }}
            lastMove={getCurrentMove()}
            initialArrows={getBestMove()}
            showArrows={showSuggestionArrows}
          />
        </div>

        <div className="w-1/3 h-full flex flex-col gap-6">
          <div className="w-full bg-gray-800/70 backdrop-blur-md rounded-md p-4 flex flex-col gap-4 shadow-lg h-full">
            {/* Navigation controls */}
            <div className="flex justify-between items-center">
              <button
                className={`flex items-center gap-2 px-3 py-2 text-white rounded-md transition ${
                  currentIndex === -1
                    ? "bg-gray-700/30 cursor-not-allowed"
                    : "bg-gray-700/50 hover:bg-gray-600/50"
                }`}
                onClick={resetToStart}
                disabled={currentIndex === -1 || loading}
              >
                <FaFastBackward />
              </button>

              <button
                className={`flex items-center gap-2 px-3 py-2 text-white rounded-md transition ${
                  currentIndex === -1
                    ? "bg-gray-700/30 cursor-not-allowed"
                    : "bg-gray-700/50 hover:bg-gray-600/50"
                }`}
                onClick={handlePreviousMove}
                disabled={currentIndex === -1 || loading}
              >
                <FaStepBackward />
              </button>

              <button
                className="flex items-center gap-2 px-3 py-2 text-white bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition"
                onClick={toggleAutoPlay}
                disabled={true}
              >
                {isAutoPlaying ? <FaPause /> : <FaPlay />}
              </button>

              <button
                className={`flex items-center gap-2 px-3 py-2 text-white rounded-md transition ${
                  !positions.length || currentIndex >= positions.length - 1
                    ? "bg-gray-700/30 cursor-not-allowed"
                    : "bg-gray-700/50 hover:bg-gray-600/50"
                }`}
                onClick={handleNextMove}
                disabled={
                  !positions.length ||
                  currentIndex >= positions.length - 1 ||
                  loading
                }
              >
                <FaStepForward />
              </button>

              <button
                className={`flex items-center gap-2 px-3 py-2 text-white rounded-md transition ${
                  !positions.length || currentIndex >= positions.length - 1
                    ? "bg-gray-700/30 cursor-not-allowed"
                    : "bg-gray-700/50 hover:bg-gray-600/50"
                }`}
                onClick={jumpToEnd}
                disabled={
                  !positions.length || currentIndex >= positions.length - 1
                }
              >
                <FaFastForward />
              </button>
            </div>

            {/* Move indicator */}
            <div className="text-center text-sm text-gray-300">
              Move: {currentIndex + 1} / {positions.length}
            </div>
            <div className="mt-4">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showSuggestionArrows}
                  onChange={handleSuggestionArrowsToggle}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="ml-2">Show suggestion arrows</span>
            </div>
          </div>

          <div className="h-[60vh] overflow-y-auto">
            <MoveList
              positions={positions}
              currentIndex={currentIndex}
              evaluations={evaluations}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
