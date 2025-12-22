# Ranking API Guide

## Tổng quan

Hệ thống ranking được thiết kế để lấy danh sách xếp hạng người dùng và bài đăng theo các tiêu chí khác nhau. Rankings được tính toán và cập nhật tự động vào 0h hàng ngày, sau đó được cache trong Redis để tối ưu hiệu suất.

## Kiến trúc

### 1. **MongoDB (Persistent Storage)**
- Collection `ranking_snapshots`: Lưu trữ snapshots của rankings đã tính toán
- Mỗi snapshot chứa: type, period, snapshotDate, và danh sách rankings

### 2. **Redis (Cache)**
- Cache rankings với TTL 25 giờ (đảm bảo có dữ liệu cho đến khi update ngày hôm sau)
- Key format: `RANKING:{TYPE}:{PERIOD}:{DATE}`

### 3. **Scheduler**
- Chạy vào 0h hàng ngày (`@Scheduled(cron = "0 0 0 * * ?")`)
- Tính toán và lưu rankings cho tất cả types và periods

## API Endpoints

### 1. Lấy Ranking Người Dùng theo XP

```http
GET /api/rankings/users/xp?period=WEEK&limit=10
```

**Query Parameters:**
- `period` (required, default: WEEK): WEEK | MONTH | YEAR | ALL
- `limit` (optional): Số lượng kết quả muốn lấy (5, 10, 50, 100, ...)

**Response:**
```json
{
  "success": true,
  "message": "Ranking retrieved successfully",
  "data": {
    "type": "USER_XP",
    "period": "WEEK",
    "snapshotDate": "2024-01-15",
    "userRankings": [
      {
        "userId": "user123",
        "username": "john_doe",
        "profilePicture": "https://...",
        "xpPoints": 1500,
        "level": 15,
        "rank": 1
      },
      ...
    ],
    "totalCount": 10
  }
}
```

### 2. Lấy Ranking Posts theo Reactions

```http
GET /api/rankings/posts/reactions?period=MONTH&limit=50
```

**Query Parameters:**
- `period` (required, default: WEEK): WEEK | MONTH | YEAR | ALL
- `limit` (optional): Số lượng kết quả muốn lấy

**Response:**
```json
{
  "success": true,
  "message": "Ranking retrieved successfully",
  "data": {
    "type": "POST_REACTIONS",
    "period": "MONTH",
    "snapshotDate": "2024-01-15",
    "postRankings": [
      {
        "postId": "post123",
        "userId": "user123",
        "username": "john_doe",
        "caption": "Beautiful sunset...",
        "imageUrls": ["https://..."],
        "reactionsCount": 250,
        "commentsCount": 45,
        "rank": 1
      },
      ...
    ],
    "totalCount": 50
  }
}
```

### 3. Lấy Ranking Posts theo Comments

```http
GET /api/rankings/posts/comments?period=YEAR&limit=100
```

**Query Parameters:**
- `period` (required, default: WEEK): WEEK | MONTH | YEAR | ALL
- `limit` (optional): Số lượng kết quả muốn lấy

### 4. Force Refresh Ranking (Admin)

```http
POST /api/rankings/refresh?type=USER_XP&period=WEEK
```

**Query Parameters:**
- `type` (required): USER_XP | POST_REACTIONS | POST_COMMENTS
- `period` (required): WEEK | MONTH | YEAR | ALL

**Note:** Endpoint này tính toán và cập nhật ranking ngay lập tức, không cần đợi scheduler.

## Cách hoạt động

### Flow khi gọi API:

1. **Client gọi API** → Controller nhận request
2. **Service layer**:
   - Kiểm tra Redis cache trước
   - Nếu có cache → Trả về ngay (nhanh)
   - Nếu không có cache → Lấy từ MongoDB snapshot mới nhất
   - Nếu không có snapshot → Tính toán ngay (fallback)
3. **Áp dụng limit** nếu có
4. **Trả về kết quả**

### Scheduler Flow (0h hàng ngày):

1. **Trigger** → Scheduler chạy
2. **Tính toán** → Với mỗi type và period:
   - Aggregation queries trên MongoDB
   - Tính toán XP/reactions/comments trong khoảng thời gian
   - Sắp xếp và rank
3. **Lưu vào MongoDB** → Tạo snapshot mới
4. **Cache vào Redis** → TTL 25 giờ

## Tính năng

- ✅ **Auto-update vào 0h hàng ngày**
- ✅ **Redis caching** cho hiệu suất cao
- ✅ **MongoDB persistence** để lưu lịch sử
- ✅ **Flexible periods**: Week, Month, Year, All
- ✅ **Flexible limits**: Top 5, 10, 50, 100, ...
- ✅ **Fallback**: Tự động tính toán nếu chưa có data

## Performance

- **Cache hit**: < 10ms
- **Cache miss (MongoDB)**: ~50-100ms
- **Cache miss (fallback calculation)**: ~200-500ms (tùy số lượng data)

## Database Indexes

Các indexes đã được tạo để tối ưu queries:

```java
@CompoundIndex(name = "idx_ranking_lookup", 
    def = "{'type': 1, 'period': 1, 'snapshot_date': -1}")
@CompoundIndex(name = "idx_ranking_date", 
    def = "{'snapshot_date': -1}")
```

## Ví dụ sử dụng

### Frontend - Lấy top 10 users theo XP tuần này:

```typescript
const response = await axios.get('/api/rankings/users/xp', {
  params: {
    period: 'WEEK',
    limit: 10
  }
});
```

### Frontend - Lấy top 50 posts nhiều reactions nhất tháng:

```typescript
const response = await axios.get('/api/rankings/posts/reactions', {
  params: {
    period: 'MONTH',
    limit: 50
  }
});
```

## Notes

- Rankings được tính dựa trên **created_at** của events (XP events, reactions, comments)
- Posts đã bị soft delete sẽ không xuất hiện trong rankings
- User rankings tính dựa trên tổng XP trong khoảng thời gian, không phải XP tổng cộng
- Scheduler có thể được chạy thủ công bằng cách gọi `/api/rankings/refresh` nếu cần

