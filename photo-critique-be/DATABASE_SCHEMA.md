# Database Schema - Photo Critique System

Tài liệu này mô tả chi tiết các collections (bảng) trong MongoDB của hệ thống Photo Critique.

---

## 1. Collection: users

**Mô tả**: Lưu thông tin người dùng trong hệ thống

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key (MongoDB ObjectId) |
| `username` | String | ✅ | ✅ Unique | Tên đăng nhập (unique) |
| `email` | String | ✅ | ✅ Unique | Email (unique) |
| `password` | String | ❌ | ❌ | Mật khẩu (hashed) |
| `profile_picture` | String | ❌ | ❌ | URL ảnh đại diện |
| `bio` | String | ❌ | ❌ | Giới thiệu bản thân |
| `full_name` | String | ❌ | ❌ | Họ và tên đầy đủ |
| `is_online` | Boolean | ❌ | ❌ | Trạng thái online (default: false) |
| `last_seen` | Date | ❌ | ❌ | Thời gian online cuối cùng |
| `privacy_setting` | String (Enum) | ❌ | ❌ | Cài đặt riêng tư (PUBLIC/PRIVATE) |
| `xp_points` | Integer | ❌ | ❌ | Điểm XP (default: 0) |
| `level` | Integer | ❌ | ❌ | Level người dùng (default: 1) |
| `badges` | Array<Object> | ❌ | ❌ | Danh sách badges đã đạt được |
| `followers_count` | Integer | ❌ | ❌ | Số lượng người theo dõi (default: 0) |
| `following_count` | Integer | ❌ | ❌ | Số lượng đang theo dõi (default: 0) |
| `roles` | Array<String> | ❌ | ❌ | Vai trò (USER, ADMIN, MODERATOR) |
| `enabled` | Boolean | ❌ | ❌ | Trạng thái kích hoạt (default: true) |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |
| `auth_provider` | String (Enum) | ❌ | ❌ | Provider xác thực (LOCAL/GOOGLE/FACEBOOK) |
| `provider_id` | String | ❌ | ❌ | ID từ provider OAuth |

**Embedded Document**: `badges`
- `badge_id` (String): Reference đến badges collection
- `earned_at` (Date): Thời gian đạt được badge

---

## 2. Collection: posts

**Mô tả**: Lưu thông tin bài đăng

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `user_id` | String | ✅ | ✅ | Reference đến users collection |
| `caption` | String | ❌ | ❌ | Nội dung bài đăng |
| `image_urls` | Array<Object> | ❌ | ❌ | Danh sách hình ảnh |
| `privacy` | String (Enum) | ❌ | ❌ | Quyền riêng tư (PUBLIC/FOLLOWER_ONLY/PRIVATE) |
| `status` | String (Enum) | ❌ | ✅ | Trạng thái (DRAFTED/PENDING_APPROVAL/POSTED/REPORTED/ADMIN_DELETED/VIOLATION/PENDING) |
| `likes_count` | Integer | ❌ | ❌ | Số lượt thích (default: 0) |
| `comments_count` | Integer | ❌ | ❌ | Số lượt bình luận (default: 0) |
| `shares_count` | Integer | ❌ | ❌ | Số lượt chia sẻ (default: 0) |
| `tags` | Array<String> | ❌ | ❌ | Danh sách tags |
| `created_at` | Date | ❌ | ✅ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |
| `original_post_id` | String | ❌ | ❌ | ID bài đăng gốc (khi share) |
| `is_deleted` | Boolean | ❌ | ✅ | Đã xóa chưa (default: false) |
| `deleted_at` | Date | ❌ | ❌ | Thời gian xóa |
| `deleted_by` | String | ❌ | ❌ | Người xóa (user_id hoặc "admin") |

**Compound Indexes**:
- `feed_query`: {user_id: 1, status: 1, privacy: 1, created_at: -1}
- `user_posts`: {user_id: 1, status: 1, created_at: -1}
- `status_query`: {status: 1, created_at: -1}

**Embedded Document**: `image_urls` (ImageInfo)
- `url` (String): URL hình ảnh
- `name` (String): Tên file
- `size` (Long): Kích thước file
- `contentType` (String): Loại file

---

## 3. Collection: follows

**Mô tả**: Lưu thông tin quan hệ follow giữa các người dùng

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `follower_id` | String | ✅ | ✅ | ID người follow (reference users) |
| `following_id` | String | ✅ | ✅ | ID người được follow (reference users) |
| `status` | String (Enum) | ❌ | ❌ | Trạng thái (PENDING/ACCEPTED/REJECTED) |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

