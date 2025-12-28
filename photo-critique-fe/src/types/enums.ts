export const UserRole = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const AppTab = {
  // Common tabs
  HOME: 'home',
  FEED: 'feed',
  EXPLORE: 'explore',
  RANKING: 'ranking',
  DIRECT: 'direct',
  PROFILE: 'profile',
  CREATE: 'create',
  AI_EDIT: 'ai-edit',

  // Admin tabs
  ADMIN_DASHBOARD: 'dashboard',
  USER_MANAGEMENT: 'user-management',
  POST_MANAGEMENT: 'post-management',
  BADGE_MANAGEMENT: 'badge-management',
  XP_CONFIG_MANAGEMENT: 'xp-config-management',
  CONTENT_MODERATION: 'content-moderation',
  ANALYTICS: 'analytics',
  SYSTEM_SETTINGS: 'system-settings',

  // Moderator tabs
  MOD_DASHBOARD: 'mod-dashboard',
  POST_REVIEW: 'post-review',
  REPORTS: 'reports',
} as const;
export type AppTab = typeof AppTab[keyof typeof AppTab];

export const TabCategory = {
  MAIN: 'main',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;
export type TabCategory = typeof TabCategory[keyof typeof TabCategory];

export interface MenuItem {
  id: AppTab;
  label: string;
  icon: React.ElementType;
  category: TabCategory;
  roles: UserRole[];
  path: string;
};

export const OtpRequestType = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;
export type OtpRequestType = typeof OtpRequestType[keyof typeof OtpRequestType];

export const PrivacyType = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  FOLLOWER_ONLY: 'FOLLOWER_ONLY',
} as const;
export type PrivacyType = typeof PrivacyType[keyof typeof PrivacyType];

export const ReactionType = {
  LIKE: 'LIKE',
  LOVE: 'LOVE',
  HAHA: 'HAHA',
  WOW: 'WOW',
  SAD: 'SAD',
  ANGRY: 'ANGRY',
} as const;
export type ReactionType = typeof ReactionType[keyof typeof ReactionType];

export const ReactionTargetType =  {
    POST: 'POST',
    COMMENT: 'COMMENT',
    MESSAGE: 'MESSAGE'
} as const;
export type ReactionTargetType = typeof ReactionTargetType[keyof typeof ReactionTargetType];

export const PostStatus = {
  DRAFTED: 'DRAFTED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  POSTED: 'POSTED',
  REPORTED: 'REPORTED',
  ADMIN_DELETED: 'ADMIN_DELETED',
  VIOLATION: 'VIOLATION',
  PENDING: 'PENDING',
} as const;
export type PostStatus = typeof PostStatus[keyof typeof PostStatus];

export const ReportStatus = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
} as const;
export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export const ReportContentType = {
  POST: 'POST',
  COMMENT: 'COMMENT',
} as const;
export type ReportContentType = typeof ReportContentType[keyof typeof ReportContentType];