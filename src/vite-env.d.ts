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
  | "null";

interface ApiInitialEval {
  text: string;
  captured: boolean;
  promotion: boolean;
  isCapture: boolean;
  isPromotion: boolean;
  isCastling: boolean;
  fen: string;
  type: string;
  depth: number;
  move: string;
  eval: number;
  centipawns: number;
  mate: number | null;
  continuationArr: Array<any>;
  debug: string;
  winChance: number;
  taskId: string;
  turn: string;
  color: string;
  piece: string;
  from: string;
  to: string;
  san: string;
  flags: string;
  lan: string;
  fromNumeric: string;
  toNumeric: string;
  continuation: Array<any>;
  classification?: classification;
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

interface ChessboardProps {
  initialFen: string;
  lastMove?: MoveInfo | null;
  initialArrows?: Arrow[];
  boardWidth: number;
  whitePlayer: {
    name: string;
    image: string;
    rating: number;
    title: string;
  };
  blackPlayer: {
    name: string;
    image: string;
    rating: number;
    title: string;
  };
}
