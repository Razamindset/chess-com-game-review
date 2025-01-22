export const classifyMove = (
  move: Move,
  currentPositionEval: ApiInitialEval,
  previousPositionEval: ApiInitialEval,
  opening: Opening | null,
  currentPostion: Position,
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

  // Classification thresholds
  const thresholds = {
    bestMove: { exactMatch: 0.05, maxEvalLoss: 0.2 },
    excellent: { maxEvalLoss: 0.5, maxCentipawnLoss: 30 },
    good: { maxEvalLoss: 1.0, maxCentipawnLoss: 80 },
    inaccuracy: { maxEvalLoss: 2.0, maxCentipawnLoss: 150 },
    mistake: { maxEvalLoss: 3.0, maxCentipawnLoss: 300 },
  };

  const isBookMove = opening?.moveSan.includes(currentPostion.san);
  const accuracy = calculateAccuracy(relativeEvalChange, centipawnChange);

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

  console.log();
  
  const isBestMove = move.lan === previousPositionEval.move;

  if (isBestMove) {
    return {
      accuracy,
      classification: "best",
    };
  }

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
  if (currentPositionEval.error) {
    return {
      accuracy: 80,
      classification: "null",
    };
  }

  return {
    accuracy,
    classification: "blunder",
  };
};

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
