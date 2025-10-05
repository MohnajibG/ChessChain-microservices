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
        "px-4 py-2 rounded-full text-sm transition", // Padding, forme et transition
        "border border-white/10 backdrop-blur", // Bordure et effet flou
        active
          ? "bg-green-600 text-white shadow-md shadow-green-600/30" // Styles si actif
          : "bg-blue-600/80 hover:bg-blue-700 text-white", // Styles si inactif
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer", // Styles si désactivé
      ].join(" ")}
    >
      {children}
    </button>
  );
};

export default Chip;
