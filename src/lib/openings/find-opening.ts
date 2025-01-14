import { openingData } from "./data";

// Function to check if a move is part of the book opening
export const findOpening = (positions: Position[]): null | Opening => {
  const moves = positions.map((position) => position.san);

  // Normalize the opening pgns by removing move numbers and comments etc
  const normalizeMoves = (pgn: string): string[] => {
    return pgn
      .split(" ")
      .filter((move) => move.trim() !== "")
      .map((move) => move.replace(/^\d+\./, "").trim()); // Remove move numbers
  };

  //! The built in replace is not working for some reason so we write our own
  const removeLetter = (lettter: string, str: string) => {
    let newStr = "";
    for (let i of str) {
      if (i !== lettter) {
        newStr += i;
      }
    }
    return newStr;
  };

  let str = moves.filter((move) => move != "").toLocaleString();
  const slice_length = str.length;

  //* We neeed to start compairing first with a slice of 25 and then reduce by 5 until we get a result
  for (let slice = slice_length; slice > 0; slice -= 5) {
    let gameMovesStr = removeLetter(",", str).slice(0, slice);

    for (const opening of openingData) {
      const arrMoves = normalizeMoves(opening.pgn).filter((move) => move != "");
      const opStrs = arrMoves.toString();
      const openiongMovesStr = removeLetter(",", opStrs).slice(0, slice);

      if (openiongMovesStr === gameMovesStr) {
        return {
          ...opening,
          moveSan: arrMoves,
        };
      }
    }
  }

  return null;
};
