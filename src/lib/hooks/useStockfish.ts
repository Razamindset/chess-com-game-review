import { Chess } from "chess.js";
import { useEffect, useRef } from "react";

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null);
  const taskIdRef = useRef(0);
  const engineReadyRef = useRef(false);

  useEffect(() => {
    const worker = new Worker("/stockfish.js");
    workerRef.current = worker;

    const initHandler = (event: MessageEvent) => {
      const data = event.data;

      if (data === "uciok") {
        console.log("UCI initialized");
        worker.postMessage("setoption name EvalFile value /tinynnue.nnue");
        worker.postMessage("isready");
      } else if (data === "readyok") {
        console.log("Engine ready");
        engineReadyRef.current = true;
        worker.removeEventListener("message", initHandler);
      } else if (data.includes("EvalFile")) {
        // Check for confirmation that the NNUE file was loaded
        if (data.includes("EvalFile")) {
          console.log("NNUE file loaded successfully");
          engineReadyRef.current = true; // Set NNUE loaded flag
        }
      }
    };

    worker.addEventListener("message", initHandler);
    worker.postMessage("uci");

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const waitForEngine = async (): Promise<void> => {
    if (engineReadyRef.current) return;

    return new Promise((resolve) => {
      const checkReady = () => {
        if (engineReadyRef.current) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  };

  const evaluate = async (
    fen: string,
    depth: number = 18
  ): Promise<ApiInitialEval> => {
    await waitForEngine();

    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Stockfish worker is not initialized"));
        return;
      }

      const taskId = `task-${++taskIdRef.current}`;
      const color = fen.split(" ")[1];

      const messageHandler = (event: MessageEvent) => {
        const data = event.data;

        if (data.startsWith("info depth")) {
          const depthMatch = data.match(/depth (\d+)/);

          if (parseInt(depthMatch[1]) === depth) {
            const cpMatch = data.match(/score (cp) (-?\d+)/);
            const pvMatch = data.match(/(?: pv )(.+?)(?= |$)/);
            const mateMatch = data.match(/mate (\d+)/);

            const mate = mateMatch ? parseInt(mateMatch[1]) : null;
            const centipawns = cpMatch ? parseInt(cpMatch[2]) : 0;
            const evalScore =
              centipawns !== 0 ? centipawns / 100 : mate ? Infinity : 0;
            const move = pvMatch ? pvMatch[1] : null;
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const san = move.slice(2, 4);
            const chessboard = new Chess(fen);

            const response: ApiInitialEval = {
              taskId: taskId,
              move,
              from,
              to,
              san,
              eval: evalScore,
              centipawns,
              color: color,
              piece: chessboard.get(from)?.type ?? "",
              type: "bestmove",
              depth,
              fen,
              error: false,
              text: `Move ${from} → ${to} (${san}): [${evalScore}]. Depth ${depth}.`,
              debug: data,
              mate,
            };

            resolve(response);
          }
        }
      };

      workerRef.current.addEventListener("message", messageHandler);
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage(`go depth ${depth}`);
    });
  };

  return { evaluate };
}
