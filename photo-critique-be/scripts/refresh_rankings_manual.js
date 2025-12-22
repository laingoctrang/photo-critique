// Script MongoDB để tính toán rankings thủ công (nếu cần)
// Lưu ý: Script này chỉ để tham khảo, nên sử dụng API endpoint thay vì chạy trực tiếp

db = db.getSiblingDB('your_database_name'); // Thay 'your_database_name' bằng tên database của bạn

print('=== Manual Ranking Calculation ===\n');

// Lưu ý: Script này chỉ để xem data, không tính toán rankings
// Rankings nên được tính toán qua API endpoint /api/rankings/refresh-all

print('To calculate rankings, please use the API endpoint:');
print('POST http://localhost:8080/api/rankings/refresh-all\n');

print('Or use individual refresh:');
print('POST http://localhost:8080/api/rankings/refresh?type=USER_XP&period=WEEK');
print('POST http://localhost:8080/api/rankings/refresh?type=POST_REACTIONS&period=WEEK');
print('POST http://localhost:8080/api/rankings/refresh?type=POST_COMMENTS&period=WEEK\n');

print('=== Current Ranking Snapshots ===\n');

// Hiển thị các snapshots hiện có
db.ranking_snapshots.find().sort({ created_at: -1 }).limit(10).forEach(function(snapshot) {
    print(`Type: ${snapshot.type}, Period: ${snapshot.period}, Date: ${snapshot.snapshot_date}`);
    if (snapshot.user_rankings) {
        print(`  User Rankings: ${snapshot.user_rankings.length} items`);
    }
    if (snapshot.post_rankings) {
        print(`  Post Rankings: ${snapshot.post_rankings.length} items`);
    }
    print('');
});

print('=== End ===');





