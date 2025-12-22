# Database ERD Generator

Script tự động tạo ERD (Entity Relationship Diagram) từ các MongoDB Spring Boot models.

## 📁 Files Đã Tạo

- **`ERD.mmd`** - Mermaid diagram file (format text, có thể render thành ảnh)
- **`ERD_README.md`** - Hướng dẫn chi tiết
- **`scripts/generate_erd.py`** - Python script chính
- **`scripts/generate_erd.bat`** - Batch file để chạy trên Windows
- **`scripts/quick_convert.bat`** - Helper script để convert sang ảnh
- **`scripts/convert_erd_to_image.md`** - Hướng dẫn convert sang ảnh

## 🚀 Cách Sử Dụng

### Bước 1: Generate ERD

**Windows:**
```bash
cd photo-critique-be/scripts
generate_erd.bat
```

**Hoặc dùng Python:**
```bash
cd photo-critique-be/scripts
python generate_erd.py
```

### Bước 2: Xem/Convert ERD thành ảnh

#### ⭐ Phương pháp Đơn giản nhất (Khuyên dùng):

1. Mở https://mermaid.live/
2. Mở file `ERD.mmd` (nằm trong thư mục `photo-critique-be`)
3. Copy toàn bộ nội dung file
4. Paste vào editor trên mermaid.live
5. Diagram sẽ tự động render
6. Click **"Actions"** (góc trên phải) → **"Download PNG"** hoặc **"Download SVG"**

#### Hoặc dùng batch helper:
```bash
cd photo-critique-be/scripts
quick_convert.bat
```
Chọn option [1] để mở mermaid.live tự động.

### Bước 3: Sử dụng ảnh ERD

- Chèn vào báo cáo/documentation
- Sử dụng trong presentation
- Share với team members

## 📊 Thông Tin ERD

ERD hiện tại bao gồm:
- **15 MongoDB collections**
- **26 relationships** giữa các entities
- Tất cả các fields, indexes, và foreign keys

### Collections:

1. **User** - Người dùng
2. **Post** - Bài đăng
3. **Comment** - Bình luận
4. **Reaction** - Reactions (like, etc.)
5. **Follow** - Follow relationships
6. **SavedPost** - Bài đăng đã lưu
7. **Share** - Chia sẻ bài đăng
8. **Tag** - Tags
9. **Notification** - Thông báo
10. **Conversation** - Cuộc trò chuyện
11. **Message** - Tin nhắn
12. **Badge** - Huy hiệu
13. **XPConfig** - Cấu hình XP
14. **XPEvent** - Sự kiện XP
15. **AIRequest** - Yêu cầu AI
16. **RankingSnapshot** - Ranking snapshots

## 🔄 Regenerate ERD

Mỗi khi bạn thay đổi models, chạy lại script để cập nhật ERD:

```bash
cd photo-critique-be/scripts
python generate_erd.py
```

## 📝 Legend

- `PK` = Primary Key (_id)
- `UK` = Unique Index
- `IDX` = Indexed Field
- Relationships hiển thị tên field kết nối các entities

## 🛠️ Requirements

- Python 3.6+ (để chạy script)
- Node.js (nếu muốn dùng mermaid-cli để convert offline)
- Trình duyệt web (nếu dùng mermaid.live)

## 💡 Tips

- **SVG** format tốt hơn PNG vì có thể scale không mất chất lượng
- ERD file (`.mmd`) có thể commit lên Git để version control
- GitHub/GitLab tự động render Mermaid trong markdown files
- Script tự động detect relationships từ field names (user_id, post_id, etc.)

## 🐛 Troubleshooting

**Lỗi: Python not found**
- Đảm bảo Python đã được cài đặt và trong PATH
- Thử: `python --version`

**Lỗi: File not found**
- Đảm bảo đang ở đúng thư mục: `photo-critique-be/scripts`
- Check xem `MODEL_DIR` trong script có đúng path không

**ERD không hiển thị đúng**
- Check xem các models có đúng annotation `@Document` và `@Field` không
- Check console output khi chạy script để xem có lỗi gì không

---

**Tạo bởi:** Auto-generated ERD Script  
**Cập nhật:** Chạy script để regenerate

