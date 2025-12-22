// script-seed-posts.js
// db.posts.deleteMany({});

// Danh sách userId có sẵn
const userIds = [
    "691826996549a3cf8c87bc41",
    "691826996549a3cf8c87bc42",
    "691826996549a3cf8c87bc43",
    "691826996549a3cf8c87bc44",
    "691826996549a3cf8c87bc45",
    "691828b76777d8330947bd6e",
];

// List kích thước ảnh
const sizes = [
    [800, 600],
    [600, 900],
    [1024, 768],
    [1600, 900],
    [768, 1024],
    [1200, 800],
    [800, 1200],
];

// Random size
function getRandomSize() {
    return sizes[Math.floor(Math.random() * sizes.length)];
}

// Random caption
function getRandomCaption() {
    const base = "This is a long caption used to test the caption expandable behavior. ";
    const repeat = Math.floor(Math.random() * 20) + 1; // 1–20 lần
    return base.repeat(repeat);
}

// Enum privacy
const privacyValues = ["PUBLIC", "FOLLOWER_ONLY", "PRIVATE"];

// Tạo 20 posts
const posts = Array.from({ length: 200 }).map((_, i) => {
    const imageCount = Math.floor(Math.random() * 4) + 1;

    const imageUrls = Array.from({ length: imageCount }).map((_, j) => {
        const [w, h] = getRandomSize();
        return {
            url: `https://picsum.photos/seed/${i}-${j}/${w}/${h}`,
            name: `image_${i}_${j}.jpg`,
            size: Math.floor(Math.random() * 500000) + 100000, // 100kb–600kb
            contentType: "image/jpeg"
        };
    });

    const createdAt = new Date(Date.now() - Math.random() * 10000000000); // random khoảng 115 ngày gần đây

    return {
        _id: ObjectId(),
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        caption: getRandomCaption(),
        image_urls: imageUrls,
        privacy: privacyValues[Math.floor(Math.random() * privacyValues.length)],
        likes_count: Math.floor(Math.random() * 500),
        comments_count: Math.floor(Math.random() * 100),
        shares_count: Math.floor(Math.random() * 20),
        tags: [],
        created_at: createdAt,
        updated_at: createdAt,
        original_post_id: null,
        is_deleted: false,
        deleted_at: null,
        deleted_by: null
    };
});

// Insert vào DB
db.posts.insertMany(posts);

print("Đã seed xong " + posts.length + " posts!");
