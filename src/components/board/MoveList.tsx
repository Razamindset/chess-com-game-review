import { useEffect, useRef } from "react";
import { classificationConfig } from "./icons";

export default function MoveList({
  positions,
  currentIndex,
  evaluations,
}: {
  positions: Position[];
  currentIndex: number;
  evaluations: ApiInitialEval[];
}) {
  const moveListRef = useRef<HTMLDivElement>(null);
  const currentMoveRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (currentMoveRef.current[currentIndex]) {
      currentMoveRef.current[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  if (!positions || !positions.length)
    return (
      <div className="w-full bg-gray-800 rounded-md p-4 flex flex-col gap-4">
        Loading
      </div>
    );

  return (
    <div
      ref={moveListRef}
      id="move-list"
      className="w-full bg-gray-800 rounded-md p-4 flex flex-col gap-4 move-list"
    >
      <h2 className="text-lg font-bold">
        <div className="text-center text-sm text-gray-300">
          Move Classification {currentIndex + 1} / {positions.length}
        </div>
      </h2>
      {positions?.map((position, index) => (
        <div
          key={index}
          ref={(el) => (currentMoveRef.current[index] = el)}
          className={`flex items-center justify-between px-2 py-1 rounded-md ${
            index === currentIndex ? "bg-gray-700" : ""
          }`}
        >
          <span>
            {index + 1}. {position.san}
          </span>

          {evaluations[index]?.classification &&
          evaluations[index]?.classification === "error" ? (
            <span className="text-red-500">Error</span>
          ) : (
            evaluations[index]?.classification && (
              <img
                src={
                  classificationConfig[evaluations[index]?.classification]
                    ?.emoji
                }
                alt="move-emoji"
                className="h-5"
              />
            )
          )}
        </div>
      ))}
    </div>
  );
}
