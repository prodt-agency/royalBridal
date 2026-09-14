import { NavLink } from "react-router-dom";
import { NAV_LINKS } from "./NavLinks";

function DesktopMenu() {
  return (
    <nav className="hidden lg:flex items-center gap-9">
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `relative py-2 text-[11px] font-semibold uppercase tracking-[.16em] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:transition-transform ${
              isActive
                ? "text-[#7d2034] after:scale-x-100 after:bg-[#7d2034]"
                : "text-stone-600 hover:text-[#7d2034] after:scale-x-0 after:bg-[#7d2034] hover:after:scale-x-100"
            }`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
}

export default DesktopMenu;
