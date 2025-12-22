# Đặc tả Use Cases - Photo Critique System

## 1. Tổng quan Use Cases

Hệ thống Photo Critique được thiết kế để hỗ trợ cộng đồng nhiếp ảnh chia sẻ, phê bình và học hỏi. Dưới đây là tổng quan các use case theo từng vai trò người dùng (Actor).

### 1.1. Actors trong hệ thống

- **USER**: Người dùng thông thường
- **ADMIN**: Quản trị viên (có tất cả quyền của USER + các quyền quản trị)
- **MODERATOR**: Người kiểm duyệt (chưa được implement)
- **SUPER_ADMIN**: Siêu quản trị viên (chưa được sử dụng)

### 1.2. Danh sách Use Cases theo Actor

#### 1.2.1. ROLE: USER

**1.1. Quản lý tài khoản và xác thực**
- UC-USER-001: Đăng ký tài khoản mới
- UC-USER-002: Đăng nhập bằng email/mật khẩu
- UC-USER-003: Đăng nhập bằng OAuth (Google/Facebook)
- UC-USER-004: Quên mật khẩu
- UC-USER-005: Gửi lại OTP

**1.2. Quản lý hồ sơ cá nhân**
- UC-USER-006: Xem hồ sơ cá nhân
- UC-USER-007: Cập nhật hồ sơ cá nhân
- UC-USER-008: Xem hồ sơ người dùng khác
- UC-USER-009: Quản lý trạng thái online

**1.3. Quản lý kết nối người dùng (Follow/Unfollow)**
- UC-USER-010: Theo dõi người dùng
- UC-USER-011: Hủy theo dõi người dùng
- UC-USER-012: Hủy yêu cầu follow đang pending
- UC-USER-013: Xem danh sách người đang theo dõi mình (Followers)
- UC-USER-014: Xem danh sách người mình đang theo dõi (Following)
- UC-USER-015: Xem danh sách yêu cầu follow
- UC-USER-016: Chấp nhận yêu cầu follow
- UC-USER-017: Từ chối yêu cầu follow

**1.4. Quản lý bài đăng (Posts)**
- UC-USER-018: Tạo bài đăng mới
- UC-USER-019: Lưu bài đăng dạng nháp (Draft)
- UC-USER-020: Xem danh sách bài đăng nháp
- UC-USER-021: Chỉnh sửa bài đăng nháp
- UC-USER-022: Cập nhật bài đăng
- UC-USER-023: Xóa bài đăng (Soft Delete)
- UC-USER-024: Khôi phục bài đăng đã xóa
- UC-USER-025: Xem chi tiết bài đăng
- UC-USER-026: Xem Feed (Trang chủ)
- UC-USER-027: Xem bài đăng của người dùng khác
- UC-USER-028: Xem bài đăng của chính mình
- UC-USER-029: Lưu bài đăng (Save Post)
- UC-USER-030: Bỏ lưu bài đăng
- UC-USER-031: Xem danh sách bài đăng đã lưu
- UC-USER-032: Chia sẻ bài đăng (Share Post)

**1.5. Tương tác với bài đăng (Reactions)**
- UC-USER-033: Thêm reaction vào bài đăng
- UC-USER-034: Xóa reaction khỏi bài đăng

**1.6. Quản lý bình luận (Comments)**
- UC-USER-035: Tạo bình luận
- UC-USER-036: Xem danh sách bình luận
- UC-USER-037: Cập nhật bình luận
- UC-USER-038: Xóa bình luận
- UC-USER-039: Like bình luận
- UC-USER-040: Unlike bình luận
- UC-USER-041: Đánh dấu bình luận hữu ích

**1.7. Tin nhắn và trò chuyện (Messages/Chat)**
- UC-USER-042: Xem danh sách cuộc trò chuyện
- UC-USER-043: Xem/tạo cuộc trò chuyện với người dùng
- UC-USER-044: Xem tin nhắn trong cuộc trò chuyện
- UC-USER-045: Gửi tin nhắn
- UC-USER-046: Đánh dấu tin nhắn đã đọc

**1.8. Quản lý thẻ (Tags)**
- UC-USER-047: Xem danh sách thẻ phổ biến (Trending Tags)
- UC-USER-048: Tìm kiếm thẻ
- UC-USER-049: Xem thông tin chi tiết thẻ
- UC-USER-050: Tạo thẻ mới

