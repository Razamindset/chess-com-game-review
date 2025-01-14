import { FaChessPawn, FaSpinner } from "react-icons/fa";

export default function Loader() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-10">
        <FaChessPawn className="text-primary text-green-600" size={50} />
        <FaSpinner className="animate-spin" size={35} />
      </div>
    </div>
  );
}
