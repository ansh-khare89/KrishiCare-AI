package com.krishicare.backend.util;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Set;

public final class ImageValidator {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final byte[] JPEG = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] WEBP_RIFF = new byte[]{0x52, 0x49, 0x46, 0x46};
    private static final byte[] WEBP_MAGIC = new byte[]{0x57, 0x45, 0x42, 0x50};

    private ImageValidator() {}

    public static void validate(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalStateException("Uploaded image file is empty.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalStateException("Only JPEG, PNG, and WebP images are allowed.");
        }

        byte[] header = file.getBytes();
        if (header.length < 12) {
            throw new IllegalStateException("Image file is too small or corrupted.");
        }

        if (!matchesMagicBytes(header)) {
            throw new IllegalStateException("File content does not match a supported image format.");
        }
    }

    private static boolean matchesMagicBytes(byte[] data) {
        return startsWith(data, JPEG)
                || startsWith(data, PNG)
                || (startsWith(data, WEBP_RIFF) && indexOf(data, WEBP_MAGIC, 8) >= 0);
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }

    private static int indexOf(byte[] data, byte[] pattern, int from) {
        for (int i = from; i <= data.length - pattern.length; i++) {
            boolean match = true;
            for (int j = 0; j < pattern.length; j++) {
                if (data[i + j] != pattern[j]) {
                    match = false;
                    break;
                }
            }
            if (match) return i;
        }
        return -1;
    }
}
