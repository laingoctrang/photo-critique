// Script để sửa giá trị FRIENDS thành FOLLOWER_ONLY trong collection posts
// Chạy lệnh: mongosh "mongodb://localhost:27017/your_database_name" < scripts/fix_privacy_type.js
// Hoặc kết nối MongoDB shell và chạy từng lệnh

db = db.getSiblingDB('your_database_name'); // Thay 'your_database_name' bằng tên database của bạn

print('Fixing privacy type from FRIENDS to FOLLOWER_ONLY...\n');

// Kiểm tra số lượng documents có privacy = "FRIENDS"
const count = db.posts.countDocuments({ privacy: "FRIENDS" });
print(`Found ${count} posts with privacy = "FRIENDS"\n`);

if (count > 0) {
    // Cập nhật tất cả documents có privacy = "FRIENDS" thành "FOLLOWER_ONLY"
    const result = db.posts.updateMany(
        { privacy: "FRIENDS" },
        { $set: { privacy: "FOLLOWER_ONLY" } }
    );
    
    print(`✓ Updated ${result.modifiedCount} posts from FRIENDS to FOLLOWER_ONLY`);
} else {
    print('No posts found with privacy = "FRIENDS"');
}

// Kiểm tra các giá trị privacy hiện tại trong database
print('\nCurrent privacy values in posts collection:');
db.posts.aggregate([
    { $group: { _id: "$privacy", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
]).forEach(function(item) {
    print(`  - ${item._id || '(null)'}: ${item.count} posts`);
});

print('\n✓ Migration completed!');





