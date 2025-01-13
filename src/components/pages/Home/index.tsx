import React, { useState } from 'react';
import { Chess } from "chess.js";
import { useNavigate } from "react-router-dom";
import usePgnStore from '../../../lib/store/usePgnStore';
import { ImportModal } from '../../modal';

export default function Home() {
  const { setPositions, setGameHeaders } = usePgnStore();
  const navigate = useNavigate();
  const [importPlatform, setImportPlatform] = useState<'chess.com' | 'lichess' | null>(null);

  const samplePgn = `
    [Event "Scholar's Mate"]
    [Site "?"]
    [Date "2024.12.13"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "1-0"]

    1. e4 e5  
    2. Nf3 f6 
    3. Ne5  1-0
  `;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pgn = (formData.get("pgn") as string).trim();

    try {
      const chess = new Chess();
      chess.loadPgn(pgn);

      const positions = chess.history({ verbose: true });
      const headers = chess.getHeaders();

      setGameHeaders(headers);
      setPositions(positions);

      navigate("/analysis");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8 text-center flex gap-4 items-center">
        <img src="/src/assets/icon.png" alt="appicon" className="h-12 w-12" />
        Free Game Review
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-4xl flex flex-col gap-4">
        <label htmlFor="pgn" className="text-lg font-medium">
          Paste your PGN below:
        </label>
        <textarea
          name="pgn"
          id="pgn"
          className="w-full h-64 bg-gray-800 text-white border border-gray-700 rounded-lg p-4 text-sm resize-none"
          defaultValue={samplePgn}
        />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition"
          >
            Submit
          </button>
        </div>
      </form>
      <div className="w-full max-w-4xl mt-8 flex flex-col md:flex-row gap-4">
        <button
          onClick={() => setImportPlatform('chess.com')}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-lg text-xl font-medium hover:bg-gray-700 transition"
        >
          Import from
          <img
            src="/src/assets/chesscom.png"
            alt="Chess.com"
            className="h-10 ml-4"
          />
        </button>
        <button
          onClick={() => setImportPlatform('lichess')}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-lg text-xl font-medium hover:bg-gray-700 transition"
        >
          Import from
          <img
            src="/src/assets/lichess.svg"
            alt="Lichess"
            className="h-10 ml-4 mr-2"
          />
          Lichess
        </button>
      </div>
      <ImportModal
        isOpen={!!importPlatform}
        onClose={() => setImportPlatform(null)}
        platform={importPlatform || 'chess.com'}
      />
    </div>
  );
}

