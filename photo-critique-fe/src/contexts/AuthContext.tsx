import { createContext } from "react";
import type { User, UserRole } from "../types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole[] | UserRole) => boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);