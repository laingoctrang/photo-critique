// script-seed-badges.js
db.badges.deleteMany({});

db.badges.insertMany([
    {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "name": "First Steps",
        "description": "Earned for creating your first public post",
        "icon_url": "https://example.com/icons/first-steps.png",
        "xp_threshold": 10,
        "level": 1,
        "created_at": ISODate("2024-01-01T00:00:00Z"),
        "updated_at": ISODate("2024-01-01T00:00:00Z")
    },
    {
        "_id": ObjectId("507f1f77bcf86cd799439012"),
        "name": "Commenter",
        "description": "Earned for posting 10 helpful comments",
        "icon_url": "https://example.com/icons/commenter.png",
        "xp_threshold": 100,
        "level": 2,
        "created_at": ISODate("2024-01-01T00:00:00Z"),
        "updated_at": ISODate("2024-01-01T00:00:00Z")
    },
    {
        "_id": ObjectId("507f1f77bcf86cd799439013"),
        "name": "Popular",
        "description": "Earned for reaching 100 followers",
        "icon_url": "https://example.com/icons/popular.png",
        "xp_threshold": 500,
        "level": 3,
        "created_at": ISODate("2024-01-01T00:00:00Z"),
        "updated_at": ISODate("2024-01-01T00:00:00Z")
    },
    {
        "_id": ObjectId("507f1f77bcf86cd799439014"),
        "name": "Expert",
        "description": "Earned for reaching 1000 XP points",
        "icon_url": "https://example.com/icons/expert.png",
        "xp_threshold": 1000,
        "level": 4,
        "created_at": ISODate("2024-01-01T00:00:00Z"),
        "updated_at": ISODate("2024-01-01T00:00:00Z")
    },
    {
        "_id": ObjectId("507f1f77bcf86cd799439015"),
        "name": "Helper",
        "description": "Earned for having 5 comments marked as helpful",
        "icon_url": "https://example.com/icons/helper.png",
        "xp_threshold": 150,
        "level": 2,
        "created_at": ISODate("2024-01-01T00:00:00Z"),
        "updated_at": ISODate("2024-01-01T00:00:00Z")
    },
    {
        "_id": ObjectId("507f1f77bcf86cd799439016"),
        "name": "Star",
        "description": "Earned for being in the top 10 of the leaderboard",
        "icon_url": "https://example.com/icons/star.png",
        "xp_threshold": 2000,
        "level": 5,
        "created_at": ISODate("2024-01-01T00:00:00Z"),
        "updated_at": ISODate("2024-01-01T00:00:00Z")
    },
    {
        "_id": ObjectId("507f1f77bcf86cd799439017"),
        "name": "Pro",
        "description": "Earned for reaching level 10",
        "icon_url": "https://example.com/icons/pro.png",
        "xp_threshold": 5000,
        "level": 10,
        "created_at": ISODate("2024-01-01T00:00:00Z"),
        "updated_at": ISODate("2024-01-01T00:00:00Z")
    },
    {
        "_id": ObjectId("507f1f77bcf86cd799439018"),
        "name": "Legend",
        "description": "Earned for reaching 10000 XP points",
        "icon_url": "https://example.com/icons/legend.png",
        "xp_threshold": 10000,
        "level": 15,
        "created_at": ISODate("2024-01-01T00:00:00Z"),
        "updated_at": ISODate("2024-01-01T00:00:00Z")
    }
]);