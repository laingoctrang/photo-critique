package com.photo_critique_be.enums;

public enum PostStatus {
    DRAFTED,           // Đang soạn nháp
    PENDING_APPROVAL,  // Chờ duyệt
    POSTED,            // Đã đăng
    REPORTED,          // Bị báo cáo
    ADMIN_DELETED,     // Bị admin xóa
    VIOLATION,         // Vi phạm
    PENDING            // Đang chờ (tương đương với POSTED nhưng có thể dùng để phân biệt)
}

