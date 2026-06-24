import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

const MainLayout = () => {
  const { pathname } = useLocation();
  const isListingChat = pathname === "/chat" || /^\/listings\/[^/]+\/chat$/.test(pathname);

  return (
    <div className={`${isListingChat ? "flex h-screen flex-col overflow-hidden" : "min-h-screen"} bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100`}>
      <Navbar />
      <main className={isListingChat ? "min-h-0 flex-1 overflow-hidden" : undefined}>
        <Outlet />
      </main>
      {isListingChat ? null : <Footer />}
    </div>
  );
};

export default MainLayout;
