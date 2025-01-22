/// <reference types="vite/client" />

type classification =
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "book"
  | "null"
  | "error";

interface ApiInitialEval {
  error?: boolean;
  text: string;
  fen: string;
  type: string;
  depth: number;
  move: string | null;
  eval: number;
  centipawns: number;
  mate: number | null;
  // continuationArr: Array<any>;
  debug: string;
  taskId: string;
  color: string;
  piece: string;
  from: string;
  to: string;
  san: string;
  // continuation: Array<any>;
  classification?: classification;
  accuracy?: number;
}

interface Position {
  color: string;
  from: string;
  to: string;
  piece: string;
  flags: string;
  san: string;
  lan: string;
  before: string;
  after: string;
}

interface CustomSquare {
  color?: string;
  emoji?: string;
}

interface MoveInfo {
  from: Square;
  to: Square;
  classification: classification;
  color?: string;
}

interface Arrow {
  from: Square;
  to: Square;
  color: string;
  size: number;
}

interface PlayerInfoProps {
  name: string;
  image: string;
  rating: string;
  title: string;
  isTop?: boolean;
}

interface ChessboardProps {
  initialFen: string;
  lastMove?: MoveInfo | null;
  initialArrows?: Arrow[];
  boardWidth: number;
  whitePlayer: PlayerInfoProps;
  blackPlayer: PlayerInfoProps;
  showArrows: boolean;
  evaluation: number;
}

interface Accuracy {
  white: number;
  black: number;
}

interface Opening {
  pgn: string;
  name: string;
  eco: string;
  moveSan: string[];
}

interface Move {
  lan: string; // Long Algebraic Notation of the move
}

interface ClassificationResponse {
  classification: classification; // classification of the move (best, excellent, book, etc.)
  accuracy: number; // accuracy of the move
}
