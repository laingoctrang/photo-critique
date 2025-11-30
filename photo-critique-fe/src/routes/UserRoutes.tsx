import { Route } from "react-router-dom";
import { Layout } from "../layouts/Layout";
import { RequireAuth } from "../components";
import { Create, Direct, Explore, Home, Profile, Ranking } from "../pages/user";


export const UserRoutes = (
  <Route element={<RequireAuth />}>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="explore" element={<Explore />} />
      <Route path="ranking" element={<Ranking />} />
      <Route path="direct" element={<Direct />} />
      <Route path="profile" element={<Profile />} />
      <Route path="create" element={<Create />} />
    </Route>
  </Route>
);