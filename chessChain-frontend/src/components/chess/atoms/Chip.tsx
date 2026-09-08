// Composant Chip pour un bouton stylisé type "puce"
const Chip: React.FC<{
  active?: boolean; // Indique si le chip est actif
  children: React.ReactNode; // Contenu du chip
  onClick?: () => void; // Callback au clic
  disabled?: boolean; // Si true, le chip est désactivé
}> = ({ active, children, onClick, disabled }) => {
  return (
    <button
      onClick={onClick} // Gestion du clic
      disabled={disabled} // Désactivation du bouton
      className={[
        "px-4 py-2 rounded-full text-sm font-medium transition", // Padding, forme et transition
        "border backdrop-blur", // Bordure et effet flou
        active
          ? "border-gold-400/40 bg-gold-400/15 text-gold-200 shadow-sm shadow-gold-500/10" // Styles si actif
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]", // Styles si inactif
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer", // Styles si désactivé
      ].join(" ")}
    >
      {children}
    </button>
  );
};

export default Chip;
