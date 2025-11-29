import { jwtDecode } from "jwt-decode";
import { ToastType } from "../components";
import { UserRole, type DecodedToken } from "../types";
import { showToast } from "./toast";

function toUserRole(roleObj: any): UserRole | null {
  if (!roleObj || typeof roleObj.authority !== "string") return null;

  const raw = roleObj.authority;
  const cleaned = raw.replace("ROLE_", "");
  const lower = cleaned.toLowerCase();

  return Object.values(UserRole).includes(lower as UserRole)
    ? (lower as UserRole)
    : null;
}

export function decodeAccessToken(token: string) {
  try {
    const decoded = jwtDecode<DecodedToken>(token);

    const roles: UserRole[] = (decoded.roles || [])
      .map((r) => toUserRole(r))
      .filter((r): r is UserRole => r !== null);

    return {
      id: decoded.userId,
      email: decoded.sub,
      username: decoded.username,
      fullName: decoded.fullName,
      profilePicture: decoded.profilePicture,
      roles,
      exp: decoded.exp,
    };
  } catch (err) {
    showToast(ToastType.ERROR, "Invalid token: " + (err as Error).message);
    return null;
  }
}
