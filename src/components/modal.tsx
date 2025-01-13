import { useState } from "react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "chess.com" | "lichess";
}

export function ImportModal({ isOpen, onClose, platform }: ImportModalProps) {
  const [username, setUsername] = useState("");

  const handleImport = () => {
    // TODO: Implement the import logic here
    console.log(`Importing games for ${username} from ${platform}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Import from {platform}</h2>
        <p className="mb-4 text-gray-300">
          Enter your {platform} username to import your games.
        </p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={`${platform} username`}
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Import Games
          </button>
        </div>
      </div>
    </div>
  );
}
