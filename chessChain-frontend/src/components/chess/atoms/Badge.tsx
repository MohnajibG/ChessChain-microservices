export default function Badge({
  color = "blue",
  children,
}: {
  color?: "blue" | "green" | "yellow" | "gray" | "red";
  children: React.ReactNode;
}) {
  const palette: Record<string, string> = {
    blue: "bg-blue-600/20 text-blue-200 border-blue-400/30",
    green: "bg-green-600/20 text-green-200 border-green-400/30",
    yellow: "bg-yellow-500/20 text-yellow-100 border-yellow-400/30",
    gray: "bg-gray-600/30 text-gray-200 border-gray-400/30",
    red: "bg-red-600/20 text-red-200 border-red-400/30",
  };
  return (
    <span
      className={[
        "inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border",
        "backdrop-blur",
        palette[color],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
