// Script để xóa và tạo lại index cho collection posts
// Chạy lệnh: mongosh <database_name> < scripts/fix_post_indexes.js
// Hoặc: mongosh "mongodb://localhost:27017/your_database" < scripts/fix_post_indexes.js

db = db.getSiblingDB('your_database_name'); // Thay 'your_database_name' bằng tên database của bạn

print('Dropping old indexes from posts collection...');

try {
    // Xóa index cũ (nếu tồn tại)
    db.posts.dropIndex('feed_query');
    print('✓ Dropped old feed_query index');
} catch (e) {
    print('Index feed_query not found or already dropped: ' + e.message);
}

try {
    // Xóa các index khác nếu cần (để đảm bảo không có conflict)
    db.posts.dropIndex('user_posts');
    print('✓ Dropped user_posts index');
} catch (e) {
    print('Index user_posts not found: ' + e.message);
}

try {
    db.posts.dropIndex('status_query');
    print('✓ Dropped status_query index');
} catch (e) {
    print('Index status_query not found: ' + e.message);
}

print('\nOld indexes dropped successfully!');
print('Spring Boot will automatically create new indexes on next startup.');

// Hiển thị các indexes hiện tại
print('\nCurrent indexes on posts collection:');
db.posts.getIndexes().forEach(function(index) {
    print('  - ' + index.name + ': ' + JSON.stringify(index.key));
});





