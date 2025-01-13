import { FaStepBackward, FaPause, FaStepForward } from "react-icons/fa";

export default function Controls() {
  return (
    <div className="w-full bg-gray-800/70 backdrop-blur-md rounded-md p-4 flex justify-between items-center shadow-lg">
      <button className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition">
        <FaStepBackward />
        Previous
      </button>
      <button className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition">
        <FaPause />
        Pause
      </button>
      <button className="flex items-center gap-2 px-4 py-2 text-white bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition">
        <FaStepForward />
        Next
      </button>
    </div>
  );
}
