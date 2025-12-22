# Hướng dẫn sửa lỗi Index MongoDB

## Vấn đề

Khi khởi động ứng dụng, bạn gặp lỗi:
```
Cannot create index for '' in collection 'posts' with keys 'Document{{user_id=1, status=1, privacy=1, created_at=-1}}' 
Index already defined as 'IndexInfo [indexFields=[IndexField [ key: user_id, direction: ASC], 
IndexField [ key: is_deleted, direction: ASC], IndexField [ key: privacy, direction: ASC], 
IndexField [ key: created_at, direction: DESC]], name=feed_query, ...]'
```

**Nguyên nhân**: Index `feed_query` đã tồn tại trong MongoDB với định nghĩa cũ (có `is_deleted`), nhưng code mới yêu cầu index với `status` thay vì `is_deleted`.

## Giải pháp

### Cách 1: Sử dụng MongoDB Shell (Khuyên dùng)

1. **Kết nối đến MongoDB**:
   ```bash
   mongosh "mongodb://localhost:27017/your_database_name"
   ```
   (Thay `your_database_name` bằng tên database của bạn)

2. **Xóa index cũ**:
   ```javascript
   db.posts.dropIndex("feed_query")
   ```

3. **Kiểm tra các index còn lại**:
   ```javascript
   db.posts.getIndexes()
   ```

4. **Khởi động lại ứng dụng Spring Boot**. Spring sẽ tự động tạo lại index với định nghĩa mới.

### Cách 2: Sử dụng Script

1. **Sửa tên database trong file script**:
   - Mở file `scripts/fix_post_indexes.js`
   - Thay `'your_database_name'` bằng tên database thực tế

2. **Chạy script**:
   ```bash
   mongosh "mongodb://localhost:27017/your_database_name" < scripts/fix_post_indexes.js
   ```

   Hoặc nếu đã kết nối đến MongoDB:
   ```bash
   mongosh < scripts/fix_post_indexes.js
   ```

### Cách 3: Sử dụng MongoDB Compass hoặc Studio 3T

1. Mở MongoDB Compass hoặc Studio 3T
2. Kết nối đến database
3. Vào collection `posts`
4. Vào tab **Indexes**
5. Tìm và xóa index `feed_query`
6. Khởi động lại ứng dụng

## Index mới sẽ được tạo tự động

Sau khi xóa index cũ và khởi động lại ứng dụng, Spring Data MongoDB sẽ tự động tạo các index mới:

```java
@CompoundIndex(name = "feed_query", def = "{'user_id': 1, 'status': 1, 'privacy': 1, 'created_at': -1}")
@CompoundIndex(name = "user_posts", def = "{'user_id': 1, 'status': 1, 'created_at': -1}")
@CompoundIndex(name = "status_query", def = "{'status': 1, 'created_at': -1}")
```

## Lưu ý

- ⚠️ **Backup database** trước khi thực hiện (khuyến nghị)
- Việc drop index có thể mất một chút thời gian nếu collection lớn
- Sau khi drop index, các query có thể chạy chậm hơn một chút cho đến khi index mới được tạo
- Index sẽ được tạo lại tự động khi ứng dụng khởi động

## Kiểm tra sau khi sửa

Sau khi khởi động lại ứng dụng, kiểm tra xem index đã được tạo đúng chưa:

```javascript
db.posts.getIndexes().forEach(function(index) {
    if (index.name === 'feed_query') {
        print('feed_query index: ' + JSON.stringify(index.key));
        // Kết quả mong đợi: {"user_id":1,"status":1,"privacy":1,"created_at":-1}
    }
});
```





