# Hướng dẫn Refresh Rankings Thủ Công

## Vấn đề

Ranking scheduler chạy vào 3h sáng mỗi ngày (`@Scheduled(cron = "0 0 3 * * ?")`), nhưng bạn muốn refresh rankings ngay để lấy data.

## Giải pháp

Có 3 cách để refresh rankings:

### Cách 1: Sử dụng API Endpoint (Khuyên dùng)

#### Refresh tất cả rankings (tất cả types và periods):

```bash
curl -X POST http://localhost:8080/api/rankings/refresh-all
```

#### Refresh một ranking cụ thể:

```bash
# User XP - Week
curl -X POST "http://localhost:8080/api/rankings/refresh?type=USER_XP&period=WEEK"

# Post Reactions - Month
curl -X POST "http://localhost:8080/api/rankings/refresh?type=POST_REACTIONS&period=MONTH"

# Post Comments - Year
curl -X POST "http://localhost:8080/api/rankings/refresh?type=POST_COMMENTS&period=YEAR"
```

### Cách 2: Sử dụng Script Shell (Linux/Mac)

1. **Cấp quyền thực thi** (nếu cần):
   ```bash
   chmod +x scripts/refresh_all_rankings.sh
   ```

2. **Chạy script**:
   ```bash
   ./scripts/refresh_all_rankings.sh
   ```

   Hoặc với custom API URL:
   ```bash
   API_BASE_URL=http://your-server:8080 ./scripts/refresh_all_rankings.sh
   ```

### Cách 3: Sử dụng Script Batch (Windows)

```cmd
scripts\refresh_all_rankings.bat
```

Hoặc chỉnh sửa `API_BASE_URL` trong file nếu server chạy ở port khác.

## Các Types và Periods

### Ranking Types:
- `USER_XP` - Ranking người dùng theo XP
- `POST_REACTIONS` - Ranking posts theo số reactions
- `POST_COMMENTS` - Ranking posts theo số comments

### Ranking Periods:
- `WEEK` - Tuần này
- `MONTH` - Tháng này
- `YEAR` - Năm này
- `ALL` - Tất cả thời gian

## Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Ranking refresh completed. Success: 12, Errors: 0",
  "data": "✓ USER_XP - WEEK\n✓ USER_XP - MONTH\n✓ POST_REACTIONS - WEEK\n..."
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Kiểm tra Rankings sau khi refresh

Sau khi refresh, bạn có thể kiểm tra rankings bằng các API:

```bash
# Lấy top 10 users theo XP tuần này
curl "http://localhost:8080/api/rankings/users/xp?period=WEEK&limit=10"

# Lấy top 50 posts nhiều reactions nhất tháng
curl "http://localhost:8080/api/rankings/posts/reactions?period=MONTH&limit=50"

# Lấy top 100 posts nhiều comments nhất năm
curl "http://localhost:8080/api/rankings/posts/comments?period=YEAR&limit=100"
```

## Lưu ý

- ⚠️ Refresh rankings có thể mất thời gian nếu có nhiều data
- Rankings được lưu vào MongoDB collection `ranking_snapshots`
- Rankings được cache vào Redis với TTL 25 giờ
- Nếu refresh thành công, cache cũ sẽ được cập nhật

## Troubleshooting

### Lỗi: Cannot connect to server
- Kiểm tra xem server có đang chạy không
- Kiểm tra `API_BASE_URL` có đúng không
- Kiểm tra firewall/network

### Lỗi: 401 Unauthorized
- Endpoint có thể yêu cầu authentication
- Kiểm tra xem có cần thêm JWT token không

### Rankings không được cập nhật
- Kiểm tra logs của server
- Kiểm tra xem có lỗi trong quá trình tính toán không
- Kiểm tra MongoDB và Redis connection

## Tự động hóa

Bạn có thể tạo cron job hoặc scheduled task để chạy script tự động:

### Linux/Mac (Crontab):
```bash
# Chạy mỗi ngày lúc 1h sáng
0 1 * * * /path/to/scripts/refresh_all_rankings.sh >> /var/log/ranking_refresh.log 2>&1
```

### Windows (Task Scheduler):
- Tạo scheduled task chạy `refresh_all_rankings.bat` vào thời gian mong muốn





