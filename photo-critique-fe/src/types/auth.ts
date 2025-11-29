import { UserRole } from "./enums";

export type DecodedToken = {
  sub: string;                // email
  userId: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  roles: UserRole[];
  iat: number;
  exp: number;
};

export type User = {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  profilePicture?: string;
  roles: UserRole[];
};
