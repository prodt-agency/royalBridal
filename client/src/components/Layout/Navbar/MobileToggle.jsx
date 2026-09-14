import { Menu } from "lucide-react";

function MobileToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open Menu"
      className="grid h-11 w-11 place-items-center text-[#24181a] lg:hidden"
    >
      <Menu size={28} />
    </button>
  );
}

export default MobileToggle;
