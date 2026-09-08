// Composant Badge pour afficher une étiquette colorée
const Badge: React.FC<{
  color?: "gold" | "emerald" | "rose" | "zinc" | "sky"; // Couleur du badge
  children: React.ReactNode; // Contenu du badge
}> = ({ color = "sky", children }) => {
  // Palette des styles selon la couleur
  const palette: Record<string, string> = {
    gold: "bg-gold-400/10 text-gold-300 border-gold-400/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-400/30",
    zinc: "bg-white/5 text-zinc-300 border-white/10",
    sky: "bg-sky-500/10 text-sky-300 border-sky-400/30",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border", // Flex, padding et bordure
        "backdrop-blur", // Effet de flou derrière le badge
        palette[color], // Styles dynamiques selon la couleur
      ].join(" ")}
    >
      {children}
    </span>
  );
};

export default Badge;