**Compound Indexes**:
- `follower_following_unique`: {follower_id: 1, following_id: 1} (unique)
- `follower_status`: {follower_id: 1, status: 1}
- `following_status`: {following_id: 1, status: 1}

---

## 4. Collection: comments

**Mô tả**: Lưu thông tin bình luận trên bài đăng

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `post_id` | String | ✅ | ✅ | Reference đến posts collection |
| `user_id` | String | ✅ | ✅ | Reference đến users collection |
| `content` | String | ❌ | ❌ | Nội dung bình luận |
| `ai_generated_image` | String | ❌ | ❌ | URL ảnh được AI tạo ra |
| `original_image` | String | ❌ | ❌ | URL ảnh gốc |
| `parent_comment_id` | String | ❌ | ❌ | ID bình luận cha (để reply) |
| `is_helpful` | Boolean | ❌ | ❌ | Được đánh dấu hữu ích (default: false) |
| `likes_count` | Integer | ❌ | ❌ | Số lượt like (default: 0) |
| `created_at` | Date | ❌ | ✅ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

**Compound Indexes**:
- `idx_comments_post_created`: {post_id: 1, created_at: 1}
- `idx_comments_post_helpful`: {post_id: 1, is_helpful: -1, created_at: 1}
- `idx_comments_post_likes`: {post_id: 1, likes_count: -1, created_at: 1}
- `idx_comments_parent`: {parent_comment_id: 1, created_at: 1}
- `idx_comments_helpful`: {is_helpful: -1, created_at: -1}

---

## 5. Collection: reactions

**Mô tả**: Lưu thông tin reactions (like, love, etc.) của người dùng

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `user_id` | String | ✅ | ✅ | Reference đến users collection |
| `target_type` | String (Enum) | ❌ | ✅ | Loại đối tượng (POST/COMMENT) |
| `target_id` | String | ❌ | ✅ | ID đối tượng được reaction |
| `reaction_type` | String (Enum) | ❌ | ✅ | Loại reaction (LIKE/LOVE/LAUGH/etc.) |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |

**Compound Indexes**:
- `user_target_unique`: {user_id: 1, target_id: 1, target_type: 1} (unique)
- `target_lookup`: {target_id: 1, target_type: 1}
- `target_reaction_stats`: {target_id: 1, target_type: 1, reaction_type: 1}

---

## 6. Collection: tags

**Mô tả**: Lưu thông tin các tag (thẻ) trong hệ thống

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `name` | String | ✅ | ✅ Unique | Tên tag (unique) |
| `slug` | String | ✅ | ✅ Unique | Slug của tag (unique) |
| `description` | String | ❌ | ❌ | Mô tả tag |
| `post_count` | Long | ❌ | ❌ | Số lượng bài đăng sử dụng tag (default: 0) |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

---

## 7. Collection: messages

**Mô tả**: Lưu thông tin tin nhắn giữa các người dùng

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `conversation_id` | String | ✅ | ✅ | Reference đến conversations collection |
| `sender_id` | String | ✅ | ✅ | Reference đến users collection (người gửi) |
| `receiver_id` | String | ✅ | ✅ | Reference đến users collection (người nhận) |
| `content` | String | ❌ | ❌ | Nội dung tin nhắn |
| `images` | Array<Object> | ❌ | ❌ | Danh sách hình ảnh đính kèm |
| `message_type` | String (Enum) | ❌ | ❌ | Loại tin nhắn (TEXT/IMAGE/etc.) |
| `is_read` | Boolean | ❌ | ❌ | Đã đọc chưa (default: false) |
| `read_at` | Date | ❌ | ❌ | Thời gian đọc |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

**Embedded Document**: `images` (ImageInfo)
- `url` (String): URL hình ảnh
- `name` (String): Tên file
- `size` (Long): Kích thước file
- `contentType` (String): Loại file

---

## 8. Collection: conversations

**Mô tả**: Lưu thông tin cuộc trò chuyện giữa các người dùng

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | ObjectId | ✅ | ✅ | Primary key |
| `participants` | Array<ObjectId> | ❌ | ❌ | Danh sách ID người tham gia |
| `last_message` | Object | ❌ | ❌ | Tin nhắn cuối cùng |
| `unread_count` | Integer | ❌ | ❌ | Số tin nhắn chưa đọc (default: 0) |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

