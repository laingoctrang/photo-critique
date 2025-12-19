package com.photo_critique_be.util;

import org.springframework.stereotype.Component;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Random;

@Component
public class AvatarUtil {

    // List style from DiceBear API
    private static final List<String> DICEBEAR_STYLES = List.of(
            "adventurer", "adventurer-neutral", "avataaars", "big-ears",
            "big-ears-neutral", "big-smile", "bottts", "croodles",
            "croodles-neutral", "fun-emoji", "icons", "identicon",
            "initials", "lorelei", "lorelei-neutral", "micah",
            "miniavs", "open-peeps", "personas", "pixel-art",
            "pixel-art-neutral", "shapes", "thumbs"
    );

    // list palette color from coolors.co
    private static final List<List<String>> COLOR_PALETTES = List.of(
            // Palette 1: Pastel
            List.of("b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"),
            // Palette 2: Retro
            List.of("ffadad", "ffd6a5", "fdffb6", "caffbf", "9bf6ff"),
            // Palette 3: Earth tones
            List.of("d4a276", "e07a5f", "81b29a", "f2cc8f", "f4f1de"),
            // Palette 4: Cool tones
            List.of("8ecae6", "219ebc", "023047", "ffb703", "fb8500"),
            // Palette 5: Berry
            List.of("ffafcc", "ffc8dd", "cdb4db", "a2d2ff", "bde0fe"),
            // Palette 6: Monochrome
            List.of("f8f9fa", "e9ecef", "dee2e6", "ced4da", "adb5bd"),
            // Palette 7: Vivid
            List.of("ff595e", "ffca3a", "8ac926", "1982c4", "6a4c93"),
            // Palette 8: Sunset
            List.of("ff9b85", "ffb26b", "ffd56b", "a3de83", "2d936c"),
            // Palette 9: Ocean
            List.of("03045e", "0077b6", "00b4d8", "90e0ef", "caf0f8"),
            // Palette 10: Forest
            List.of("386641", "6a994e", "a7c957", "f2e8cf", "bc4749")
    );

    // background
    private static final List<String> BACKGROUND_TYPES = List.of(
            "solid", "gradientLinear", "gradientRadial"
    );

    public String generateRandomAvatar(String seedData) {
        try {
            // Tạo hash từ seedData để có randomness nhưng vẫn consistent
            String hash = generateHash(seedData);
            long seed = hash.hashCode();

            Random seededRandom = new Random(seed);

            // Random các tham số
            String style = getRandomStyle(seededRandom);
            List<String> colors = getRandomColorPalette(seededRandom);
            String backgroundType = getRandomBackgroundType(seededRandom);
            boolean randomizeIds = seededRandom.nextBoolean();
            float scale = 80 + seededRandom.nextFloat() * 40; // 80-120%
            float radius = seededRandom.nextFloat() * 50; // 0-50%

            // Xây dựng URL
            StringBuilder url = new StringBuilder();
            url.append("https://api.dicebear.com/7.x/")
                    .append(style)
                    .append("/svg?seed=")
                    .append(seedData)
                    .append("-")
                    .append(hash.substring(0, 6));

            // Thêm màu sắc
            if (!colors.isEmpty()) {
                url.append("&backgroundColor=");
                for (int i = 0; i < Math.min(3, colors.size()); i++) {
                    if (i > 0) url.append(",");
                    url.append(colors.get(i));
                }
            }

            // Thêm các tham số ngẫu nhiên
            url.append("&backgroundType=").append(backgroundType);

            if (randomizeIds) {
                url.append("&randomizeIds=true");
            }

            if (Math.abs(scale - 100) > 5) {
                url.append("&scale=").append((int) scale);
            }

            if (radius > 0) {
                url.append("&radius=").append((int) radius);
            }

            // Thêm các tham số đặc biệt cho từng style
            addStyleSpecificParams(url, style, seededRandom);

            return url.toString();

        } catch (Exception e) {
            // Fallback URL nếu có lỗi
            return generateFallbackAvatar(seedData);
        }
    }

    private String generateHash(String input) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(input.getBytes());
        StringBuilder hexString = new StringBuilder();
        for (byte b : hashBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    private String getRandomStyle(Random random) {
        return DICEBEAR_STYLES.get(random.nextInt(DICEBEAR_STYLES.size()));
    }

    private List<String> getRandomColorPalette(Random random) {
        return COLOR_PALETTES.get(random.nextInt(COLOR_PALETTES.size()));
    }

    private String getRandomBackgroundType(Random random) {
        return BACKGROUND_TYPES.get(random.nextInt(BACKGROUND_TYPES.size()));
    }

    private void addStyleSpecificParams(StringBuilder url, String style, Random random) {
        switch (style) {
            case "avataaars":
            case "adventurer":
                if (random.nextBoolean()) {
                    url.append("&mouth=").append(getRandomValue(random, "variant01", "variant02", "variant03", "variant04"));
                }
                if (random.nextBoolean()) {
                    url.append("&eyes=").append(getRandomValue(random, "variant01", "variant02", "variant03", "variant04"));
                }
                break;
            case "micah":
                url.append("&hair=").append(getRandomValue(random, "variant01", "variant02", "variant03"));
                url.append("&shirt=").append(getRandomValue(random, "variant01", "variant02"));
                break;
            case "bottts":
                url.append("&textureChance=").append(random.nextInt(100));
                break;
            case "lorelei":
                url.append("&hairColor=").append(getRandomValue(random, "0e0e0e", "3eac2c", "6a4e35"));
                break;
        }
    }

    private String getRandomValue(Random random, String... values) {
        return values[random.nextInt(values.length)];
    }

    private String generateFallbackAvatar(String userId) {
        return String.format(
                "https://api.dicebear.com/7.x/avataaars/svg?seed=%s&backgroundColor=b6e3f4,c0aede,d1d4f9",
                userId
        );
    }
}
