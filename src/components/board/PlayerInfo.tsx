import { appIcons } from "./icons";

export default function PlayerInfo({
  name,
  image,
  rating,
  title,
  isTop,
}: PlayerInfoProps) {
  return (
    <div
      className={`flex items-center gap-4 ${
        isTop ? "mb-1" : "mt-1"
      } w-[500px] bg-gray-800 p-2 rounded-md`}
    >
      <img
        src={image ? image : appIcons.mainIcon}
        alt={`${name} avatar`}
        className="w-8 h-8 rounded-full border border-gray-600"
      />
      <div className="flex items-center gap-4">
        <p className="text-lg font-bold">{name}</p>
        <p className="text-sm bg-red-600 rounded-sm px-1">{title}</p>
        <p className="text-sm text-yellow-400">{rating}</p>
      </div>
    </div>
  );
}
