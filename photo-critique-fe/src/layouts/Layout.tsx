
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header, Sidebar } from "../components";

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6F8]">
      {/* Sidebar with toggle */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="py-4 pl-4 pr-0.5 h-full">
          <Sidebar 
            isCollapsed={!isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden ml-1">
        <div className="px-4">
          <Header />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

