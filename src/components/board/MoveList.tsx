
export default function MoveList() {
  return (
    <div className="w-full bg-gray-800 rounded-md p-4 flex flex-col gap-4">
      <h2 className="text-lg font-bold">Move Classification</h2>
      <ul className="text-sm text-gray-300">
        <li className="flex justify-between">
          <span>1. e4</span>
          <span>Good Move</span>
        </li>
        <li className="flex justify-between">
          <span>1... e5</span>
          <span>Best Move</span>
        </li>
        <li className="flex justify-between">
          <span>2. Nf3</span>
          <span>Inaccuracy</span>
        </li>
        {/* Add more moves dynamically */}
      </ul>
    </div>
  );
}
