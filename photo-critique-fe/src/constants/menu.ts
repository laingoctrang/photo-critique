import {
  HomeIcon,
  TrophyIcon,
  ChatBubbleBottomCenterIcon,
  UserIcon,
  ChartPieIcon,
  UsersIcon,
  FlagIcon,
  // GlobeAltIcon,
  SparklesIcon,
  ChartBarIcon,
  PaintBrushIcon,
  StarIcon,
  FilmIcon,
} from "@heroicons/react/24/outline";

import { UserRole, AppTab, TabCategory, type MenuItem } from "../types/enums";

export const SIDEBAR_MENU: MenuItem[] = [
  {
    id: AppTab.HOME,
    label: "Home",
    icon: HomeIcon,
    category: TabCategory.MAIN,
    roles: [UserRole.USER],
    path: "/",
  },
  // {
  //   id: AppTab.EXPLORE,
  //   label: "Explore",
  //   icon: GlobeAltIcon,
  //   category: TabCategory.MAIN,
  //   roles: [UserRole.USER],
  //   path: "/explore",
  // },
  {
    id: AppTab.CREATE,
    label: "Create",
    icon: PaintBrushIcon,
    category: TabCategory.MAIN,
    roles: [UserRole.USER],
    path: "/create",
  },
  {
    id: AppTab.AI_EDIT,
    label: "AI Edit",
    icon: SparklesIcon,
    category: TabCategory.MAIN,
    roles: [UserRole.USER],
    path: "/ai-edit",
  },
  {
    id: AppTab.RANKING,
    label: "Ranking",
    icon: TrophyIcon,
    category: TabCategory.MAIN,
    roles: [UserRole.USER],
    path: "/ranking",
  },
  {
    id: AppTab.DIRECT,
    label: "Direct",
    icon: ChatBubbleBottomCenterIcon,
    category: TabCategory.MAIN,
    roles: [UserRole.USER],
    path: "/direct",
  },
  {
    id: AppTab.PROFILE,
    label: "Profile",
    icon: UserIcon,
    category: TabCategory.MAIN,
    roles: [UserRole.USER],
    path: "/profile",
  },
  

  // Admin tabs
  {
    id: AppTab.ADMIN_DASHBOARD,
    label: "Dashboard",
    icon: ChartPieIcon,
    category: TabCategory.ADMIN,
    roles: [UserRole.ADMIN],
    path: "/admin/dashboard",
  },
  {
    id: AppTab.USER_MANAGEMENT,
    label: "User Management",
    icon: UsersIcon,
    category: TabCategory.ADMIN,
    roles: [UserRole.ADMIN],
    path: "/admin/user-management",
  },
  {
    id: AppTab.BADGE_MANAGEMENT,
    label: "Badge Management",
    icon: ChartBarIcon,
    category: TabCategory.ADMIN,
    roles: [UserRole.ADMIN],
    path: "/admin/badge-management",
  },
  {
    id: AppTab.XP_CONFIG_MANAGEMENT,
    label: "XP Config Management",
    icon: StarIcon,
    category: TabCategory.ADMIN,
    roles: [UserRole.ADMIN],
    path: "/admin/xp-config-management",
  },

  // Moderator tabs
  {
    id: AppTab.POST_REVIEW,
    label: "Post Review",
    icon: FilmIcon,
    category: TabCategory.MODERATOR,
    roles: [UserRole.MODERATOR, UserRole.ADMIN],
    path: "/moderator/post-review",
  },
  {
    id: AppTab.REPORTS,
    label: "Reports",
    icon: FlagIcon,
    category: TabCategory.MODERATOR,
    roles: [UserRole.MODERATOR, UserRole.ADMIN],
    path: "/moderator/reports",
  },
];