**Embedded Document**: `last_message` (LastMessage)
- `content` (String): Nội dung tin nhắn
- `sent_at` (Date): Thời gian gửi
- `sender_id` (String): ID người gửi

---

## 9. Collection: saved_posts

**Mô tả**: Lưu thông tin các bài đăng đã được lưu bởi người dùng

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `user_id` | String | ✅ | ✅ | Reference đến users collection |
| `post_id` | String | ✅ | ✅ | Reference đến posts collection |
| `saved_at` | Date | ❌ | ❌ | Thời gian lưu |

**Compound Indexes**:
- `user_id_post_id`: {user_id: 1, post_id: 1} (unique)

---

## 10. Collection: shares

**Mô tả**: Lưu thông tin các bài đăng được chia sẻ

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `user_id` | String | ✅ | ✅ | Reference đến users collection |
| `post_id` | String | ✅ | ✅ | Reference đến posts collection (bài đăng share) |
| `original_post_id` | String | ❌ | ❌ | Reference đến posts collection (bài đăng gốc) |
| `caption` | String | ❌ | ❌ | Caption khi share |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

---

## 11. Collection: badges

**Mô tả**: Lưu thông tin các badge (huy hiệu) trong hệ thống

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `name` | String | ❌ | ❌ | Tên badge |
| `description` | String | ❌ | ❌ | Mô tả badge |
| `icon_url` | String | ❌ | ❌ | URL icon của badge |
| `xp_threshold` | Integer | ❌ | ❌ | Ngưỡng XP cần đạt để nhận badge |
| `level` | Integer | ❌ | ❌ | Level của badge |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

---

## 12. Collection: xp_configs

**Mô tả**: Lưu cấu hình điểm XP cho các sự kiện

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `event_type` | String | ❌ | ❌ | Loại sự kiện (tự động generate từ name) |
| `name` | String | ❌ | ❌ | Tên sự kiện |
| `points` | Integer | ❌ | ❌ | Số điểm XP |
| `description` | String | ❌ | ❌ | Mô tả |
| `is_active` | Boolean | ❌ | ❌ | Đang hoạt động (deprecated, dùng status) |
| `status` | String (Enum) | ❌ | ❌ | Trạng thái (PENDING_DEVELOPMENT/IN_DEVELOPMENT/PENDING_APPROVAL/ACTIVE) |
| `category` | String | ❌ | ❌ | Danh mục |
| `version` | Integer | ❌ | ❌ | Phiên bản |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

---

## 13. Collection: xp_events

**Mô tả**: Lưu lịch sử các sự kiện tích lũy XP

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `user_id` | String | ✅ | ✅ | Reference đến users collection |
| `event_type` | String | ❌ | ❌ | Loại sự kiện |
| `points` | Integer | ❌ | ❌ | Số điểm XP |
| `related_post_id` | String | ❌ | ❌ | Reference đến posts collection (nếu liên quan) |
| `related_comment_id` | String | ❌ | ❌ | Reference đến comments collection (nếu liên quan) |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

---

## 14. Collection: notifications

**Mô tả**: Lưu thông tin thông báo cho người dùng

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `user_id` | String | ✅ | ✅ | Reference đến users collection (người nhận) |
| `type` | String (Enum) | ❌ | ❌ | Loại thông báo |
| `related_user_id` | String | ❌ | ❌ | Reference đến users collection (người liên quan) |
| `related_post_id` | String | ❌ | ❌ | Reference đến posts collection |
| `related_comment_id` | String | ❌ | ❌ | Reference đến comments collection |
| `message` | String | ❌ | ❌ | Nội dung thông báo |
| `is_read` | Boolean | ❌ | ❌ | Đã đọc chưa (default: false) |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

---

## 15. Collection: ai_requests

**Mô tả**: Lưu thông tin các yêu cầu AI (ví dụ: tạo ảnh từ prompt)

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `comment_id` | String | ❌ | ❌ | Reference đến comments collection |
| `user_id` | String | ❌ | ❌ | Reference đến users collection |
| `post_id` | String | ❌ | ❌ | Reference đến posts collection |
| `prompt` | String | ❌ | ❌ | Prompt để tạo ảnh |
| `original_image` | String | ❌ | ❌ | URL ảnh gốc |
| `generated_image` | String | ❌ | ❌ | URL ảnh được tạo ra |
| `status` | String (Enum) | ❌ | ❌ | Trạng thái (PENDING/PROCESSING/COMPLETED/FAILED) |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |
| `updated_at` | Date | ❌ | ❌ | Ngày cập nhật |

---

