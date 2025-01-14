interface Move {
  lan: string; // Long Algebraic Notation of the move
}

export const classifyMove = (
  move: Move,
  currentPositionEval: ApiInitialEval,
  previousPositionEval: ApiInitialEval
  //   bestMove: string
): classification => {
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

  // Determine the player's color
  //   const playerColor = currentPositionEval.fen.includes("w") ? "b" : "w";

  // Classification thresholds (can be tuned based on specific requirements)
  const thresholds = {
    bestMove: {
      exactMatch: 0.01, // Very close to best move
      maxEvalLoss: 0.1,
    },
    excellent: {
      maxEvalLoss: 0.2,
      maxCentipawnLoss: 20,
    },
    good: {
      maxEvalLoss: 0.5,
      maxCentipawnLoss: 50,
    },
    inaccuracy: {
      maxEvalLoss: 1.0,
      maxCentipawnLoss: 100,
    },
    mistake: {
      maxEvalLoss: 2.0,
      maxCentipawnLoss: 200,
    },
    // Anything beyond mistake is a blunder
  };

  // Check if it's the exact best move
  const isBestMove = move.lan === previousPositionEval.move;

  if (
    isBestMove ||
    (relativeEvalChange <= thresholds.bestMove.exactMatch &&
      relativeEvalChange > 0)
  ) {
    return "best";
  }

  // Evaluate move quality based on evaluation changes
  if (
    relativeEvalChange <= thresholds.excellent.maxEvalLoss &&
    centipawnChange <= thresholds.excellent.maxCentipawnLoss
  ) {
    return "excellent";
  }

  if (
    relativeEvalChange <= thresholds.good.maxEvalLoss &&
    centipawnChange <= thresholds.good.maxCentipawnLoss
  ) {
    return "good";
  }

  if (
    relativeEvalChange <= thresholds.inaccuracy.maxEvalLoss &&
    centipawnChange <= thresholds.inaccuracy.maxCentipawnLoss
  ) {
    return "inaccuracy";
  }

  if (
    relativeEvalChange <= thresholds.mistake.maxEvalLoss &&
    centipawnChange <= thresholds.mistake.maxCentipawnLoss
  ) {
    return "mistake";
  }

  // If it exceeds mistake thresholds, it's a blunder
  return "blunder";
};
