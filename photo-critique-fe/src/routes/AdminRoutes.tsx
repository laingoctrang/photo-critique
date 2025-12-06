import { Route } from "react-router-dom";
import { RequireRole } from "../components";
import { UserRole } from "../types/enums";
import { AdminDashboard } from "../pages/admin";
import { Layout } from "../layouts";

export const AdminRoutes = (
  <Route element={<RequireRole roles={[UserRole.ADMIN]} />}>
    <Route path="/admin"  element={<Layout />}>
      <Route index element={<AdminDashboard />} />
    </Route>
  </Route>
);