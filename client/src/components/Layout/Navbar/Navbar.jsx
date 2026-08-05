import { Link, useNavigate } from "react-router-dom";
import Container from "@/components/common/Container/Container";
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu";
import DesktopMenu from "@/components/Layout/Navbar/DesktopMenu";
import MobileToggle from "@/components/Layout/Navbar/MobileToggle";
import NavIcons from "@/components/Layout/Navbar/NavIcons";
import Logo from "@/assets/logo.webp";
import useCartStore, { selectCartCount } from "@/store/cartStore";
import useUIStore from "@/store/uiStore";

function Navbar() {
  const navigate = useNavigate();
  const cartCount = useCartStore(selectCartCount);
  const { mobileMenuOpen, openMobileMenu, closeMobileMenu, openSearchDrawer } = useUIStore();
  return <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur"><Container><div className="flex h-18 items-center justify-between gap-6 sm:h-20">
    <MobileToggle onClick={openMobileMenu} /><Link className="shrink-0" to="/" aria-label="Royal Bridal home"><img src={Logo} alt="Royal Bridal" className="h-10 w-auto sm:h-12" /></Link><DesktopMenu /><NavIcons cartCount={cartCount} onSearch={openSearchDrawer} onCart={() => navigate("/cart")} />
  </div></Container><MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} /></header>;
}

export default Navbar;
