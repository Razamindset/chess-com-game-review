import { isBrilliantMove } from "./brilliant";
import { Chess } from "chess.js";

// Define type for piece symbols
type PieceSymbol = "p" | "n" | "b" | "r" | "q" | "k";

export const classifyMove = (
  move: Move,
  currentPositionEval: ApiInitialEval,
  previousPositionEval: ApiInitialEval,
  opening: Opening | null,
  currentPosition: Position,
  currentIndex: number
): ClassificationResponse => {
  if (!currentPositionEval || !previousPositionEval) {
    throw new Error("Incomplete evaluation data");
  }

  // Calculate evaluation changes
  const centipawnChange = Math.abs(
    previousPositionEval.centipawns - currentPositionEval.centipawns
  );

  const relativeEvalChange = Math.abs(
    previousPositionEval.eval - currentPositionEval.eval
  );

  // Get actual evaluation values (not absolute)
  const previousEval = previousPositionEval.eval;
  const currentEval = currentPositionEval.eval;

  // Check for mate situations
  const previousMate = previousPositionEval.mate;
  const currentMate = currentPositionEval.mate;

  // Missing a mate - classify as mistake as per requirement
  const missedMate =
    previousMate !== null &&
    Math.abs(previousMate) <= 5 &&
    currentMate === null;

  // Calculate if player is still winning by a substantial margin
  // Positive eval means the player is winning
  const isStillWinningByLot = currentEval >= 3.0; // Still up by 3+ pawns
  const isLosingButStillWinning =
    previousEval > currentEval && isStillWinningByLot;

  // Classification thresholds
  const thresholds = {
    bestMove: { exactMatch: 0.05, maxEvalLoss: 0.2 },
    excellent: { maxEvalLoss: 0.5, maxCentipawnLoss: 30 },
    good: { maxEvalLoss: 1.0, maxCentipawnLoss: 80 },
    inaccuracy: { maxEvalLoss: 2.0, maxCentipawnLoss: 150 },
    mistake: { maxEvalLoss: 3.0, maxCentipawnLoss: 300 },
  };

  const isBookMove = opening?.moveSan?.includes(currentPosition.san);
  const accuracy = calculateAccuracy(relativeEvalChange, centipawnChange);

  // Check if the last move was just an equal material trade
  const wasEqualTrade = checkForEqualTrade(
    previousPositionEval.fen,
    currentPosition.san
  );

  // Get brilliant move analysis
  const brilliantResult = isBrilliantMove(
    previousPositionEval.fen,
    currentPosition.san
  );

  // Check if it's the best move according to the engine
  const isBestMove = move.lan === previousPositionEval.move;

  // Check if it's an excellent move based on evaluation metrics
  const isExcellentMove =
    relativeEvalChange <= thresholds.excellent.maxEvalLoss &&
    centipawnChange <= thresholds.excellent.maxCentipawnLoss;

  // A brilliant move must be at least excellent or best, and not an equal trade
  const isTrulyBrilliant =
    brilliantResult.isBrilliant &&
    !wasEqualTrade &&
    (isBestMove || isExcellentMove);

  // Missing a mate is always a mistake
  if (missedMate) {
    return {
      accuracy: Math.min(accuracy, 50), // Lower accuracy for missed mate
      classification: "mistake",
    };
  }

  // Priority order: Brilliant > Best > Book > Other classifications
  if (isTrulyBrilliant) {
    return {
      accuracy,
      classification: "brilliant",
    };
  }

  if (isBestMove) {
    return {
      accuracy,
      classification: "best",
    };
  }

  if (
    isBookMove &&
    opening?.moveSan &&
    currentIndex < opening?.moveSan?.length
  ) {
    return {
      accuracy,
      classification: "book",
    };
  }

  // Handle regular move classifications
  if (isExcellentMove) {
    return {
      accuracy,
      classification: "excellent",
    };
  }

  if (
    relativeEvalChange <= thresholds.good.maxEvalLoss &&
    centipawnChange <= thresholds.good.maxCentipawnLoss
  ) {
    return {
      accuracy,
      classification: "good",
    };
  }

  if (
    relativeEvalChange <= thresholds.inaccuracy.maxEvalLoss &&
    centipawnChange <= thresholds.inaccuracy.maxCentipawnLoss
  ) {
    return {
      accuracy,
      classification: "inaccuracy",
    };
  }

  if (
    (relativeEvalChange <= thresholds.mistake.maxEvalLoss &&
      centipawnChange <= thresholds.mistake.maxCentipawnLoss) ||
    isLosingButStillWinning
  ) {
    return {
      accuracy,
      classification: "mistake",
    };
  }

  if (currentPositionEval.error) {
    return {
      accuracy: 80,
      classification: "null",
    };
  }

  // Don't classify as blunder if player is still winning by a substantial margin
  if (isLosingButStillWinning) {
    // Downgrade to mistake if still winning by a lot
    return {
      accuracy,
      classification: "mistake",
    };
  }

  return {
    accuracy,
    classification: "blunder",
  };
};

/**
 * Checks if the move was just an equal trade of material
 * @param fenBefore Position before the move
 * @param moveSan The move in SAN notation
 * @returns boolean indicating if it was an equal material trade
 */
function checkForEqualTrade(fenBefore: string, moveSan: string): boolean {
  const chess = new Chess(fenBefore);

  // Make the move
  try {
    chess.move(moveSan);
  } catch (e) {
    return false; // Invalid move
  }

  // Get the move details from the history
  const moveHistory = chess.history({ verbose: true });
  const lastMove = moveHistory[moveHistory.length - 1];

  // If there was no capture, it's not a trade
  if (!lastMove.captured) {
    return false;
  }

  // Get values of the captured and capturing pieces
  const capturedPieceValue = getPieceValue(lastMove.captured as PieceSymbol);
  const capturingPieceValue = getPieceValue(lastMove.piece as PieceSymbol);

  // Check if the trade was approximately equal
  // We can define "equal" as difference within 1 pawn value
  return Math.abs(capturedPieceValue - capturingPieceValue) <= 1;
}

/**
 * Returns the standard value of a chess piece
 */
function getPieceValue(pieceType: PieceSymbol): number {
  const values: Record<PieceSymbol, number> = {
    p: 1, // pawn
    n: 3, // knight
    b: 3, // bishop
    r: 5, // rook
    q: 9, // queen
    k: 0, // king (not typically assigned a value in trades)
  };

  return values[pieceType] || 0;
}

export function calculateAccuracy(
  relativeEvalChange: number,
  centipawnChange: number
): number {
  let accuracy = 100;

  // Penalize based on relative evaluation change
  accuracy -= relativeEvalChange * 30;

  // Penalize based on centipawn change
  accuracy -= centipawnChange / 3;

  // Random factor for slight variations
  const randomFactor = Math.random() * 2 - 1;
  accuracy += randomFactor;

  // Ensure accuracy is between 0 and 100
  return Math.max(0, Math.min(100, accuracy));
}
