import Skeleton from "./Skeleton";

// Définition des props attendues pour le composant Card
type CardProps = {
  title?: string; // Titre de la carte
  subtitle?: string; // Sous-titre de la carte
  right?: React.ReactNode; // Élément affiché à droite dans l'en-tête
  children: React.ReactNode; // Contenu principal de la carte
  footer?: React.ReactNode; // Contenu du pied de carte
  glow?: boolean; // Active un effet de halo autour de la carte
  variant?: "default" | "success" | "danger" | "info"; // Variante de style de la carte
  isLoading?: boolean; // Indique si la carte est en état de chargement
};

// Composant Card en tant que fonction fléchée
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  right,
  children,
  footer,
  glow = false,
  variant = "default",
  isLoading = false,
}) => {
  // Styles CSS pour chaque variante
  const variantStyles: Record<string, string> = {
    default: "border-white/10",
    success: "border-emerald-400/30 ring-emerald-400/20",
    danger: "border-rose-400/30 ring-rose-400/20",
    info: "border-sky-400/30 ring-sky-400/20",
  };

  return (
    <div
      className={[
        "w-full rounded-2xl border", // Forme et bordure
        "bg-white/[0.03] backdrop-blur-xl shadow-lg shadow-black/20 transition hover:border-white/20", // Fond translucide, flou et ombre
        glow ? "ring-1" : "", // Halo si glow=true
        variantStyles[variant], // Style variant
      ].join(" ")}
    >
      {/* En-tête de la carte (titre, sous-titre et élément droit) */}
      {(title || right) && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
          <div>
            {title && (
              <h3 className="font-semibold tracking-tight">{title}</h3>
            )}
            {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}

      {/* Contenu principal de la carte */}
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <Skeleton className="h-24 w-full" /> // Affichage du Skeleton si en chargement
        ) : (
          children
        )}
      </div>

      {/* Pied de carte */}
      {footer && (
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 text-xs text-zinc-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
