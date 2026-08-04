import { Menu } from "lucide-react";

function MobileToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open Menu"
      className="lg:hidden"
    >
      <Menu size={28} />
    </button>
  );
}

export default MobileToggle;