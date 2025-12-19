
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header, Sidebar } from "../components";

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6F8] px-2">
      {/* Sidebar with toggle */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "" : "w-80"} overflow-hidden`}>
        <div className="p-4 h-full">
          <Sidebar 
            isCollapsed={!isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 pb-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

