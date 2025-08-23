export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-lg bg-white/10",
        "bg-gradient-to-r from-white/[0.08] via-white/[0.16] to-white/[0.08] bg-[length:200%_100%]",
        className,
      ].join(" ")}
    />
  );
}
