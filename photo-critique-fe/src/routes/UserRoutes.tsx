import { Route } from "react-router-dom";
import { Layout } from "../layouts/Layout";
import { RequireAuth } from "../components";
import { Create, Direct, Explore, Home, Profile, Ranking } from "../pages/user";
// import { PostDetail } from "../features";
import { UserProfile } from "../pages/user/profile/UserProfile";
import { EditProfile } from "../pages/user/profile/EditProfile";


export const UserRoutes = (
  <Route element={<RequireAuth />}>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="explore" element={<Explore />} />
      <Route path="ranking" element={<Ranking />} />
      <Route path="direct" element={<Direct />} />
      <Route path="profile" element={<Profile />} />
      <Route path="create" element={<Create />} />
      {/* <Route path="post/:postId" element={<PostDetail />} /> */}
      <Route path="profile/:username/edit" element={<EditProfile />} />
      <Route path=":username" element={<UserProfile />} />
    </Route>
  </Route>
);