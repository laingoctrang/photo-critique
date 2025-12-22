# Hướng dẫn sửa lỗi PrivacyType.FRIENDS

## Vấn đề

Khi đọc dữ liệu từ MongoDB, bạn gặp lỗi:
```
No enum constant com.photo_critique_be.enums.PrivacyType.FRIENDS
```

**Nguyên nhân**: Trong database có các document với giá trị `privacy = "FRIENDS"`, nhưng enum `PrivacyType` trong code chỉ có các giá trị:
- `PUBLIC`
- `PRIVATE`
- `FOLLOWER_ONLY`

Giá trị `FRIENDS` có thể là giá trị cũ từ phiên bản trước của ứng dụng.

## Giải pháp

Cần cập nhật tất cả các document trong collection `posts` có `privacy = "FRIENDS"` thành `privacy = "FOLLOWER_ONLY"`.

### Cách 1: Sử dụng MongoDB Shell (Khuyên dùng)

1. **Kết nối đến MongoDB**:
   ```bash
   mongosh "mongodb://localhost:27017/your_database_name"
   ```
   (Thay `your_database_name` bằng tên database của bạn)

2. **Kiểm tra số lượng documents cần sửa**:
   ```javascript
   db.posts.countDocuments({ privacy: "FRIENDS" })
   ```

3. **Cập nhật tất cả documents**:
   ```javascript
   db.posts.updateMany(
       { privacy: "FRIENDS" },
       { $set: { privacy: "FOLLOWER_ONLY" } }
   )
   ```

4. **Xác nhận kết quả**:
   ```javascript
   // Kiểm tra các giá trị privacy hiện tại
   db.posts.aggregate([
       { $group: { _id: "$privacy", count: { $sum: 1 } } },
       { $sort: { count: -1 } }
   ])
   ```

### Cách 2: Sử dụng Script

1. **Sửa tên database trong file script**:
   - Mở file `scripts/fix_privacy_type.js`
   - Thay `'your_database_name'` bằng tên database thực tế

2. **Chạy script**:
   ```bash
   mongosh "mongodb://localhost:27017/your_database_name" < scripts/fix_privacy_type.js
   ```

   Hoặc nếu đã kết nối đến MongoDB:
   ```bash
   mongosh < scripts/fix_privacy_type.js
   ```

### Cách 3: Sử dụng MongoDB Compass hoặc Studio 3T

1. Mở MongoDB Compass hoặc Studio 3T
2. Kết nối đến database
3. Vào collection `posts`
4. Tìm tất cả documents có `privacy = "FRIENDS"`
5. Bulk update: Set `privacy` = `"FOLLOWER_ONLY"` cho tất cả

## Kiểm tra sau khi sửa

Sau khi chạy migration, kiểm tra xem còn giá trị `FRIENDS` nào không:

```javascript
// Số lượng documents còn có privacy = "FRIENDS"
db.posts.countDocuments({ privacy: "FRIENDS" })
// Kết quả mong đợi: 0

// Kiểm tra các giá trị privacy hợp lệ
db.posts.aggregate([
    { $group: { _id: "$privacy", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
])
// Chỉ nên thấy: PUBLIC, PRIVATE, FOLLOWER_ONLY (hoặc null)
```

## Lưu ý

- ⚠️ **Backup database** trước khi thực hiện (khuyến nghị)
- Giá trị `FOLLOWER_ONLY` có nghĩa là chỉ những người đã follow mới có thể xem, tương tự với `FRIENDS`
- Nếu bạn muốn giữ lại giá trị `FRIENDS` trong code, cần thêm nó vào enum `PrivacyType.java`, nhưng việc này không được khuyến nghị vì `FOLLOWER_ONLY` đã có nghĩa tương tự

## Mapping các giá trị PrivacyType

| Giá trị cũ (nếu có) | Giá trị mới | Mô tả |
|---------------------|-------------|-------|
| FRIENDS | FOLLOWER_ONLY | Chỉ người đã follow mới xem được |
| PUBLIC | PUBLIC | Ai cũng có thể xem |
| PRIVATE | PRIVATE | Chỉ mình người đăng |





