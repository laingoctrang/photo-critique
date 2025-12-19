
import { Outlet } from "react-router-dom";
import { Header, Sidebar } from "../components";


export const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6F8] px-2">
      <div className="p-4">
        <Sidebar />
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

