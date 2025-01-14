export type Piece = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K' | '';

export function fenToBoard(fen: string): Piece[][] {
  const board: Piece[][] = [];
  const [position] = fen.split(' ');
  const rows = position.split('/');

  for (const row of rows) {
    const boardRow: Piece[] = [];
    for (const char of row) {
      if (isNaN(parseInt(char))) {
        boardRow.push(char as Piece);
      } else {
        boardRow.push(...Array(parseInt(char)).fill(''));
      }
    }
    board.push(boardRow);
  }

  return board;
}

export function isLightSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 0;
}