## 16. Collection: ranking_snapshots

**Mô tả**: Lưu snapshot (ảnh chụp) của bảng xếp hạng tại các thời điểm

| Field Name | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `_id` | String | ✅ | ✅ | Primary key |
| `type` | String (Enum) | ❌ | ❌ | Loại ranking (USER_XP/POST_REACTIONS/POST_COMMENTS) |
| `period` | String (Enum) | ❌ | ❌ | Kỳ (WEEK/MONTH/YEAR/ALL) |
| `snapshot_date` | Date | ❌ | ❌ | Ngày chụp snapshot |
| `user_rankings` | Array<Object> | ❌ | ❌ | Danh sách xếp hạng user |
| `post_rankings` | Array<Object> | ❌ | ❌ | Danh sách xếp hạng post |
| `created_at` | Date | ❌ | ❌ | Ngày tạo |

**Compound Indexes**:
- `idx_ranking_lookup`: {type: 1, period: 1, snapshot_date: -1}
- `idx_ranking_date`: {snapshot_date: -1}

**Embedded Documents**:

**user_rankings** (UserRankingItem):
- `user_id` (String): Reference đến users
- `username` (String): Tên người dùng
- `profile_picture` (String): Ảnh đại diện
- `xp_points` (Integer): Điểm XP
- `level` (Integer): Level
- `rank` (Integer): Thứ hạng

**post_rankings** (PostRankingItem):
- `post_id` (String): Reference đến posts
- `user_id` (String): Reference đến users
- `username` (String): Tên người đăng
- `caption` (String): Caption bài đăng
- `image_urls` (Array<String>): Danh sách ảnh
- `reactions_count` (Integer): Số reactions
- `comments_count` (Integer): Số comments
- `rank` (Integer): Thứ hạng

---

## Tổng kết

### Thống kê Collections

| STT | Collection Name | Số Fields | Mô tả |
|-----|----------------|-----------|-------|
| 1 | users | 21 | Thông tin người dùng |
| 2 | posts | 16 | Bài đăng |
| 3 | follows | 6 | Quan hệ follow |
| 4 | comments | 11 | Bình luận |
| 5 | reactions | 6 | Reactions (like, love, etc.) |
| 6 | tags | 7 | Tags/Thẻ |
| 7 | messages | 11 | Tin nhắn |
| 8 | conversations | 6 | Cuộc trò chuyện |
| 9 | saved_posts | 4 | Bài đăng đã lưu |
| 10 | shares | 7 | Bài đăng được chia sẻ |
| 11 | badges | 8 | Huy hiệu |
| 12 | xp_configs | 11 | Cấu hình XP |
| 13 | xp_events | 8 | Lịch sử sự kiện XP |
| 14 | notifications | 10 | Thông báo |
| 15 | ai_requests | 10 | Yêu cầu AI |
| 16 | ranking_snapshots | 7 | Snapshot bảng xếp hạng |
| **TỔNG** | **16 collections** | **145 fields** | - |

### Các kiểu dữ liệu chính

- **String**: Văn bản, ID
- **Integer/Number**: Số nguyên, điểm số, đếm
- **Boolean**: Giá trị true/false
- **Date/LocalDateTime**: Ngày tháng, thời gian
- **Array**: Danh sách, mảng
- **Object**: Đối tượng embedded
- **ObjectId**: MongoDB ObjectId (đặc biệt cho conversations)

### Các Enum Types

- **PrivacyType**: PUBLIC, PRIVATE, FOLLOWER_ONLY
- **PostStatus**: DRAFTED, PENDING_APPROVAL, POSTED, REPORTED, ADMIN_DELETED, VIOLATION, PENDING
- **FollowStatus**: PENDING, ACCEPTED, REJECTED
- **ReactionTargetType**: POST, COMMENT
- **ReactionType**: LIKE, LOVE, LAUGH, etc.
- **MessageType**: TEXT, IMAGE, etc.
- **NotificationType**: Various notification types
- **XPConfigStatus**: PENDING_DEVELOPMENT, IN_DEVELOPMENT, PENDING_APPROVAL, ACTIVE
- **RankingType**: USER_XP, POST_REACTIONS, POST_COMMENTS
- **RankingPeriod**: WEEK, MONTH, YEAR, ALL
- **Role**: USER, ADMIN, MODERATOR, SUPER_ADMIN
- **AuthProvider**: LOCAL, GOOGLE, FACEBOOK
- **AIRequestStatus**: PENDING, PROCESSING, COMPLETED, FAILED





