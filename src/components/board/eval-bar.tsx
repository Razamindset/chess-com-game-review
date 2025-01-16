interface EvlaBarProps {
  evaluation: number;
  height: string;
  isFlipped: boolean;
}

export default function EvlaBar({
  evaluation,
  height,
  isFlipped,
}: EvlaBarProps) {
  // Calculate white and black portions of the evaluation bar
  const evalPercentage = 50 + evaluation * 10; // Example scaling: evaluation ranges from -5 to +5
  const whiteHeight = Math.min(100, Math.max(0, evalPercentage));
  const blackHeight = 100 - whiteHeight;

  return (
    <div
      className="relative transition"
      style={{
        height,
        width: "40px", // Adjust width as needed
        display: "flex",
        flexDirection: isFlipped ? "column" : "column-reverse",
        background: "#eee",
        position: "relative",
      }}
    >
      <span
        className={`absolute top-0 flex items-center justify-center w-full ${
          isFlipped ? "text-black" : "text-white"
        }`}
      >
        {evaluation}
      </span>
      <div
        className="white-bar"
        style={{
          backgroundColor: "white",
          height: `${whiteHeight}%`,
          transition: "height 0.5s ease",
        }}
      />
      {/* Black portion */}
      <div
        className="black-bar"
        style={{
          backgroundColor: "black",
          height: `${blackHeight}%`,
          transition: "height 0.5s ease",
        }}
      />
      {/* Tooltip on hover */}
      <div
        className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-700 text-white text-sm rounded p-1 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{ whiteSpace: "nowrap" }}
      >
        Evaluation: {evaluation?.toFixed(2)}
      </div>
    </div>
  );
}
