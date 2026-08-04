import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { X, MessageCircle } from "lucide-react";

import { NAV_LINKS } from "../Navbar/NavLinks";
import { SITE } from "../../../constants/site";

function MobileMenu({ isOpen, onClose }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-black/40 transition-opacity duration-300
          ${
            isOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }
        `}
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-80 max-w-[85vw]
          bg-white shadow-xl
          transition-transform duration-300
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-bold text-rose-700">
            Royal Bridal
          </h2>

          <button
            onClick={onClose}
            aria-label="Close Menu"
          >
            <X size={26} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col py-4">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `
                px-6
                py-4
                font-medium
                transition
                ${
                  isActive
                    ? "bg-rose-50 text-rose-700"
                    : "hover:bg-gray-100"
                }
              `
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 w-full border-t p-5">
          <a
            href={`https://wa.me/${SITE.WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-green-600
              px-5
              py-3
              font-medium
              text-white
              transition
              hover:bg-green-700
            "
          >
            <MessageCircle size={18} />
            WhatsApp Us
          </a>
        </div>
      </aside>
    </>
  );
}

export default MobileMenu;