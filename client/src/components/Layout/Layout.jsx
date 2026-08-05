import { Outlet } from "react-router-dom";
import AnnouncementBar from "@/components/Layout/AnnouncementBar/AnnouncementBar";
import Footer from "@/components/Layout/Footer/Footer";
import Navbar from "@/components/Layout/Navbar/Navbar";
import SearchDrawer from "@/components/Layout/SearchDrawer/SearchDrawer";

function Layout() { return <><AnnouncementBar /><Navbar /><SearchDrawer /><main><Outlet /></main><Footer /></>; }

export default Layout;
