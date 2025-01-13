/// <reference types="vite/client" />
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