**1.9. Ranking và Leaderboard**
- UC-USER-051: Xem bảng xếp hạng người dùng theo XP
- UC-USER-052: Xem bảng xếp hạng bài đăng theo reactions
- UC-USER-053: Xem bảng xếp hạng bài đăng theo comments

**1.10. Quản lý file và upload**
- UC-USER-054: Upload hình ảnh
- UC-USER-055: Xóa file đã upload

**1.11. Hệ thống XP và Badge**
- UC-USER-056: Xem lịch sử XP Events
- UC-USER-057: Xem tổng số XP và level
- UC-USER-058: Xem danh sách badges đã đạt được

#### 1.2.2. ROLE: ADMIN

**Lưu ý**: ADMIN có tất cả các use case của USER (UC-USER-001 đến UC-USER-058), cộng thêm các use case riêng sau:

**2.1. Quản lý Badge**
- UC-ADMIN-001: Xem danh sách Badge (có filter, pagination)
- UC-ADMIN-002: Xem chi tiết Badge
- UC-ADMIN-003: Tạo Badge mới
- UC-ADMIN-004: Cập nhật Badge
- UC-ADMIN-005: Xóa Badge

**2.2. Quản lý XP Configuration**
- UC-ADMIN-006: Xem danh sách XP Config (có filter, pagination)
- UC-ADMIN-007: Xem chi tiết XP Config
- UC-ADMIN-008: Tạo/Cập nhật XP Config
- UC-ADMIN-009: Cập nhật điểm XP
- UC-ADMIN-010: Xóa XP Config

**2.3. Quản lý bài đăng (Admin)**
- UC-ADMIN-011: Xem danh sách bài đăng đã bị xóa
- UC-ADMIN-012: Khôi phục bài đăng đã xóa

**2.4. Dashboard quản trị**
- UC-ADMIN-013: Xem Dashboard quản trị

#### 1.2.3. ROLE: MODERATOR

**Lưu ý**: Role MODERATOR hiện tại chưa được implement trong hệ thống. Có thể phát triển sau với các chức năng như:
- Kiểm duyệt nội dung bài đăng và bình luận
- Xử lý báo cáo vi phạm
- Quản lý nội dung không phù hợp

#### 1.2.4. ROLE: SUPER_ADMIN

**Lưu ý**: Role SUPER_ADMIN hiện chưa được sử dụng, sẽ phát triển sau.

### 1.3. Thống kê Use Cases

| Role | Số lượng Use Cases riêng | Tổng số Use Cases (bao gồm kế thừa) |
|------|-------------------------|-------------------------------------|
| USER | 58 | 58 |
| ADMIN | 13 | 71 (58 USER + 13 ADMIN) |
| MODERATOR | 0 | 0 (chưa implement) |
| SUPER_ADMIN | 0 | 0 (chưa sử dụng) |
| **TỔNG** | **71** | **71** |

---

## 2. Đặc tả chi tiết Use Cases

---

## 2.1. ROLE: USER (Người dùng thông thường)

### 1.1. Quản lý tài khoản và xác thực

#### UC-USER-001: Đăng ký tài khoản mới
- **Mô tả**: Người dùng đăng ký tài khoản bằng email và mật khẩu
- **Luồng thực hiện**:
  1. Người dùng điền thông tin (email, username, password, fullName)
  2. Hệ thống gửi OTP qua email
  3. Người dùng nhập OTP để xác minh
  4. Tài khoản được kích hoạt và tự động đăng nhập
- **API**: `POST /api/auth/register`, `POST /api/auth/verify-registration`

#### UC-USER-002: Đăng nhập bằng email/mật khẩu
- **Mô tả**: Người dùng đăng nhập với email và mật khẩu
- **Luồng thực hiện**:
  1. Người dùng nhập email và mật khẩu
  2. Hệ thống xác thực và trả về JWT token
  3. Người dùng được đăng nhập vào hệ thống
- **API**: `POST /api/auth/login`

