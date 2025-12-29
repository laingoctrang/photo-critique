package com.photo_critique_be.enums;

import lombok.Getter;

@Getter
public enum MessageCode {
    // AUTH
    AUTH_REGISTER_SUCCESS("auth.register.success"),
    AUTH_LOGIN_SUCCESS("auth.login.success"),
    AUTH_LOGOUT_SUCCESS("auth.logout.success"),
    AUTH_PASSWORD_RESET_SUCCESS("auth.password.reset.success"),
    AUTH_PROFILE_UPDATED("auth.profile.updated"),

    AUTH_INVALID_CREDENTIALS("auth.invalid.credentials"),
    AUTH_ACCOUNT_DEACTIVATED("auth.account.deactivated"),
    AUTH_EMAIL_EXISTS("auth.email.exists"),
    AUTH_USERNAME_EXISTS("auth.username.exists"),
    AUTH_TOKEN_EXPIRED("auth.token.expired"),
    AUTH_RESET_TOKEN_INVALID("auth.reset.token.invalid"),
    AUTH_INSUFFICIENT_PERMISSIONS("auth.insufficient.permissions"),
    AUTH_UNAUTHORIZED("auth.unauthorized"),
    AUTH_OAUTH_URL_GENERATED("auth.oauth.url.generated"),
    AUTH_OAUTH_PROVIDER_MISMATCH("auth.oauth.provider.mismatch"),
    AUTH_OAUTH_CANCELLED("auth.oauth.cancelled"),

    OTP_REGISTER_SEND_SUCCESS("otp.register.send.success"),
    OTP_REGISTER_VERIFY_SUCCESS("otp.register.verify.success"),
    OTP_REGISTER_VERIFY_FAILED("otp.register.verify.failed"),
    OTP_FORGOT_PASSWORD_SEND_SUCCESS("otp.forgotpassword.send.success"),
    OTP_FORGOT_PASSWORD_VERIFY_SUCCESS("otp.forgotpassword.verify.success"),
    OTP_FORGOT_PASSWORD_VERIFY_FAILED("otp.forgotpassword.verify.failed"),

    // VALIDATION
    VALIDATION_EMAIL_REQUIRED("validation.email.required"),
    VALIDATION_EMAIL_INVALID("validation.email.invalid"),
    VALIDATION_PASSWORD_REQUIRED("validation.password.required"),
    VALIDATION_PASSWORD_MIN_LENGTH("validation.password.min.length"),
    VALIDATION_FULLNAME_REQUIRED("validation.fullname.required"),
    VALIDATION_USERNAME_INVALID("validation.username.invalid"),

    // OTP
    OTP_SEND_SUCCESS("otp.send.success"),
    OTP_SEND_FAILED("otp.send.failed"),
    OTP_EMAIL_SUBJECT("otp.email.subject"),
    OTP_RESEND_SUCCESS("otp.resend.success"),
    OTP_VERIFICATION_SUCCESS("otp.verification.success"),
    OTP_VERIFICATION_FAILED("otp.verification.failed"),
    OTP_INVALID("otp.invalid"),
    OTP_EXPIRED("otp.expired"),
    OTP_NOT_FOUND("otp.not.found"),
    OTP_RATE_LIMIT_EXCEEDED("otp.rate.limit.exceeded"),
    OTP_MAX_ATTEMPTS_EXCEEDED("otp.max.attempts.exceeded"),

    // USER
    USER_GET_ME_SUCCESS("user.get.me.success"),
    USER_GET_ME_FAILED("user.get.me.failed"),
    USER_NOT_FOUND("user.not.found"),
    USER_PROFILE_UPDATED("user.profile.updated"),
    USER_PROFILE_PRIVATE("user.profile.private"),
    USER_ALREADY_FOLLOWING("user.already.following"),
    USER_NOT_FOLLOWING("user.not.following"),
    USER_CANNOT_FOLLOW_SELF("user.cannot.follow.self"),
    USER_CANNOT_UNFOLLOW("user.cannot.unfollow"),
    USER_FOLLOW_REQUEST_PENDING("user.follow.request.pending"),
    USER_BLOCKED("user.blocked"),
    USER_FOLLOWED_SUCCESS("user.followed.success"),
    USER_UNFOLLOWED_SUCCESS("user.unfollowed.success"),
    FOLLOW_REQUEST_NOT_FOUND("follow.request.not.found"),
    FOLLOW_REQUEST_ACCEPTED("follow.request.accepted"),
    FOLLOW_REQUEST_REJECTED("follow.request.rejected"),
    FOLLOW_REQUEST_ALREADY_PROCESSED("follow.request.already.processed"),
    USER_ONLINE_STATUS_UPDATED("user.online.status.updated"),
    USER_PROFILE_RETRIEVED("user.profile.retrieved"),
    USER_FOLLOWERS_RETRIEVED("user.followers.retrieved"),
    USER_FOLLOWING_RETRIEVED("user.following.retrieved"),
    USER_FOLLOW_REQUESTS_RETRIEVED("user.follow.requests.retrieved"),
    USER_LIST_RETRIEVED("user.list.retrieved"),
    USER_RETRIEVED("user.retrieved"),
    USER_ENABLED("user.enabled"),
    USER_DISABLED("user.disabled"),
    USER_ROLE_UPDATED("user.role.updated"),
    USER_DELETED("user.deleted"),
    USER_CANNOT_MODIFY_SELF("user.cannot.modify.self"),

    // FILE
    FILE_UPLOAD_SUCCESS("file.upload.success"),
    FILE_UPLOAD_FAILED("file.upload.failed"),
    FILE_DELETE_SUCCESS("file.delete.success"),

