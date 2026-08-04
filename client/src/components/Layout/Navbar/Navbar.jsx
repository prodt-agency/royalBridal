import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Container from "../../common/Container/Container";

import DesktopMenu from "./DesktopMenu";
import NavIcons from "./NavIcons";
import MobileToggle from "./MobileToggle";
import MobileMenu from "../MobileMenu/MobileMenu";

import Logo from "../../../assets/logo.webp";

function Navbar() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <MobileToggle
            onClick={() => setMobileMenuOpen(true)}
          />

          <h1
            onClick={() => navigate("/")}
            className="
              cursor-pointer
              text-2xl
              font-bold
              tracking-wide
              text-rose-700
            "
          >
            <img src={Logo} alt="Royal Bridal" className="h-12 w-auto" />
          </h1>

          <DesktopMenu />

          <NavIcons
            cartCount={0}
            onSearch={() => { }}
            onCart={() => navigate("/cart")}
          />
        </div>
      </Container>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}

export default Navbar;