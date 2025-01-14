import { create } from "zustand";
export interface GameHeaders {
  [key: string]: string | undefined;
}

interface PgnStore {
  positions: Position[] | null;
  setPositions: (newPositions: Position[]) => void;
  gameHeaders: GameHeaders | null;
  setGameHeaders: (newHeaders: GameHeaders | null) => void;
  opening: Opening | null;
  setOpening: (newData: Opening | null) => void;
}

const usePgnStore = create<PgnStore>((set) => ({
  positions: null,
  gameHeaders: null,
  opening: null,
  setPositions: (newPositions) => set({ positions: newPositions }),
  setGameHeaders: (newHeaders) => set({ gameHeaders: newHeaders }),
  setOpening: (newData) => set({ opening: newData }),
}));

export default usePgnStore;
