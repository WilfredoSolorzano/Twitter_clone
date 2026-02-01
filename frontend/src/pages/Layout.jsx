import React from "react";
import Navbar from "../components/Layout/Navbar";
import MobileNavbar from "../components/Layout/MobileNavbar"; // NOVO
import MobileBottomNav from "../components/Layout/MobileBottomNav";
import RightSidebar from "../components/Layout/RightSidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navbar (visível apenas em mobile) */}
      <MobileNavbar />

      <div className="max-w-7xl mx-auto xl:grid xl:grid-cols-12">
        {/* Sidebar Desktop (oculta em mobile) */}
        <div className="hidden xl:block xl:col-span-3">
          <div className="sticky top-0 h-screen">
            <Navbar />
          </div>
        </div>

        {/* Main Content */}
        <main className="xl:col-span-6 border-x border-gray-200 min-h-screen bg-white">
          {children}
        </main>

        {/* Right Sidebar Desktop (oculta em mobile) */}
        <div className="hidden xl:block xl:col-span-3">
          <RightSidebar />
        </div>
      </div>

      {/* Bottom Navigation para Mobile (adicione isto) */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
