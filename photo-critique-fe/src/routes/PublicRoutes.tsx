import { Route } from "react-router-dom";
import { Login } from "../pages/public";

export const PublicRoutes = (
  <Route path="/">
    <Route path="login" element={<Login />} />
  </Route>
);