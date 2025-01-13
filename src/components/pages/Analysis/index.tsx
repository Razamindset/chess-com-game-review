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

export default function ChessViewer() {
  const INITIAL_BOARD_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const { positions: parsedPositions, gameHeaders } = usePgnStore();

  // State management
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentFen, setCurrentFen] = useState(INITIAL_BOARD_FEN);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Initialize positions when PGN data changes
  useEffect(() => {
    if (parsedPositions?.length) {
      setPositions(parsedPositions);
      resetToStart();
    }
  }, [parsedPositions]);

  // Auto-play functionality
  useEffect(() => {
    let intervalId: any;
    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        if (currentIndex >= positions.length - 1) {
          setIsAutoPlaying(false);
          return;
        }
        handleNextMove();
      }, 2000); // 2 second delay between moves
    }
    return () => clearInterval(intervalId);
  }, [isAutoPlaying, currentIndex, positions]);

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

  const handleNextMove = () => {
    if (!positions.length || currentIndex >= positions.length - 1) return;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCurrentFen(positions[nextIndex].after);
  };

  const handlePreviousMove = () => {
    if (currentIndex === -1) return;
    const prevIndex = currentIndex - 1;

    if (prevIndex === -1) {
      resetToStart();
    } else {
      setCurrentIndex(prevIndex);
      setCurrentFen(positions[prevIndex].after);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Get current move for highlighting
  const getCurrentMove = () => {
    if (currentIndex === -1 || !positions[currentIndex]) return null;
    return {
      from: positions[currentIndex].from,
      to: positions[currentIndex].to,
      classification: "best",
    };
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-2">
      <div className="w-full max-w-6xl flex gap-6">
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
          />
        </div>

        <div className="w-1/3 flex flex-col gap-6">
          <div className="w-full bg-gray-800/70 backdrop-blur-md rounded-md p-4 flex flex-col gap-4 shadow-lg">
            {/* Navigation controls */}
            <div className="flex justify-between items-center">
              <button
                className={`flex items-center gap-2 px-3 py-2 text-white rounded-md transition ${
                  currentIndex === -1
                    ? "bg-gray-700/30 cursor-not-allowed"
                    : "bg-gray-700/50 hover:bg-gray-600/50"
                }`}
                onClick={resetToStart}
                disabled={currentIndex === -1}
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
                disabled={currentIndex === -1}
              >
                <FaStepBackward />
              </button>

              <button
                className="flex items-center gap-2 px-3 py-2 text-white bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition"
                onClick={toggleAutoPlay}
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
                  !positions.length || currentIndex >= positions.length - 1
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
          </div>

          {/* Uncomment if you want to add the move list */}
          <MoveList />
        </div>
      </div>
    </div>
  );
}
