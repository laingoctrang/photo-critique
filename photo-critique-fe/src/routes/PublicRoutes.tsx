import { Route } from "react-router-dom";
import { ForgotPassword, LoginSignup, OAuthCallback } from "../pages/public";

export const PublicRoutes = (
  <Route path="/">
    <Route path="login" element={<LoginSignup />} />
    <Route path="forgot-password" element={<ForgotPassword />} />
    <Route path="oauth/callback" element={<OAuthCallback />} />
  </Route>
);