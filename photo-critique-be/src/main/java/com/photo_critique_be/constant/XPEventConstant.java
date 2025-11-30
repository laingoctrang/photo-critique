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
}