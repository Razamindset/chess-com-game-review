export default function MoveList({
  positions,
  currentIndex,
  evaluations,
}: {
  positions: Position[];
  currentIndex: number;
  evaluations: ApiInitialEval[];
}) {
  if (!positions || !positions.length) return <div>Loading</div>;
  return (
    <div className="w-full bg-gray-800 rounded-md p-4 flex flex-col gap-4">
      <h2 className="text-lg font-bold">
        Move Classification {positions?.length}
      </h2>
      {positions?.map((position, index) => (
        <div key={index} className={`flex items-center justify-between ${index === currentIndex ? "bg-gray-700" : ""}`}>
          <span>{position.san}</span>
          <span>{evaluations ? evaluations[index]?.classification: "Loading"}</span>
        </div>
      ))}
    </div>
  );
}