#### UC-USER-003: Đăng nhập bằng OAuth (Google/Facebook)
- **Mô tả**: Người dùng đăng nhập thông qua tài khoản mạng xã hội
- **Luồng thực hiện**:
  1. Người dùng chọn đăng nhập bằng Google/Facebook
  2. Hệ thống lấy authorization URL từ OAuth provider
  3. Người dùng xác thực trên nền tảng OAuth
  4. OAuth provider trả về code
  5. Hệ thống xử lý callback và tạo/đăng nhập tài khoản
- **API**: `GET /api/oauth/authorize/{provider}`, `GET /api/oauth/callback/{provider}`

#### UC-USER-004: Quên mật khẩu
- **Mô tả**: Người dùng yêu cầu reset mật khẩu khi quên
- **Luồng thực hiện**:
  1. Người dùng nhập email
  2. Hệ thống gửi OTP qua email
  3. Người dùng nhập OTP và mật khẩu mới
  4. Mật khẩu được cập nhật
- **API**: `POST /api/auth/forgot-password`, `POST /api/auth/verify-reset-otp`, `POST /api/auth/reset-password`

#### UC-USER-005: Gửi lại OTP
- **Mô tả**: Người dùng yêu cầu gửi lại mã OTP
- **API**: `POST /api/auth/resend-otp`

### 1.2. Quản lý hồ sơ cá nhân

#### UC-USER-006: Xem hồ sơ cá nhân
- **Mô tả**: Người dùng xem thông tin hồ sơ của chính mình
- **Thông tin hiển thị**: Username, fullName, avatar, bio, XP points, level, badges, số lượng followers/following, posts
- **API**: `GET /api/users/me`

#### UC-USER-007: Cập nhật hồ sơ cá nhân
- **Mô tả**: Người dùng chỉnh sửa thông tin hồ sơ
- **Thông tin có thể cập nhật**: Avatar, fullName, bio, privacy setting (PUBLIC/PRIVATE)
- **API**: `PUT /api/users/me`

#### UC-USER-008: Xem hồ sơ người dùng khác
- **Mô tả**: Người dùng xem hồ sơ của người dùng khác
- **Quyền truy cập**:
  - Public profile: Tất cả người dùng có thể xem thông tin cơ bản
  - Private profile: Chỉ người dùng đã follow và được chấp nhận mới xem đầy đủ
  - Thông tin cơ bản luôn hiển thị: username, email, fullName, avatar
- **API**: `GET /api/users/username/{username}`, `GET /api/users/{userId}`

#### UC-USER-009: Quản lý trạng thái online
- **Mô tả**: Người dùng cập nhật trạng thái online/offline
- **API**: `PUT /api/users/me/online-status`

### 1.3. Quản lý quan hệ (Follow/Unfollow)

#### UC-USER-010: Theo dõi người dùng
- **Mô tả**: Người dùng theo dõi người dùng khác
- **Luồng thực hiện**:
  - Nếu người dùng có profile PUBLIC: Follow request được chấp nhận ngay
  - Nếu người dùng có profile PRIVATE: Follow request ở trạng thái PENDING, chờ chấp nhận
- **API**: `POST /api/users/follow/{userId}`

#### UC-USER-011: Hủy theo dõi người dùng
- **Mô tả**: Người dùng hủy theo dõi người đã follow
- **API**: `DELETE /api/users/follow/{userId}`

#### UC-USER-012: Hủy yêu cầu follow đang pending
- **Mô tả**: Người dùng hủy yêu cầu follow đang chờ chấp nhận
- **Luồng**: Khi yêu cầu follow ở trạng thái PENDING, ấn lại nút follow sẽ hủy yêu cầu
- **API**: `POST /api/users/follow/{userId}` (với status PENDING)

#### UC-USER-013: Xem danh sách người đang theo dõi mình (Followers)
- **Mô tả**: Người dùng xem danh sách những người đang follow mình
- **API**: `GET /api/users/{userId}/followers`

#### UC-USER-014: Xem danh sách người mình đang theo dõi (Following)
- **Mô tả**: Người dùng xem danh sách những người mình đang follow
- **API**: `GET /api/users/{userId}/following`

#### UC-USER-015: Xem danh sách yêu cầu follow
- **Mô tả**: Người dùng có profile PRIVATE xem các yêu cầu follow đang chờ xử lý
- **API**: `GET /api/users/me/follow-requests`

