db.follows.deleteMany({});

// Danh sách người dùng
const userIds = [
    "691826996549a3cf8c87bc41",
    "691826996549a3cf8c87bc42",
    "691826996549a3cf8c87bc43",
    "691826996549a3cf8c87bc44",
    "691826996549a3cf8c87bc45",
    "691828b76777d8330947bd6e",
];

const followStatus = ["PENDING", "ACCEPTED"];

// Set để tránh duplicate follow
const pairSet = new Set();

// Hàm random phần tử
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate 30 records
const followData = [];

while (followData.length < 30) {
    const follower = rand(userIds);
    const following = rand(userIds);

    // Không follow chính mình
    if (follower === following) continue;

    const key = `${follower}-${following}`;
    if (pairSet.has(key)) continue;

    pairSet.add(key);

    followData.push({
        follower_id: follower,
        following_id: following,
        status: rand(followStatus),
        created_at: new Date(),
        updated_at: new Date()
    });
}

console.log("Success");

db.follows.insertMany(followData);
