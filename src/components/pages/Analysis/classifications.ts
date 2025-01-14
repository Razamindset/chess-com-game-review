interface Move {
  lan: string; // Long Algebraic Notation of the move
}
interface Response {
  classification: classification;
  accuracy: number;
}

export const classifyMove = (
  move: Move,
  currentPositionEval: ApiInitialEval,
  previousPositionEval: ApiInitialEval
): Response => {
  // Sanity checks
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

  // Classification thresholds (adjusted to be less strict)
  const thresholds = {
    bestMove: {
      exactMatch: 0.05, // Increased from 0.01
      maxEvalLoss: 0.2, // Increased from 0.1
    },
    excellent: {
      maxEvalLoss: 0.5, // Increased from 0.2
      maxCentipawnLoss: 30, // Increased from 20
    },
    good: {
      maxEvalLoss: 1.0, // Increased from 0.5
      maxCentipawnLoss: 80, // Increased from 50
    },
    inaccuracy: {
      maxEvalLoss: 2.0, // Increased from 1.0
      maxCentipawnLoss: 150, // Increased from 100
    },
    mistake: {
      maxEvalLoss: 3.0, // Increased from 2.0
      maxCentipawnLoss: 300, // Increased from 200
    },
    // Anything beyond mistake is a blunder
  };

  // Check if it's the exact best move
  const isBestMove = move.lan === previousPositionEval.move;

  const accuracy = calculateAccuracy(relativeEvalChange, centipawnChange);

  if (isBestMove) {
    return {
      accuracy,
      classification: "best",
    };
  }

  // Evaluate move quality based on evaluation changes
  if (
    relativeEvalChange <= thresholds.excellent.maxEvalLoss &&
    centipawnChange <= thresholds.excellent.maxCentipawnLoss
  ) {
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
    relativeEvalChange <= thresholds.mistake.maxEvalLoss &&
    centipawnChange <= thresholds.mistake.maxCentipawnLoss
  ) {
    return {
      accuracy,
      classification: "mistake",
    };
  }

  // If it exceeds mistake thresholds, it's a blunder
  return {
    accuracy,
    classification: "blunder",
  };
};

export function calculateAccuracy(
  relativeEvalChange: number,
  centipawnChange: number
): number {
  // Base accuracy starts at 100%
  let accuracy = 100;

  // Penalize based on relative evaluation change (reduced penalty)
  accuracy -= relativeEvalChange * 30; // Changed from 50

  // Penalize based on centipawn change (reduced penalty)
  accuracy -= centipawnChange / 3; // Changed from 2

  // Add a small random factor to create slight variations
  const randomFactor = Math.random() * 2 - 1; // Random number between -1 and 1
  accuracy += randomFactor;

  // Ensure accuracy is between 0 and 100
  return Math.max(0, Math.min(100, accuracy));
}
