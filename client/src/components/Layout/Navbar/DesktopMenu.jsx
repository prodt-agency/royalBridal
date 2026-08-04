import { NavLink } from "react-router-dom";
import { NAV_LINKS } from "./NavLinks";

function DesktopMenu() {
  return (
    <nav className="hidden lg:flex items-center gap-8">
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `font-medium transition-colors ${
              isActive
                ? "text-rose-700"
                : "text-gray-700 hover:text-rose-700"
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