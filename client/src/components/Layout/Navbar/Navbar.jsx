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
  return <header className="sticky top-0 z-40 border-b border-[#ddd4cc] bg-[#fbf8f5]/95 backdrop-blur"><Container><div className="flex h-[68px] items-center justify-between gap-4 sm:h-[76px]">
    <MobileToggle onClick={openMobileMenu} /><Link className="shrink-0" to="/" aria-label="Royal Bridal home"><img src={Logo} alt="Royal Bridal" className="h-9 w-auto sm:h-11" /></Link><DesktopMenu /><NavIcons cartCount={cartCount} onSearch={openSearchDrawer} onCart={() => navigate("/cart")} />
  </div></Container><MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} /></header>;
}

export default Navbar;
