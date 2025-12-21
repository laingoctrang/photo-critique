import { Route } from "react-router-dom";
import { RequireRole } from "../components";
import { UserRole } from "../types/enums";
import { Layout } from "../layouts";
import { PostReview, Report } from "../pages/moderator";

export const ModeratorRoutes = (
  <Route element={<RequireRole roles={[UserRole.MODERATOR, UserRole.ADMIN]} />}>
    <Route path="/moderator"  element={<Layout />}>
      <Route index path="post-review" element={<PostReview />} />
      <Route path="reports" element={<Report />} />
    </Route>
  </Route>
);