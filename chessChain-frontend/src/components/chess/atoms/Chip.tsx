export default function Chip({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-4 py-2 rounded-full text-sm transition",
        "border border-white/10 backdrop-blur",
        active
          ? "bg-green-600 text-white shadow-md shadow-green-600/30"
          : "bg-blue-600/80 hover:bg-blue-700 text-white",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
