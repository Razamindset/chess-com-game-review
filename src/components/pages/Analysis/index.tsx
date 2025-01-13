import { useEffect, useState } from "react";
import usePgnStore from "../../../lib/store/usePgnStore";
import Chessboard from "../../board/Chessboard";
import Controls from "../../board/Controls";
import MoveList from "../../board/MoveList";
import PlayerInfo from "../../board/PlayerInfo";

export default function Home() {
  const { positions: parsedPositons } = usePgnStore();
  const [positions, setPositions] = useState(parsedPositons);

  useEffect(() => {
    if (parsedPositons) {
      setPositions(parsedPositons);
    }
  }, [parsedPositons]);

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-2">
      <div className="w-full max-w-6xl flex gap-6">
        {/* Left Section: Board */}
        <div className="flex flex-col items-center w-2/3">
          <PlayerInfo
            name="Player 1"
            image="/src/assets/icon.png"
            rating={2400}
            title="GM"
            isTop
          />
          {positions && positions.length > 0 ? (
            <Chessboard initialFen={positions[0].after} boardWidth={500} />
          ) : (
            <Chessboard
              initialFen={
                "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"
              }
              boardWidth={500}
            />
          )}
          <PlayerInfo
            name="Player 2"
            image="/src/assets/icon.png"
            rating={2300}
            title="IM"
          />
        </div>

        {/* Right Section: Move List and Controls */}
        <div className="w-1/3 flex flex-col gap-6">
          <MoveList />
          <Controls />
        </div>
      </div>
    </div>
  );
}
