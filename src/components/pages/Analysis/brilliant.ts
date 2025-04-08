import { Chess, Piece, Square, Color, PieceSymbol } from "chess.js";

export const pieceValues = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: Infinity,
};

interface SacrificedPieceInfo {
  piece: PieceSymbol;
  color: Color;
  square: Square;
  value: number;
  capturedBy: {
    piece: PieceSymbol;
    from: Square;
    value: number;
  } | null;
}

// Function to find potential sacrifices (higher value pieces that can be captured by lower value pieces)
function findPotentialSacrifices(chessInstance: Chess): SacrificedPieceInfo[] {
  const sacrifices: SacrificedPieceInfo[] = [];
  const currentPlayer = chessInstance.turn(); // Current player's turn
  const opponentColor = currentPlayer === "w" ? "b" : "w"; // Opponent's color

  // Check each possible opponent move
  const opponentMoves = chessInstance.moves({ verbose: true });

  for (const opponentMove of opponentMoves) {
    if (opponentMove.captured) {
      // Get the piece being captured
      const capturedPiece = chessInstance.get(opponentMove.to);
      if (!capturedPiece) continue; // Should not happen, but check anyway

      const capturedValue = pieceValues[capturedPiece.type];
      const capturingValue = pieceValues[opponentMove.piece];

      // If the captured piece is of higher value than the capturing piece, it's a sacrifice
      if (capturedValue > capturingValue) {
        sacrifices.push({
          piece: capturedPiece.type,
          color: capturedPiece.color,
          square: opponentMove.to,
          value: capturedValue,
          capturedBy: {
            piece: opponentMove.piece,
            from: opponentMove.from,
            value: capturingValue,
          },
        });
      }
    }
  }

  return sacrifices;
}

interface BrilliantMoveAnalysis {
  isBrilliant: boolean;
}

export function isBrilliantMove(fenBefore: string, moveSan: string): BrilliantMoveAnalysis {
  const tempChess = new Chess(fenBefore);
  let moveObject;

  try {
    moveObject = tempChess.move(moveSan);
  } catch (e) {
    return { isBrilliant: false }; // Invalid move, not brilliant
  }

  const sacrificedPieces = findPotentialSacrifices(tempChess);
  const isBrilliant = sacrificedPieces.length > 0;

  return { isBrilliant };
}