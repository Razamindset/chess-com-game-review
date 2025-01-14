import React, { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { fenToBoard, isLightSquare, Piece } from "./utils";
import PlayerInfo from "./PlayerInfo";
import { FiRefreshCw } from "react-icons/fi";
import { classificationConfig, pieceSymbols } from "../../lib/icons";
import { FaSpinner } from "react-icons/fa";

export default function Chessboard({
  initialFen,
  lastMove,
  initialArrows = [],
  boardWidth,
  whitePlayer,
  blackPlayer,
  showArrows,
}: ChessboardProps) {
  const [board, setBoard] = useState<Piece[][]>(fenToBoard(initialFen));
  const [customSquares, setCustomSquares] = useState<
    Record<string, CustomSquare>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [kingInCheck, setKingInCheck] = useState<Square | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>(initialArrows);
  const [isFlipped, setIsFlipped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPosition(initialFen);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }, [initialFen]);

  useEffect(() => {
    setArrows(initialArrows);
    drawArrows();
  }, [initialArrows, lastMove, initialFen]);

  useEffect(() => {
    drawArrows();
  }, [arrows, showArrows, isFlipped]);

  const getPieceSymbol = (piece: Piece) => {
    return pieceSymbols[piece];
  };

  const getSquareStyle = (row: number, col: number) => {
    const squareName = `${String.fromCharCode(
      97 + (isFlipped ? 7 - col : col)
    )}${isFlipped ? row + 1 : 8 - row}` as Square;
    let style: React.CSSProperties = {};

    if (customSquares[squareName]?.color) {
      style.backgroundColor = customSquares[squareName].color;
    }

    const bgColor =
      (lastMove && classificationConfig[lastMove.classification].color) ||
      classificationConfig["null"].color;

    if (lastMove && squareName === lastMove.to) {
      style.backgroundColor = bgColor;
    }
    if (lastMove && squareName === lastMove.from) {
      style.backgroundColor = bgColor;
    }

    if (kingInCheck === squareName) {
      style.boxShadow = "inset 0 0 10px rgba(255, 0, 0, 0.6)";
      style.backgroundColor = "red";
    }

    return style;
  };

  const loadPosition = (fenToLoad: string) => {
    try {
      const newChess = new Chess(fenToLoad);
      setBoard(fenToBoard(newChess.fen()));
      setCustomSquares({});
      setError(null);

      const turn = newChess.turn();
      if (newChess.inCheck()) {
        const kingSquare = newChess
          .board()
          .reduce((acc: Square | null, row, rowIndex) => {
            if (acc) return acc;
            const colIndex = row.findIndex(
              (piece) => piece?.type === "k" && piece.color === turn
            );
            return colIndex !== -1
              ? (`${String.fromCharCode(97 + colIndex)}${
                  8 - rowIndex
                }` as Square)
              : null;
          }, null);
        setKingInCheck(kingSquare);
      } else {
        setKingInCheck(null);
      }
    } catch (error) {
      setError("Invalid FEN string. Please check and try again.");
    }
  };

  const drawArrows = () => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showArrows) return;

    const drawSingleArrow = (arrow: Arrow) => {
      const fromSquare = board.querySelector(
        `[data-square="${arrow.from}"]`
      ) as HTMLElement;
      const toSquare = board.querySelector(
        `[data-square="${arrow.to}"]`
      ) as HTMLElement;

      if (fromSquare && toSquare) {
        const fromRect = fromSquare.getBoundingClientRect();
        const toRect = toSquare.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();

        const scaleX = canvas.width / boardRect.width;
        const scaleY = canvas.height / boardRect.height;

        const startX =
          (fromRect.left + fromRect.width / 2 - boardRect.left) * scaleX;
        const startY =
          (fromRect.top + fromRect.height / 2 - boardRect.top) * scaleY;
        const endX = (toRect.left + toRect.width / 2 - boardRect.left) * scaleX;
        const endY = (toRect.top + toRect.height / 2 - boardRect.top) * scaleY;

        ctx.strokeStyle = arrow.color;
        ctx.lineWidth = arrow.size * scaleX;
        ctx.lineCap = "round";

        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowHeadLength = 15 * scaleX;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(
          endX - arrowHeadLength * Math.cos(angle),
          endY - arrowHeadLength * Math.sin(angle)
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
          endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
          endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = arrow.color;
        ctx.fill();
      }
    };

    arrows.forEach(drawSingleArrow);
  };

  const handleFlipBoard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="flex flex-col items-center"
      style={{ width: `${boardWidth}px` }}
    >
      <PlayerInfo
        name={isFlipped ? blackPlayer.name : whitePlayer.name}
        image={isFlipped ? blackPlayer.image : whitePlayer.image}
        rating={isFlipped ? blackPlayer.rating : whitePlayer.rating}
        title={isFlipped ? blackPlayer.title : whitePlayer.title}
        isTop
      />
      <div className="relative" ref={boardRef}>
        <div className="grid grid-cols-8 gap-0">
          {(isFlipped ? [...board].reverse() : board).map((row, rowIndex) =>
            (isFlipped ? [...row].reverse() : row).map((piece, colIndex) => {
              const square = `${String.fromCharCode(
                97 + (isFlipped ? 7 - colIndex : colIndex)
              )}${isFlipped ? rowIndex + 1 : 8 - rowIndex}` as Square;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`flex items-center justify-center text-3xl relative
                    ${
                      isLightSquare(rowIndex, colIndex)
                        ? "bg-[#e8c9a9]"
                        : "bg-[#bd7e57]"
                    }`}
                  style={{
                    ...getSquareStyle(rowIndex, colIndex),
                    width: `${boardWidth / 8}px`,
                    height: `${boardWidth / 8}px`,
                  }}
                  data-square={square}
                >
                  {piece && (
                    <img
                      src={getPieceSymbol(piece)}
                      alt={piece}
                      className="w-full h-full"
                    />
                  )}
                  {lastMove &&
                    lastMove.classification != "null" &&
                    lastMove.to === square && (
                      <img
                        src={
                          classificationConfig[
                            lastMove.classification
                              ? lastMove.classification
                              : "null"
                          ]?.emoji
                        }
                        alt={
                          lastMove && lastMove?.to === square
                            ? lastMove.classification
                            : "null"
                        }
                        className="absolute -top-3 right-0 w-7 h-7"
                      />
                    )}
                  {lastMove &&
                    lastMove.classification === "null" &&
                    lastMove.to === square && (
                      <FaSpinner className="absolute animate-spin -top-3 right-0 w-7 h-7 bg-green-600 p-1 rounded-full" />
                    )}
                </div>
              );
            })
          )}
        </div>
        <button
          onClick={handleFlipBoard}
          className="absolute -right-12 top-1/2 transform -translate-y-1/2"
        >
          <FiRefreshCw
            size={25}
            className="text-gray-400 hover:text-gray-300 hover:scale-110 transition-all"
          />
        </button>
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          width={512}
          height={512}
        />
      </div>
      <PlayerInfo
        name={isFlipped ? whitePlayer.name : blackPlayer.name}
        image={isFlipped ? whitePlayer.image : blackPlayer.image}
        rating={isFlipped ? whitePlayer.rating : blackPlayer.rating}
        title={isFlipped ? whitePlayer.title : blackPlayer.title}
      />
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}
