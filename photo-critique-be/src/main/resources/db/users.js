// script-seed-users.js
db.users.deleteMany({});

db.users.insertMany([
    {
        "username": "john_doe",
        "email": "john.doe@example.com",
        "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // 123
        "profile_picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        "bio": "Professional photographer specializing in landscape and portrait photography",
        "full_name": "John Doe",
        "is_online": true,
        "last_seen": ISODate("2024-01-15T10:30:00Z"),
        "privacy_setting": "PUBLIC",
        "xp_points": 245,
        "level": 3,
        "badges": [
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439011"),
                "earned_at": ISODate("2024-01-10T08:00:00Z")
            },
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439012"),
                "earned_at": ISODate("2024-01-12T14:30:00Z")
            }
        ],
        "followers_count": 156,
        "following_count": 89,
        "roles": ["USER"],
        "enabled": true,
        "created_at": ISODate("2024-01-01T00:00:00Z"),
        "updated_at": ISODate("2024-01-15T10:30:00Z"),
        "auth_provider": "LOCAL",
        "provider_id": null
    },
    {
        "username": "sarah_photography",
        "email": "sarah.wilson@example.com",
        "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // 123
        "profile_picture": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        "bio": "Street photographer | Travel enthusiast | Capturing life's moments",
        "full_name": "Sarah Wilson",
        "is_online": false,
        "last_seen": ISODate("2024-01-15T09:15:00Z"),
        "privacy_setting": "PUBLIC",
        "xp_points": 512,
        "level": 5,
        "badges": [
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439013"),
                "earned_at": ISODate("2024-01-08T11:20:00Z")
            },
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439014"),
                "earned_at": ISODate("2024-01-14T16:45:00Z")
            }
        ],
        "followers_count": 289,
        "following_count": 134,
        "roles": ["USER"],
        "enabled": true,
        "created_at": ISODate("2023-12-15T00:00:00Z"),
        "updated_at": ISODate("2024-01-15T09:15:00Z"),
        "auth_provider": "LOCAL",
        "provider_id": null
    },
    {
        "username": "mike_visuals",
        "email": "mike.chen@example.com",
        "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // 123
        "profile_picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        "bio": "Fashion photographer | Creative director | Always experimenting with light",
        "full_name": "Mike Chen",
        "is_online": true,
        "last_seen": ISODate("2024-01-15T11:45:00Z"),
        "privacy_setting": "FOLLOWER_ONLY",
        "xp_points": 178,
        "level": 2,
        "badges": [
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439015"),
                "earned_at": ISODate("2024-01-05T13:10:00Z")
            }
        ],
        "followers_count": 92,
        "following_count": 156,
        "roles": ["USER"],
        "enabled": true,
        "created_at": ISODate("2024-01-03T00:00:00Z"),
        "updated_at": ISODate("2024-01-15T11:45:00Z"),
        "auth_provider": "LOCAL",
        "provider_id": null
    },
    {
        "username": "lisa_creations",
        "email": "lisa.brown@example.com",
        "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // 123
        "profile_picture": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        "bio": "Nature photographer | Wildlife conservationist | Teaching photography basics",
        "full_name": "Lisa Brown",
        "is_online": false,
        "last_seen": ISODate("2024-01-14T22:30:00Z"),
        "privacy_setting": "PRIVATE",
        "xp_points": 867,
        "level": 7,
        "badges": [
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439016"),
                "earned_at": ISODate("2023-12-20T09:45:00Z")
            },
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439017"),
                "earned_at": ISODate("2024-01-02T15:20:00Z")
            },
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439018"),
                "earned_at": ISODate("2024-01-13T10:30:00Z")
            }
        ],
        "followers_count": 423,
        "following_count": 78,
        "roles": ["USER"],
        "enabled": true,
        "created_at": ISODate("2023-11-20T00:00:00Z"),
        "updated_at": ISODate("2024-01-14T22:30:00Z"),
        "auth_provider": "LOCAL",
        "provider_id": null
    },
    {
        "username": "alex_wanderer",
        "email": "alex.garcia@example.com",
        "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // 123
        "profile_picture": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        "bio": "Travel photographer | Adventure seeker | Documentary filmmaker",
        "full_name": "Alex Garcia",
        "is_online": true,
        "last_seen": ISODate("2024-01-15T12:00:00Z"),
        "privacy_setting": "PUBLIC",
        "xp_points": 1200,
        "level": 8,
        "badges": [
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439014"),
                "earned_at": ISODate("2024-01-10T10:00:00Z")
            },
            {
                "badge_id": ObjectId("507f1f77bcf86cd799439016"),
                "earned_at": ISODate("2024-01-11T12:00:00Z")
            }
        ],
        "followers_count": 567,
        "following_count": 234,
        "roles": ["USER"],
        "enabled": true,
        "created_at": ISODate("2023-10-15T00:00:00Z"),
        "updated_at": ISODate("2024-01-15T12:00:00Z"),
        "auth_provider": "LOCAL",
        "provider_id": null
    }
]);