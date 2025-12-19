// script-seed-tags.js

// Helper function to generate slug from name (similar to SlugUtil.toSlug)
function toSlug(input) {
    if (!input || input.trim() === "") {
        return "";
    }
    
    // Normalize and remove diacritical marks
    let normalized = input.trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
        .toLowerCase();
    
    // Replace whitespace with dashes
    normalized = normalized.replace(/\s+/g, "-");
    
    // Remove non-word characters (keep only alphanumeric and dashes)
    normalized = normalized.replace(/[^\w-]/g, "");
    
    // Replace multiple consecutive dashes with single dash
    normalized = normalized.replace(/-+/g, "-");
    
    // Remove dashes from edges
    normalized = normalized.replace(/^-+|-+$/g, "");
    
    return normalized;
}

// Clear existing tags (optional - comment out if you want to keep existing data)
// db.tags.deleteMany({});

// Helper function to generate random number between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Sample tags data
const tagsData = [
    {
        name: "landscapephotography",
        description: "Beautiful landscapes and scenic views"
    },
    {
        name: "portraitmode",
        description: "Portrait photography and people"
    },
    {
        name: "streetstyle",
        description: "Street photography and urban life"
    },
    {
        name: "blackandwhite",
        description: "Black and white photography"
    },
    {
        name: "nightsky",
        description: "Night photography and astrophotography"
    },
    {
        name: "nature",
        description: "Nature and wildlife photography"
    },
    {
        name: "architecture",
        description: "Architectural photography"
    },
    {
        name: "foodphotography",
        description: "Food and culinary photography"
    },
    {
        name: "travel",
        description: "Travel and adventure photography"
    },
    {
        name: "fashion",
        description: "Fashion and style photography"
    },
    {
        name: "wedding",
        description: "Wedding photography"
    },
    {
        name: "macro",
        description: "Macro photography"
    },
    {
        name: "sports",
        description: "Sports photography"
    },
    {
        name: "wildlife",
        description: "Wildlife photography"
    },
    {
        name: "abstract",
        description: "Abstract photography"
    },
    {
        name: "vintage",
        description: "Vintage and retro photography"
    },
    {
        name: "minimalist",
        description: "Minimalist photography"
    },
    {
        name: "urban",
        description: "Urban and city photography"
    },
    {
        name: "seascape",
        description: "Seascape and ocean photography"
    },
    {
        name: "sunset",
        description: "Sunset and sunrise photography"
    },
    {
        name: "portrait",
        description: "Portrait photography"
    },
    {
        name: "documentary",
        description: "Documentary photography"
    },
    {
        name: "fineart",
        description: "Fine art photography"
    },
    {
        name: "commercial",
        description: "Commercial photography"
    },
    {
        name: "product",
        description: "Product photography"
    },
    {
        name: "event",
        description: "Event photography"
    },
    {
        name: "aerial",
        description: "Aerial and drone photography"
    },
    {
        name: "underwater",
        description: "Underwater photography"
    },
    {
        name: "astrophotography",
        description: "Astrophotography"
    },
    {
        name: "cinematic",
        description: "Cinematic photography"
    }
];

// Generate slugs and random post_count for tags
tagsData.forEach(tag => {
    if (!tag.slug || tag.slug === "") {
        tag.slug = toSlug(tag.name);
    }
    // Random post_count between 0 and 1000
    tag.post_count = randomInt(0, 1000);
    tag.created_at = new Date();
    tag.updated_at = new Date();
});

// Insert tags (skip duplicates based on name or slug)
tagsData.forEach(tag => {
    const existingByName = db.tags.findOne({ name: tag.name });
    const existingBySlug = db.tags.findOne({ slug: tag.slug });
    
    if (!existingByName && !existingBySlug) {
        db.tags.insertOne(tag);
        print("Inserted tag: " + tag.name + " (slug: " + tag.slug + ", posts: " + tag.post_count + ")");
    } else {
        print("Skipped tag (already exists): " + tag.name);
    }
});

print("\nTags insertion completed!");

