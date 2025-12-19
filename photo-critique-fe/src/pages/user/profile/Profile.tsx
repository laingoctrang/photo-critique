import { useParams } from "react-router-dom";
import { useAuth } from "../../../hooks";
import { MyProfile } from "./MyProfile";
import { UserProfile } from "./UserProfile";

export const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const isOwnProfile = currentUser?.username === username || !username;

  if (isOwnProfile) {
    return <MyProfile />;
  }

  return <UserProfile />;
};
