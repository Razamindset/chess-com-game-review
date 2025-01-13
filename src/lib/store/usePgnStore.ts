import { create } from "zustand";

interface PgnStore {
  positions: Array<{ [key: string]: any }> | null; // Define the shape of the positions array
  setPositions: (newPositions: Array<{ [key: string]: any }>) => void;
}

const usePgnStore = create<PgnStore>((set) => ({
  positions: null,
  setPositions: (newPositions) => set({ positions: newPositions }),
}));

export default usePgnStore;
