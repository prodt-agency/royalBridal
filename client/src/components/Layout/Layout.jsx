import { Outlet } from "react-router-dom";
import AnnouncementBar from "@/components/Layout/AnnouncementBar/AnnouncementBar";
import Footer from "@/components/Layout/Footer/Footer";
import MobileMenu from "@/components/Layout/MobileMenu/MobileMenu";
import Navbar from "@/components/Layout/Navbar/Navbar";
import SearchDrawer from "@/components/Layout/SearchDrawer/SearchDrawer";
import useUIStore from "@/store/uiStore";

// The panel is a fixed overlay and must sit outside the sticky, backdrop-blurred
// header, which would otherwise become the containing block for fixed children.
function Layout() {
  const { mobileMenuOpen, closeMobileMenu } = useUIStore();

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <SearchDrawer />
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;