import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks";

type RequireAuthProps = {
  redirectTo?: string;
};

export const RequireAuth: React.FC<RequireAuthProps> = ({ redirectTo = "/login" }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to={redirectTo} state={{ from: location }} replace />;

  return <Outlet />;
};

type RequireRoleProps = {
  roles: string[];      // các role được phép
  fallback?: string;    // redirect nếu thiếu quyền
};

export const RequireRole: React.FC<RequireRoleProps> = ({ roles, fallback = "/" }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  const hasRole = user.roles.some((r) => roles.includes(r));
  if (!hasRole) return <Navigate to={fallback} replace />;

  return <Outlet />;
};
