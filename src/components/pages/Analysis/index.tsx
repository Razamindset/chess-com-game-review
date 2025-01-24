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
import { appIcons } from "../../board/icons";
import { Navigate } from "react-router-dom";
// import { useStockfish } from "../../../lib/hooks/useStockfish";

export default function ChessViewer() {
  const INITIAL_BOARD_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const { positions: parsedPositions, gameHeaders, opening } = usePgnStore();
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
  const [avgAccuracy, setAvgAccuracy] = useState<Accuracy>({
    white: 0,
    black: 0,
  });

  // const { evaluate } = useStockfish();

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

  const reviewPosition = async (
    position: Position,
    depth = 18
  ): Promise<any> => {
    const game = new Chess(position.after);
    const isCheckMate = game.isCheckmate();
    const isDraw = game.isDraw();

    if (isCheckMate || isDraw) {
      return {
        isCheckMate,
        isDraw,
        error: true,
      };
    }

    // const controller = new AbortController();
    // const signal = controller.signal;

    // const timeoutId = setTimeout(() => {
    //   controller.abort();
    // }, 3000);

    try {
      const res = await fetch(`https://chess-api.com/v1`, {
        method: "POST",
        body: JSON.stringify({
          fen: position.after,
          depth,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        // signal,
        cache: "force-cache", // Optional, ensure it's supported
      });
      return await res.json();
    } catch (error: any) {
      console.log("Request timed out, using fallback evaluation...");
      // if (error.name === "AbortError") {
      //   console.log("Request timed out, using fallback evaluation...");
      //   const evaluation = await evaluate(position.after, depth);
      //   return evaluation;
      // }
      console.error("Error in reviewPosition:", error);
      return {
        error: true,
        message: error.message,
      };
    } finally {
      // clearTimeout(timeoutId);
    }
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

    //Check if the evaluation already exists in the state
    if (evaluations[nextIndex + 1]) {
      setLoading(false);
      return;
    }

    const currentEvaluation = await reviewPosition(positions[nextIndex]);

    if (
      currentEvaluation.error ||
      currentEvaluation.isCheckMate ||
      currentEvaluation.isDraw
    ) {
      setLoading(false);
      return;
    }

    setEvaluations((prev) => [...prev, currentEvaluation]);

    const prevEvaluation = evaluations[currentIndex + 1];

    const { classification, accuracy } = classifyMove(
      positions[nextIndex],
      currentEvaluation,
      prevEvaluation,
      opening,
      positions[nextIndex],
      nextIndex
    );

    //Update the last evalution with the classification
    setEvaluations((prev) => {
      const updatedEvaluations = [...prev];
      updatedEvaluations[evaluations.length - 1] = {
        ...updatedEvaluations[evaluations.length - 1],
        classification,
        accuracy,
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

  const calculateAverageAccuracy = () => {
    let whiteTotal = 0;
    let blackTotal = 0;
    let whiteCount = 0;
    let blackCount = 0;

    evaluations.forEach((evaluation, index) => {
      if (evaluation.accuracy && !evaluation.error) {
        if (positions[index]?.color === "w") {
          whiteTotal += evaluation.accuracy;
          whiteCount++;
        } else {
          blackTotal += evaluation.accuracy;
          blackCount++;
        }
      }
    });

    setAvgAccuracy({
      white: whiteCount > 0 ? whiteTotal / whiteCount : 0,
      black: blackCount > 0 ? blackTotal / blackCount : 0,
    });
  };

  useEffect(() => {
    calculateAverageAccuracy();
  }, [evaluations]);

  if (!positions) {
    <Navigate to={"/"} />;
  }
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center">
      <div className="w-full h-full max-w-6xl flex items-center gap-6">
        <div className="flex flex-col items-center w-2/3">
          <Chessboard
            initialFen={currentFen}
            boardWidth={500}
            whitePlayer={{
              name: gameHeaders?.White ?? "Player White ?",
              image: appIcons.mainIcon,
              rating: gameHeaders?.WhiteElo ?? "rating ?",
              title: "GM",
            }}
            blackPlayer={{
              name: gameHeaders?.Black ?? "Player Black ?",
              image: appIcons.mainIcon,
              rating: gameHeaders?.BlackElo ?? "rating?",
              title: "GM",
            }}
            lastMove={getCurrentMove()}
            initialArrows={getBestMove()}
            showArrows={showSuggestionArrows}
            evaluation={
              evaluations[currentIndex + 1]?.eval ||
              evaluations[evaluations.length - 1].eval
            }
          />
        </div>

        <div className="w-1/3 h-full flex flex-col gap-6">
          <div className="w-full bg-gray-800/70 backdrop-blur-md rounded-md p-4 flex flex-col gap-4 shadow-lg h-[40vh]">
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
            <div className="flex flex-col items-center gap-2">
              <div>
                <p className="text-white">
                  Accuracy White: {avgAccuracy?.white?.toFixed(2)}%
                </p>
                <p className="text-white">
                  Accuracy Black: {avgAccuracy?.black?.toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="mt-2">
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
            <span className="w-full line-clamp-1 text-ellipsis">
              {opening?.name}
            </span>
          </div>

          <div className="h-[50vh] overflow-y-auto">
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