    // BADGE
    BADGE_NOT_FOUND("badge.not.found"),
    BADGE_RETRIEVED("badge.retrieved"),
    BADGE_CREATED("badge.created"),
    BADGE_UPDATED("badge.updated"),
    BADGE_DELETED("badge.deleted"),

    // TAG
    TAG_CREATED_SUCCESS("tag.created.success"),
    TAG_UPDATED_SUCCESS("tag.updated.success"),
    TAG_DELETED_SUCCESS("tag.deleted.success"),
    TAG_GET_SUCCESS("tag.get.success"),
    TAG_LIST_SUCCESS("tag.list.success"),
    TAG_SEARCH_SUCCESS("tag.search.success"),
    TAG_TRENDING_SUCCESS("tag.trending.success"),
    TAG_NOT_FOUND("tag.not.found"),

    // POST
    POST_CREATED_SUCCESS("post.created.success"),
    POST_UPDATED_SUCCESS("post.updated.success"),
    POST_DELETED_SUCCESS("post.deleted.success"),
    POST_GET_SUCCESS("post.get.success"),
    POST_NOT_FOUND("post.not.found"),
    POST_UPDATE_UNAUTHORIZED("post.update.unauthorized"),
    POST_DELETE_UNAUTHORIZED("post.delete.unauthorized"),
    POST_VIEW_UNAUTHORIZED("post.view.unauthorized"),
    POST_FEED_SUCCESS("post.feed.success"),
    POST_SAVED_SUCCESS("post.saved.success"),
    POST_UNSAVED_SUCCESS("post.unsaved.success"),
    POST_SAVED_GET_SUCCESS("post.saved.get.success"),
    POST_ALREADY_SAVED("post.already.saved"),
    POST_NOT_SAVED("post.not.saved"),
    POST_REACTION_ADDED("post.reaction.added"),
    POST_REACTION_REMOVED("post.reaction.removed"),
    POST_SHARED_SUCCESS("post.shared.success"),

    POST_SOFT_DELETED_SUCCESS("post.soft.deleted.success"),
    POST_RESTORED_SUCCESS("post.restored.success"),
    POST_ALREADY_DELETED("post.already.deleted"),
    POST_NOT_DELETED("post.not.deleted"),
    POST_CLEANUP_JOB_STARTED("post.cleanup.job.started"),
    POST_CLEANUP_JOB_COMPLETED("post.cleanup.job.completed"),
    POST_DELETED_GET_SUCCESS("post.deleted.get.success"),

    // COMMENT
    COMMENT_CREATED_SUCCESS("comment.created.success"),
    COMMENT_UPDATED_SUCCESS("comment.updated.success"),
    COMMENT_DELETED_SUCCESS("comment.deleted.success"),
    COMMENT_GET_SUCCESS("comment.get.success"),
    COMMENT_NOT_FOUND("comment.not.found"),
    COMMENT_UPDATE_UNAUTHORIZED("comment.update.unauthorized"),
    COMMENT_DELETE_UNAUTHORIZED("comment.delete.unauthorized"),
    COMMENT_MARK_HELPFUL_UNAUTHORIZED("comment.mark.helpful.unauthorized"),
    COMMENT_ALREADY_HELPFUL("comment.already.helpful"),
    COMMENT_MARKED_HELPFUL("comment.marked.helpful"),
    COMMENT_LIKED("comment.liked"),
    COMMENT_UNLIKED("comment.unliked"),
    COMMENT_AI_NOT_ALLOWED_FOR_REPLY("comment.ai.not.allowed.for.reply"),
    COMMENT_PARENT_MISMATCH("comment.parent.mismatch"),

    // REACT
    REACTION_NOT_FOUND("reaction.not.found"),
    REACTION_ALREADY_EXISTS("reaction.already.exists"),
    REACTION_ADDED_SUCCESS("reaction.added.success"),
    REACTION_REMOVED_SUCCESS("reaction.removed.success"),

    // NOTIFICATION
    NOTIFICATION_NOT_FOUND("notification.not.found"),

    // XP
    XP_AWARDED_SUCCESS("xp.awarded.success"),
    XP_AWARDED_FAILED("xp.awarded.failed"),
    XP_CONFIG_NOT_FOUND("xp.config.not.found"),
    XP_CONFIG_CREATED("xp.config.created"),
    XP_CONFIG_UPDATED("xp.config.updated"),
    XP_CONFIG_DELETED("xp.config.deleted"),
    XP_CONFIG_RETRIEVED("xp.config.retrieved"),
    XP_EVENT_RETRIEVED("xp.event.retrieved"),

    // IMAGE GENERATION HISTORY
    IMAGE_GENERATION_HISTORY_CREATED_SUCCESS("image.generation.history.created.success"),
    IMAGE_GENERATION_HISTORY_GET_SUCCESS("image.generation.history.get.success"),
    IMAGE_GENERATION_HISTORY_DELETED_SUCCESS("image.generation.history.deleted.success"),
    IMAGE_GENERATION_HISTORY_NOT_FOUND("image.generation.history.not.found"),

    // REPORT
    REPORT_CREATED_SUCCESS("report.created.success"),
    REPORT_GET_SUCCESS("report.get.success"),
    REPORT_NOT_FOUND("report.not.found"),
    REPORT_ALREADY_EXISTS("report.already.exists"),
    REPORT_CANNOT_REPORT_OWN_CONTENT("report.cannot.report.own.content"),
    REPORT_RESOLVED_SUCCESS("report.resolved.success"),
    REPORT_DISMISSED_SUCCESS("report.dismissed.success"),
    REPORT_ALREADY_PROCESSED("report.already.processed"),
    REPORT_LIST_SUCCESS("report.list.success");

    private final String code;

    MessageCode(String code) {
        this.code = code;
    }
}
