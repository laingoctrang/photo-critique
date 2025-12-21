import "./App.css";
import { BrowserRouter, Routes } from "react-router-dom";
import { UserRoutes } from "./routes/UserRoutes";
import { AdminRoutes } from "./routes/AdminRoutes";
import { PublicRoutes } from "./routes/PublicRoutes";
import { AuthProvider } from "./contexts";
import { ModeratorRoutes } from "./routes/Moderator";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {PublicRoutes}
          {UserRoutes}
          {AdminRoutes}
          {ModeratorRoutes}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
