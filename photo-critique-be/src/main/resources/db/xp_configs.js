// script-seed-xp-configs.js
// Insert XP configuration data for all event types

db.xp_configs.deleteMany({});

db.xp_configs.insertMany([
    // POST Category
    {
        event_type: "POST_CREATED",
        name: "Post Created",
        points: 10,
        description: "XP awarded for creating a new post",
        is_active: true,
        category: "POST",
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        event_type: "POST_LIKED",
        name: "Post Liked",
        points: 5,
        description: "XP awarded when your post receives a like",
        is_active: true,
        category: "POST",
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        event_type: "POST_TRENDING",
        name: "Post Trending",
        points: 50,
        description: "XP awarded when your post becomes trending",
        is_active: true,
        category: "POST",
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
    },
    
    // COMMENT Category
    {
        event_type: "COMMENT_HELPFUL",
        name: "Comment Helpful",
        points: 15,
        description: "XP awarded when your comment is marked as helpful",
        is_active: true,
        category: "COMMENT",
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        event_type: "COMMENT_LIKED",
        name: "Comment Liked",
        points: 3,
        description: "XP awarded when your comment receives a like",
        is_active: true,
        category: "COMMENT",
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
    },
    
    // SOCIAL Category
    {
        event_type: "FOLLOW_GAINED",
        name: "Follow Gained",
        points: 20,
        description: "XP awarded when you gain a new follower",
        is_active: true,
        category: "SOCIAL",
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
    },
    
    // ACHIEVEMENT Category
    {
        event_type: "BADGE_EARNED",
        name: "Badge Earned",
        points: 100,
        description: "XP awarded when you earn a badge",
        is_active: true,
        category: "ACHIEVEMENT",
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
    }
]);

print("XP configs seeded successfully!");

