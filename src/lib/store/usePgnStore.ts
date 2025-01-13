import { create } from "zustand";

export interface GameHeaders {
  [key: string]: string | undefined;
}

interface PgnStore {
  positions: Position[] | null;
  setPositions: (newPositions: Position[]) => void;
  gameHeaders: GameHeaders | null;
  setGameHeaders: (newHeaders: GameHeaders | null) => void;
}

const usePgnStore = create<PgnStore>((set) => ({
  positions: null,
  gameHeaders: null,
  setPositions: (newPositions) => set({ positions: newPositions }),
  setGameHeaders: (newHeaders) => set({ gameHeaders: newHeaders }),
}));

export default usePgnStore;

// interface gameHeaders {
//   event: string;
//   site: string;
//   date: string;
//   round: string;
//   white: string;
//   black: string;
//   result: string;
//   rating?: string;
// }
