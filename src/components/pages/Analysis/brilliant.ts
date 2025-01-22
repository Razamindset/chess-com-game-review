// export const pieceValues = {
//   p: 1,
//   n: 3,
//   b: 3,
//   r: 5,
//   q: 9,
//   k: Infinity,
//   m: 0,
// };

// interface Piece {
//   square: Square;
//   type: PieceSymbol;
//   color: Color;
// }
// interface SacedPiece {
//   piece?: Piece;
//   defendersSquares?: Square[];
//   attackersSquares?: Square[];
// }

// function isBrilliant(move: Position) {
//   const currentPosition = new Chess(move.after);

//   const turn = currentPosition.turn();
//   const previousTurn = currentPosition.turn() === "w" ? "b" : "w";

//   const board = currentPosition.board();

//   let sacedPieces: SacedPiece[] = [];

//   board.forEach((baordRow) => {
//     baordRow.forEach((piece) => {
//       // Check for each square if it holds a piece if it holds a piece also ignore if a pawn is at the square and we want to chck for
//       if (
//         !piece ||
//         piece.type === "p" ||
//         piece.type == "k" ||
//         piece.color !== previousTurn
//       ) {
//         return;
//       }

//       // If the piece on the square was changed

//       // let isHanging = false;
//       let defendersValue = 0;
//       let attackersValue = 0;

//       // If holds then get the defenders and attackers of the square and evaluate their value
//       const defendersSquares = currentPosition.attackers(piece.square, turn);
//       const attackersSquares = currentPosition.attackers(
//         piece.square,
//         previousTurn
//       );

//       // Use the squares to get the piece and sum the value
//       defendersSquares.forEach((square) => {
//         const piece = currentPosition.get(square);
//         if (piece) {
//           defendersValue += pieceValues[piece?.type];
//         }
//       });

//       attackersSquares.forEach((square) => {
//         const piece = currentPosition.get(square);
//         if (piece) {
//           attackersValue += pieceValues[piece?.type];
//         }
//       });

//       // Check if the defenders value is greater than the the attackers value then the piece is saced for now
//       if (defendersValue > attackersValue) {
//         sacedPieces.push({
//           piece,
//           attackersSquares,
//           defendersSquares,
//         });
//       }
//     });
//   });

//   //? We need to check for pinned pieces now in the sacked pieces. And do some conclusion based on the final state of the board after takes takes etc..
//   sacedPieces.forEach((sacedPiece) => {
//     if (
//       sacedPiece.attackersSquares &&
//       sacedPiece.defendersSquares &&
//       sacedPiece.piece
//     ) {
//       const captureTestBoard = new Chess(move.after);
//       sacedPiece.attackersSquares.forEach((square) => {
//         const from = square;
//         const to = sacedPiece.piece?.square;

//         // If to is a promotion square then apply promotions also
//         if (
//           sacedPiece.piece?.type === "p" &&
//           (to?.includes("8") || to?.includes("1"))
//         ) {
//           const promotions = ["r", "q", "n", "b"];

//           promotions.forEach((promotion) => {
//             try {
//               captureTestBoard.move({ from, to, promotion });
//             } catch (error) {
//               return;
//             }

//             if (captureTestBoard.isCheckmate()) {
//               return;
//             }

//             let highestValueLoss = 0;
//             captureTestBoard.board().forEach((boardRow) => {
//               boardRow.forEach((capturedPiece) => {
//                 if (capturedPiece && capturedPiece.color === previousTurn) {
//                   highestValueLoss = Math.max(
//                     highestValueLoss,
//                     pieceValues[capturedPiece.type]
//                   );
//                 }
//               });
//             });

//             if (
//               sacedPiece.piece &&
//               highestValueLoss <= pieceValues[sacedPiece.piece.type]
//             ) {
//               return true;
//             }
//           });
//         }
//       });
//     }
//   });
// }
