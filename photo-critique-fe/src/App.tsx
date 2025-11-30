import "./App.css";
import { BrowserRouter, Routes } from "react-router-dom";
import { UserRoutes } from "./routes/UserRoutes";
import { AdminRoutes } from "./routes/AdminRoutes";
import { PublicRoutes } from "./routes/PublicRoutes";
import { AuthProvider } from "./contexts";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {PublicRoutes}
          {UserRoutes}
          {AdminRoutes}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
