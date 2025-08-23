import Skeleton from "./Skeleton";

type CardProps = {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  glow?: boolean;
  variant?: "default" | "success" | "danger" | "info";
  isLoading?: boolean;
};

export default function Card({
  title,
  subtitle,
  right,
  children,
  footer,
  glow = false,
  variant = "default",
  isLoading = false,
}: CardProps) {
  const variantStyles: Record<string, string> = {
    default: "border-white/10",
    success: "border-green-500/30 ring-green-400/20",
    danger: "border-red-500/30 ring-red-400/20",
    info: "border-blue-500/30 ring-blue-400/20",
  };

  return (
    <div
      className={[
        "w-full rounded-2xl border",
        "bg-white/[0.04] backdrop-blur-md shadow-lg transition hover:shadow-xl",
        glow ? "ring-1" : "",
        variantStyles[variant],
      ].join(" ")}
    >
      {(title || right) && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
          <div>
            {title && <h3 className="font-semibold">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {isLoading ? <Skeleton className="h-24 w-full" /> : children}
      </div>
      {footer && (
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 text-xs text-gray-400">
          {footer}
        </div>
      )}
    </div>
  );
}
