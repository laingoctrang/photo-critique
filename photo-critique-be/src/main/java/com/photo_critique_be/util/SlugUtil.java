package com.photo_critique_be.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility class for converting strings to URL-friendly slugs
 */
public class SlugUtil {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGES_DASHES = Pattern.compile("(^-|-$)");
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-+");

    /**
     * Converts a string to a URL-friendly slug
     * 
     * "Hello World" -> "hello-world"
     * "Café & Restaurant" -> "cafe-restaurant"
     * "Tag Name!!!" -> "tag-name"
     * "  Multiple   Spaces  " -> "multiple-spaces"
     * 
     * @param input the string to convert
     * @return the slug version of the input string
     */
    public static String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }

        // Normalize Vietnamese and other Unicode characters
        String normalized = Normalizer.normalize(input.trim(), Normalizer.Form.NFD);
        
        // Remove diacritical marks (accents)
        normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        
        // Convert to lowercase
        normalized = normalized.toLowerCase(Locale.ENGLISH);
        
        // Replace whitespace with dashes
        normalized = WHITESPACE.matcher(normalized).replaceAll("-");
        
        // Remove non-word characters (keep only alphanumeric and dashes)
        normalized = NON_LATIN.matcher(normalized).replaceAll("");
        
        // Replace multiple consecutive dashes with single dash
        normalized = MULTIPLE_DASHES.matcher(normalized).replaceAll("-");
        
        // Remove dashes from edges
        normalized = EDGES_DASHES.matcher(normalized).replaceAll("");
        
        return normalized;
    }
}