#### UC-USER-016: Chấp nhận yêu cầu follow
- **Mô tả**: Người dùng chấp nhận yêu cầu follow từ người khác
- **API**: `POST /api/users/follow-requests/{followerId}/accept`

#### UC-USER-017: Từ chối yêu cầu follow
- **Mô tả**: Người dùng từ chối yêu cầu follow từ người khác
- **API**: `POST /api/users/follow-requests/{followerId}/reject`

### 1.4. Quản lý bài đăng (Posts)

#### UC-USER-018: Tạo bài đăng mới
- **Mô tả**: Người dùng tạo bài đăng mới với hình ảnh và caption
- **Luồng thực hiện**:
  1. Người dùng upload một hoặc nhiều hình ảnh
  2. Hệ thống kiểm duyệt hình ảnh (moderation)
  3. Người dùng thêm caption, tags, chọn privacy (PUBLIC/FOLLOWER_ONLY/PRIVATE)
  4. Người dùng chọn đăng ngay hoặc lưu draft
  5. Nếu đăng ngay: Bài đăng được tạo với status POSTED
  6. Nếu lưu draft: Bài đăng được tạo với status DRAFTED
- **API**: `POST /api/posts`

#### UC-USER-019: Lưu bài đăng dạng nháp (Draft)
- **Mô tả**: Người dùng lưu bài đăng dạng nháp để chỉnh sửa sau
- **Luồng**: Tương tự UC-USER-018 nhưng với status DRAFTED
- **API**: `POST /api/posts` (với status: "DRAFTED")

#### UC-USER-020: Xem danh sách bài đăng nháp
- **Mô tả**: Người dùng xem danh sách các bài đăng đã lưu nháp
- **API**: `GET /api/posts/me/drafts`

#### UC-USER-021: Chỉnh sửa bài đăng nháp
- **Mô tả**: Người dùng chỉnh sửa bài đăng nháp
- **Luồng**:
  1. Người dùng click vào draft post trong tab "Drafted"
  2. Hệ thống điều hướng đến trang create với postId
  3. Form được điền sẵn dữ liệu của draft
  4. Người dùng chỉnh sửa và lưu hoặc đăng
- **API**: `GET /api/posts/{postId}`, `PUT /api/posts/{postId}`

#### UC-USER-022: Cập nhật bài đăng
- **Mô tả**: Người dùng cập nhật nội dung bài đăng (caption, privacy, tags, status)
- **Luồng**: Có thể cập nhật draft thành POSTED hoặc cập nhật bài đã đăng
- **API**: `PUT /api/posts/{postId}`

#### UC-USER-023: Xóa bài đăng (Soft Delete)
- **Mô tả**: Người dùng xóa bài đăng của mình (soft delete)
- **API**: `DELETE /api/posts/{postId}`

#### UC-USER-024: Khôi phục bài đăng đã xóa
- **Mô tả**: Người dùng khôi phục bài đăng đã bị xóa
- **API**: `POST /api/posts/{postId}/restore`

#### UC-USER-025: Xem chi tiết bài đăng
- **Mô tả**: Người dùng xem chi tiết một bài đăng
- **Quyền truy cập**: Tùy thuộc vào privacy setting của bài đăng
- **API**: `GET /api/posts/{postId}`

#### UC-USER-026: Xem Feed (Trang chủ)
- **Mô tả**: Người dùng xem feed các bài đăng từ người đang follow và bài đăng PUBLIC
- **Luồng**: 
  - Hiển thị bài đăng từ người đang follow (PUBLIC, FOLLOWER_ONLY)
  - Hiển thị bài đăng PUBLIC từ tất cả người dùng
  - Chỉ hiển thị bài đăng có status POSTED
- **API**: `GET /api/posts/feed`

#### UC-USER-027: Xem bài đăng của người dùng khác
- **Mô tả**: Người dùng xem danh sách bài đăng của một người dùng
- **Quyền truy cập**: Tùy thuộc vào privacy setting của từng bài đăng
- **API**: `GET /api/posts/user/{userId}`

#### UC-USER-028: Xem bài đăng của chính mình
- **Mô tả**: Người dùng xem danh sách bài đăng của chính mình (trừ draft)
- **API**: `GET /api/posts/me`

