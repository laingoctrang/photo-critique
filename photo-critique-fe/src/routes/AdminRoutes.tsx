import { Route } from "react-router-dom";
import { RequireRole } from "../components";
import { UserRole } from "../types/enums";
import { AdminDashboard } from "../pages/admin";

export const AdminRoutes = (
  <Route path="/admin" element={<RequireRole roles={[UserRole.ADMIN]} />}>
    <Route index element={<AdminDashboard />} />
  </Route>
);