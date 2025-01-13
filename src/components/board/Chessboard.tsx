import React, { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { fenToBoard, isLightSquare, Piece } from "./utils_chess";

interface CustomSquare {
  color?: string;
  emoji?: string;
}

interface MoveInfo {
  from: Square;
  to: Square;
  classification:
    | "brilliant"
    | "great"
    | "best"
    | "excellent"
    | "good"
    | "inaccuracy"
    | "mistake"
    | "blunder"
    | "book";
  color?: string;
}

interface Arrow {
  from: Square;
  to: Square;
  color: string;
  size: number;
}

interface ChessboardProps {
  initialFen: string;
  lastMove?: MoveInfo;
  initialArrows?: Arrow[];
  boardWidth: number;
}

const classificationConfig = {
  brilliant: { emoji: "/src/assets/media/brilliant.png", color: "#1baca6" },
  great: { emoji: "/src/assets/media/great.png", color: "#5c8bb0" },
  best: { emoji: "/src/assets/media/best.png", color: "#98bc60" },
  excellent: { emoji: "/src/assets/media/excellent.png", color: "#98bc60" },
  good: { emoji: "/src/assets/media/good.png", color: "#98bc60" },
  inaccuracy: { emoji: "/src/assets/media/inaccuracy.png", color: "#e6912c" },
  mistake: { emoji: "/src/assets/media/mistake.png", color: "#df5f5f" },
  blunder: { emoji: "/src/assets/media/blunder.png", color: "#c11c1c" },
  book: { emoji: "/src/assets/media/book.png", color: "#ffff0061" },
};

export default function Chessboard({
  initialFen,
  lastMove,
  initialArrows = [],
  boardWidth,
}: ChessboardProps) {
  const [fen, setFen] = useState(initialFen);
  const [board, setBoard] = useState<Piece[][]>(fenToBoard(fen));
  const [customSquares, setCustomSquares] = useState<
    Record<string, CustomSquare>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [kingInCheck, setKingInCheck] = useState<Square | null>(null);
  const [arrows] = useState<Arrow[]>(initialArrows);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPosition(initialFen);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }, [initialFen]);

  useEffect(() => {
    drawArrows();
  }, [arrows]);

  const getPieceSymbol = (piece: Piece) => {
    const symbols: Record<Piece, string> = {
      p: "/src/assets/media/bp.svg",
      n: "/src/assets/media/bn.svg",
      b: "/src/assets/media/bb.svg",
      r: "/src/assets/media/br.svg",
      q: "/src/assets/media/bq.svg",
      k: "/src/assets/media/bk.svg",
      P: "/src/assets/media/wp.svg",
      N: "/src/assets/media/wn.svg",
      B: "/src/assets/media/wb.svg",
      R: "/src/assets/media/wr.svg",
      Q: "/src/assets/media/wq.svg",
      K: "/src/assets/media/wk.svg",
      "": "",
    };
    return symbols[piece];
  };

  const getSquareStyle = (row: number, col: number) => {
    const squareName = `${String.fromCharCode(97 + col)}${8 - row}` as Square;
    let style: React.CSSProperties = {};

    if (customSquares[squareName]?.color) {
      style.backgroundColor = customSquares[squareName].color;
    }

    const bgColor = classificationConfig[lastMove?.classification ?? "good"].color;

    if (lastMove && squareName === lastMove.to) {
      style.backgroundColor = bgColor || "#ffff0061";
    }
    if (lastMove && squareName === lastMove.from) {
      style.backgroundColor = bgColor || "#ffff0061";
    }

    if (kingInCheck === squareName) {
      style.boxShadow = "inset 0 0 10px rgba(255, 0, 0, 0.6)"; // Red inset shadow with a blur effect
      style.backgroundColor = "red";
    }

    return style;
  };

  // const handleFenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFen(e.target.value);
  //   setError(null);
  // };

  const loadPosition = (fenToLoad: string) => {
    try {
      const newChess = new Chess(fenToLoad);
      setBoard(fenToBoard(newChess.fen()));
      setCustomSquares({});
      setError(null);

      // Check if the king is in check
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

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

        // Set arrow style
        ctx.strokeStyle = arrow.color;
        ctx.lineWidth = arrow.size * scaleX;
        ctx.lineCap = "square";

        // Calculate the angle and length of the arrow
        const angle = Math.atan2(endY - startY, endX - startX);

        // Draw the arrow line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw the arrow head
        ctx.beginPath();
        ctx.moveTo(endX, endY - 25);
        ctx.lineTo(
          endX - 20 * scaleX * Math.cos(angle) - 15 * scaleX * Math.sin(angle),
          endY - 20 * scaleY * Math.sin(angle) + 15 * scaleY * Math.cos(angle)
        );
        ctx.lineTo(
          endX - 20 * scaleX * Math.cos(angle) + 15 * scaleX * Math.sin(angle),
          endY - 20 * scaleY * Math.sin(angle) - 15 * scaleY * Math.cos(angle)
        );
        ctx.closePath();
        ctx.fillStyle = arrow.color;
        ctx.fill();
      }
    };

    // Draw all permanent arrows
    arrows.forEach(drawSingleArrow);
  };

  return (
    <div
      className="w-96 mx-auto"
      style={{
        userSelect: "none",
        width: `${boardWidth}px`,
      }}
    >
      <div className="relative" ref={boardRef}>
        <div className="grid grid-cols-8 gap-0">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const square = `${String.fromCharCode(97 + colIndex)}${
                8 - rowIndex
              }` as Square;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-12 h-12 flex items-center justify-center text-3xl relative
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
                  {lastMove && lastMove.to === square && (
                    <img
                      src={classificationConfig[lastMove.classification]?.emoji}
                      alt={
                        lastMove?.to === square
                          ? lastMove.classification
                          : "custom"
                      }
                      className="absolute -top-3 right-0 w-7 h-7"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          width={512}
          height={512}
        />
      </div>

      {/* <div className="my-4">
        <input
          type="text"
          value={fen}
          onChange={handleFenChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter FEN string"
        />
        <button
          onClick={() => loadPosition(fen)}
          className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load Position
        </button>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </div> */}
    </div>
  );
}