#### UC-USER-029: Lưu bài đăng (Save Post)
- **Mô tả**: Người dùng lưu bài đăng để xem lại sau
- **API**: `POST /api/posts/{postId}/save`

#### UC-USER-030: Bỏ lưu bài đăng
- **Mô tả**: Người dùng xóa bài đăng khỏi danh sách đã lưu
- **API**: `DELETE /api/posts/{postId}/save`

#### UC-USER-031: Xem danh sách bài đăng đã lưu
- **Mô tả**: Người dùng xem danh sách các bài đăng đã lưu
- **API**: `GET /api/posts/saved`

#### UC-USER-032: Chia sẻ bài đăng (Share Post)
- **Mô tả**: Người dùng chia sẻ bài đăng của người khác với caption
- **Luồng**: Tạo một bài đăng mới với originalPostId trỏ đến bài đăng gốc
- **API**: `POST /api/posts/{postId}/share`

### 1.5. Tương tác với bài đăng (Reactions)

#### UC-USER-033: Thêm reaction vào bài đăng
- **Mô tả**: Người dùng thêm reaction (like, love, etc.) vào bài đăng
- **Luồng**: 
  - Nếu đã có reaction, thay đổi loại reaction
  - Nếu chưa có, tạo mới reaction
- **API**: `POST /api/posts/{postId}/reaction`

#### UC-USER-034: Xóa reaction khỏi bài đăng
- **Mô tả**: Người dùng xóa reaction đã thêm
- **API**: `DELETE /api/posts/{postId}/reaction`

### 1.6. Quản lý bình luận (Comments)

#### UC-USER-035: Tạo bình luận
- **Mô tả**: Người dùng thêm bình luận vào bài đăng
- **Luồng**: Hệ thống kiểm duyệt nội dung bình luận trước khi hiển thị
- **API**: `POST /api/posts/{postId}/comments`

#### UC-USER-036: Xem danh sách bình luận
- **Mô tả**: Người dùng xem các bình luận của một bài đăng
- **API**: `GET /api/posts/{postId}/comments`

#### UC-USER-037: Cập nhật bình luận
- **Mô tả**: Người dùng chỉnh sửa bình luận của mình
- **API**: `PUT /api/posts/{postId}/comments/{commentId}`

#### UC-USER-038: Xóa bình luận
- **Mô tả**: Người dùng xóa bình luận của mình
- **API**: `DELETE /api/posts/{postId}/comments/{commentId}`

#### UC-USER-039: Like bình luận
- **Mô tả**: Người dùng like một bình luận
- **API**: `POST /api/posts/{postId}/comments/{commentId}/like`

#### UC-USER-040: Unlike bình luận
- **Mô tả**: Người dùng bỏ like một bình luận
- **API**: `DELETE /api/posts/{postId}/comments/{commentId}/like`

#### UC-USER-041: Đánh dấu bình luận hữu ích
- **Mô tả**: Người dùng đánh dấu bình luận là hữu ích
- **API**: `POST /api/posts/{postId}/comments/{commentId}/helpful`

### 1.7. Tin nhắn và trò chuyện (Messages/Chat)

#### UC-USER-042: Xem danh sách cuộc trò chuyện
- **Mô tả**: Người dùng xem danh sách các cuộc trò chuyện
- **Thông tin hiển thị**: Avatar, tên người dùng, tin nhắn cuối, số tin nhắn chưa đọc, thời gian
- **API**: `GET /api/messages/conversations`

#### UC-USER-043: Xem/ tạo cuộc trò chuyện với người dùng
- **Mô tả**: Người dùng xem hoặc tạo cuộc trò chuyện với một người dùng
- **API**: `GET /api/messages/conversations/{otherUserId}`

#### UC-USER-044: Xem tin nhắn trong cuộc trò chuyện
- **Mô tả**: Người dùng xem các tin nhắn trong một cuộc trò chuyện
- **API**: `GET /api/messages/conversations/{conversationId}/messages`

#### UC-USER-045: Gửi tin nhắn
- **Mô tả**: Người dùng gửi tin nhắn (text, image) trong cuộc trò chuyện
- **API**: `POST /api/messages/send`

