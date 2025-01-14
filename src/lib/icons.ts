// Importing classification icons
import BrilliantIcon from "../assets/media/brilliant.png";
import GreatIcon from "../assets/media/great.png";
import BestIcon from "../assets/media/best.png";
import ExcellentIcon from "../assets/media/excellent.png";
import GoodIcon from "../assets/media/good.png";
import InaccuracyIcon from "../assets/media/inaccuracy.png";
import MistakeIcon from "../assets/media/mistake.png";
import BlunderIcon from "../assets/media/blunder.png";
import BookIcon from "../assets/media/book.png";

// Importing chess piece icons
import BlackPawn from "../assets/media/bp.svg";
import BlackKnight from "../assets/media/bn.svg";
import BlackBishop from "../assets/media/bb.svg";
import BlackRook from "../assets/media/br.svg";
import BlackQueen from "../assets/media/bq.svg";
import BlackKing from "../assets/media/bk.svg";

import WhitePawn from "../assets/media/wp.svg";
import WhiteKnight from "../assets/media/wn.svg";
import WhiteBishop from "../assets/media/wb.svg";
import WhiteRook from "../assets/media/wr.svg";
import WhiteQueen from "../assets/media/wq.svg";
import WhiteKing from "../assets/media/wk.svg";
import mainIcon from "../assets/icon.png";
import ChessComIcon from "../assets/chesscom.png";
import LichessIcon from "../assets/lichess.svg";

// Classification Config
export const classificationConfig = {
  brilliant: { emoji: BrilliantIcon, color: "#1baca6" },
  great: { emoji: GreatIcon, color: "#5c8bb0" },
  best: { emoji: BestIcon, color: "#7ca825" },
  excellent: { emoji: ExcellentIcon, color: "#98bc60" },
  good: { emoji: GoodIcon, color: "#6da48d" },
  inaccuracy: { emoji: InaccuracyIcon, color: "#e6912c" },
  mistake: { emoji: MistakeIcon, color: "#e18d2b" },
  blunder: { emoji: BlunderIcon, color: "#c11c1c" },
  book: { emoji: BookIcon, color: "#e12222" },
  null: { emoji: "", color: "#d9cd3e" },
};

// Piece Symbols
export const pieceSymbols = {
  p: BlackPawn,
  n: BlackKnight,
  b: BlackBishop,
  r: BlackRook,
  q: BlackQueen,
  k: BlackKing,
  P: WhitePawn,
  N: WhiteKnight,
  B: WhiteBishop,
  R: WhiteRook,
  Q: WhiteQueen,
  K: WhiteKing,
  "": "", // For empty piece
};

export const appIcons = {
  mainIcon,
  ChessComIcon,
  LichessIcon,
};
