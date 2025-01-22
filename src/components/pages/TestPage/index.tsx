import { useState } from "react";
import { useStockfish } from "../../../lib/hooks/useStockfish";

export default function TestPage() {
  const { evaluate } = useStockfish();
  const [fen, setFen] = useState(
    "rnbqkb1r/pp1p1ppp/2p2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 4"
  );
  const [depth, setDepth] = useState(10);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [evaluationTime, setEvaluationTime] = useState<number | null>(null);

  const handleFenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFen(e.target.value);
  };

  const handleDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepth(Number(e.target.value));
  };

  const runEvaluation = async () => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const response = await evaluate(fen, depth);
      console.log(response);

      const endTime = Date.now();
      setEvaluationResult(response);
      setEvaluationTime((endTime - startTime) / 1000); // time in seconds
    } catch (error) {
      console.error("Evaluation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Chess Engine Evaluation</h1>

      <div className="mt-4">
        <label className="block text-sm font-medium">FEN</label>
        <input
          type="text"
          value={fen}
          onChange={handleFenChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-black"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium">Depth</label>
        <input
          type="range"
          min="1"
          max="20"
          value={depth}
          onChange={handleDepthChange}
          className="mt-1 w-full"
        />
        <div className="text-sm">Depth: {depth}</div>
      </div>

      <button
        onClick={runEvaluation}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        {loading ? "Evaluating..." : "Evaluate Position"}
      </button>

      {evaluationTime !== null && (
        <div className="mt-2 text-sm">
          Time taken for evaluation: {evaluationTime.toFixed(2)} seconds
        </div>
      )}

      {evaluationResult && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Evaluation Result</h2>
          <div>
            <p>
              <strong>Best Move:</strong> {evaluationResult.text}
            </p>
            <p>
              <strong>Evaluation Score:</strong> {evaluationResult.eval}
            </p>
            <p>
              <strong>Centipawns:</strong> {evaluationResult.centipawns}
            </p>
            <p>
              <strong>Debug Info:</strong> {evaluationResult.debug}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