#### UC-USER-046: Đánh dấu tin nhắn đã đọc
- **Mô tả**: Người dùng đánh dấu tất cả tin nhắn trong cuộc trò chuyện đã đọc
- **API**: `PUT /api/messages/conversations/{conversationId}/read`

### 1.8. Quản lý thẻ (Tags)

#### UC-USER-047: Xem danh sách thẻ phổ biến (Trending Tags)
- **Mô tả**: Người dùng xem các thẻ đang thịnh hành
- **API**: `GET /api/tags/trending`

#### UC-USER-048: Tìm kiếm thẻ
- **Mô tả**: Người dùng tìm kiếm thẻ theo tên
- **API**: `GET /api/tags/search?q={query}`

#### UC-USER-049: Xem thông tin chi tiết thẻ
- **Mô tả**: Người dùng xem thông tin chi tiết của một thẻ
- **API**: `GET /api/tags/{id}`, `GET /api/tags/slug/{slug}`

#### UC-USER-050: Tạo thẻ mới
- **Mô tả**: Người dùng tạo thẻ mới (được sử dụng khi tạo bài đăng)
- **API**: `POST /api/tags`

### 1.9. Ranking và Leaderboard

#### UC-USER-051: Xem bảng xếp hạng người dùng theo XP
- **Mô tả**: Người dùng xem bảng xếp hạng người dùng theo điểm XP
- **Tùy chọn**: Theo kỳ (WEEK, MONTH, YEAR, ALL), giới hạn số lượng (top 5/10/50/100)
- **API**: `GET /api/rankings/users/xp?period={period}&limit={limit}`

#### UC-USER-052: Xem bảng xếp hạng bài đăng theo reactions
- **Mô tả**: Người dùng xem bảng xếp hạng bài đăng có nhiều reactions nhất
- **Tùy chọn**: Theo kỳ, giới hạn số lượng
- **API**: `GET /api/rankings/posts/reactions?period={period}&limit={limit}`

#### UC-USER-053: Xem bảng xếp hạng bài đăng theo comments
- **Mô tả**: Người dùng xem bảng xếp hạng bài đăng có nhiều comments nhất
- **Tùy chọn**: Theo kỳ, giới hạn số lượng
- **API**: `GET /api/rankings/posts/comments?period={period}&limit={limit}`

### 1.10. Quản lý file và upload

#### UC-USER-054: Upload hình ảnh
- **Mô tả**: Người dùng upload một hoặc nhiều hình ảnh lên Cloudinary
- **API**: `POST /api/files/upload`, `POST /api/files/upload/single`

#### UC-USER-055: Xóa file đã upload
- **Mô tả**: Người dùng xóa file đã upload (tùy chọn)
- **API**: `DELETE /api/files/delete?publicId={publicId}`

### 1.11. Hệ thống XP và Badge

#### UC-USER-056: Xem lịch sử XP Events
- **Mô tả**: Người dùng xem lịch sử các sự kiện tích lũy XP
- **API**: `GET /api/xp-events/me`

#### UC-USER-057: Xem tổng số XP và level
- **Mô tả**: Người dùng xem tổng số XP hiện tại và level của mình
- **Thông tin**: Hiển thị trong profile

#### UC-USER-058: Xem danh sách badges đã đạt được
- **Mô tả**: Người dùng xem các badge đã được trao tặng
- **Thông tin**: Hiển thị trong profile với thời gian đạt được

---

---

## 2.2. ROLE: ADMIN (Quản trị viên)

Tất cả các use case của USER, cộng thêm:

### 2.1. Quản lý Badge

#### UC-ADMIN-001: Xem danh sách Badge (có filter, pagination)
- **Mô tả**: Admin xem danh sách tất cả badges trong hệ thống
- **Tính năng**: Filter, search, sort, pagination
- **API**: `GET /api/badges`

#### UC-ADMIN-002: Xem chi tiết Badge
- **Mô tả**: Admin xem thông tin chi tiết một badge
- **API**: `GET /api/badges/{id}`

#### UC-ADMIN-003: Tạo Badge mới
- **Mô tả**: Admin tạo badge mới cho hệ thống
- **Thông tin**: name, description, iconUrl, criteria
- **API**: `POST /api/badges`

