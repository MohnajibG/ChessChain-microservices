// Composant Skeleton pour afficher un placeholder animé lors du chargement
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={[
        "animate-pulse rounded-lg bg-white/10", // Animation pulse et coins arrondis
        "bg-gradient-to-r from-white/[0.08] via-white/[0.16] to-white/[0.08] bg-[length:200%_100%]", // Gradient subtil pour effet de survol lumineux
        className, // Classes supplémentaires passées en props
      ].join(" ")}
    />
  );
};

export default Skeleton;
