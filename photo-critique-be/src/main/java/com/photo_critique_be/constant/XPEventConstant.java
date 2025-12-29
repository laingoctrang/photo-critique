package com.photo_critique_be.constant;

public class XPEventConstant {
    private XPEventConstant() {}

    // Event Types
    public static final String POST_CREATED = "POST_CREATED";
    public static final String COMMENT_HELPFUL = "COMMENT_HELPFUL";
    public static final String POST_LIKED = "POST_LIKED";
    public static final String COMMENT_LIKED = "COMMENT_LIKED";
    public static final String BADGE_EARNED = "BADGE_EARNED";
    public static final String FOLLOW_GAINED = "FOLLOW_GAINED";
    public static final String POST_TRENDING = "POST_TRENDING";

    // Categories
    public static final String CATEGORY_POST = "POST";
    public static final String CATEGORY_COMMENT = "COMMENT";
    public static final String CATEGORY_SOCIAL = "SOCIAL";
    public static final String CATEGORY_ACHIEVEMENT = "ACHIEVEMENT";

    // Level System
    // Formula: XP required for level N = XP_PER_LEVEL * N * (N+1) / 2
    public static final int XP_PER_LEVEL = 100;
    public static final int MAX_LEVEL = 30; // Maximum level cap
}