import { Route } from "react-router-dom";
import { RequireRole } from "../components";
import { UserRole } from "../types/enums";
import { AdminDashboard, BadgeManagementPage, UserManagement, XPConfigManagementPage } from "../pages/admin";
import { Layout } from "../layouts";

export const AdminRoutes = (
  <Route element={<RequireRole roles={[UserRole.ADMIN]} />}>
    <Route path="/admin"  element={<Layout />}>
      <Route index path="dashboard" element={<AdminDashboard />} />
      <Route path="user-management" element={<UserManagement />} />
      <Route path="badge-management" element={<BadgeManagementPage />} />
      <Route path="xp-config-management" element={<XPConfigManagementPage />} />
    </Route>
  </Route>
);