#### UC-ADMIN-004: Cập nhật Badge
- **Mô tả**: Admin chỉnh sửa thông tin badge
- **API**: `PUT /api/badges/{id}`

#### UC-ADMIN-005: Xóa Badge
- **Mô tả**: Admin xóa badge khỏi hệ thống
- **API**: `DELETE /api/badges/{id}`

### 2.2. Quản lý XP Configuration

#### UC-ADMIN-006: Xem danh sách XP Config (có filter, pagination)
- **Mô tả**: Admin xem danh sách cấu hình XP trong hệ thống
- **Tính năng**: Filter theo status, category; search, sort, pagination
- **Thông tin**: name, eventType (tự động generate từ name), category, points, status (PENDING_DEVELOPMENT, IN_DEVELOPMENT, PENDING_APPROVAL, ACTIVE)
- **API**: `GET /api/xp-configs`

#### UC-ADMIN-007: Xem chi tiết XP Config
- **Mô tả**: Admin xem thông tin chi tiết một XP config
- **API**: `GET /api/xp-configs/{eventType}`

#### UC-ADMIN-008: Tạo/ Cập nhật XP Config
- **Mô tả**: Admin tạo hoặc cập nhật cấu hình XP
- **Luồng**: 
  - eventType tự động generate từ name (uppercase, underscore-separated)
  - Status mặc định: PENDING_DEVELOPMENT cho config mới
- **API**: `POST /api/xp-configs`

#### UC-ADMIN-009: Cập nhật điểm XP
- **Mô tả**: Admin cập nhật số điểm XP cho một event type
- **API**: `PUT /api/xp-configs/{eventType}/points`

#### UC-ADMIN-010: Xóa XP Config
- **Mô tả**: Admin xóa cấu hình XP (đặt status thành PENDING_DEVELOPMENT)
- **API**: `DELETE /api/xp-configs/{eventType}`

### 2.3. Quản lý bài đăng (Admin)

#### UC-ADMIN-011: Xem danh sách bài đăng đã bị xóa
- **Mô tả**: Admin xem danh sách các bài đăng đã bị soft delete
- **API**: `GET /api/posts/deleted`

#### UC-ADMIN-012: Khôi phục bài đăng đã xóa
- **Mô tả**: Admin khôi phục bài đăng đã bị xóa (từ bất kỳ người dùng nào)
- **API**: `POST /api/posts/{postId}/restore`

### 2.4. Dashboard quản trị

#### UC-ADMIN-013: Xem Dashboard quản trị
- **Mô tả**: Admin xem tổng quan hệ thống (thống kê, biểu đồ, etc.)
- **Trạng thái**: Coming soon (UI đã có nhưng chưa implement)

---

## 2.3. ROLE: MODERATOR

**Lưu ý**: Role MODERATOR hiện tại chưa được implement trong hệ thống. Có thể phát triển sau với các chức năng như:
- Kiểm duyệt nội dung bài đăng và bình luận
- Xử lý báo cáo vi phạm
- Quản lý nội dung không phù hợp

---

## 3. Tổng kết

### 3.1. Các module chính

1. **Authentication & Authorization**: Đăng ký, đăng nhập, OAuth, quên mật khẩu
2. **User Management**: Quản lý hồ sơ, follow/unfollow, privacy settings
3. **Post Management**: Tạo, sửa, xóa, lưu, chia sẻ bài đăng, quản lý draft
4. **Interaction**: Reactions, comments, like, mark helpful
5. **Messaging**: Chat trực tuyến giữa người dùng
6. **Content Discovery**: Feed, explore, ranking/leaderboard
7. **Tag System**: Quản lý và tìm kiếm thẻ
8. **Gamification**: XP system, badges, levels
9. **Admin Tools**: Quản lý badges, XP configs, deleted posts

### 3.2. Lưu ý

- **AI Features**: Các tính năng AI (kiểm duyệt tự động, chỉnh sửa ảnh) không nằm trong phạm vi tài liệu này
- **Super Admin**: Role SUPER_ADMIN hiện chưa được sử dụng, sẽ phát triển sau
- **Moderation**: Hệ thống hiện chưa có chức năng kiểm duyệt nội dung bởi moderator, chỉ có kiểm duyệt tự động (AI) và quản lý bởi admin

