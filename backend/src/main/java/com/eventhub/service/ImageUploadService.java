package com.eventhub.service;

import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

@Service
public class ImageUploadService {

    private static final Logger logger = LoggerFactory.getLogger(ImageUploadService.class);

    private final S3Client s3Client;

    @Value("${r2.bucket-name}")
    private String bucketName;

    @Value("${r2.public-url}")
    private String publicUrl;

    @Value("${r2.max-width:1920}")
    private int maxWidth;

    @Value("${r2.max-height:1080}")
    private int maxHeight;

    @Value("${r2.compression-quality:0.85}")
    private double compressionQuality;

    public ImageUploadService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Upload an image to R2 with compression
     * @param file The image file to upload
     * @param folder The folder path (e.g., "vendors/profiles", "listings/items")
     * @return The public URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        validateImage(file);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String originalExtension = getExtension(originalFilename);
        
        // Convert PNG to JPG for better compression
        String finalExtension = originalExtension.equalsIgnoreCase("png") ? "jpg" : originalExtension;
        String filename = UUID.randomUUID().toString() + "." + finalExtension;
        String key = folder + "/" + filename;

        // Compress image
        byte[] compressedImage = compressImage(file, originalExtension);

        // Upload to R2
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(getContentType(finalExtension))
                .build();

        s3Client.putObject(putRequest, RequestBody.fromBytes(compressedImage));

        String imageUrl = publicUrl + "/" + key;
        logger.info("Image uploaded successfully: {} (original: {}KB, compressed: {}KB, reduction: {}%)",
                imageUrl,
                file.getSize() / 1024,
                compressedImage.length / 1024,
                Math.round((1 - (double) compressedImage.length / file.getSize()) * 100));

        return imageUrl;
    }

    /**
     * Upload an image from base64 string (for migration of existing data)
     */
    public String uploadBase64Image(String base64Data, String folder) throws IOException {
        // Extract the actual base64 content and mime type
        String[] parts = base64Data.split(",");
        String base64Content = parts.length > 1 ? parts[1] : parts[0];
        String mimeType = "image/jpeg";
        if (parts.length > 1 && parts[0].contains("image/")) {
            mimeType = parts[0].split(":")[1].split(";")[0];
        }

        // Decode base64
        byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Content);

        // Generate unique filename
        String extension = mimeType.split("/")[1];
        if (extension.equals("jpeg")) extension = "jpg";
        String filename = UUID.randomUUID().toString() + "." + extension;
        String key = folder + "/" + filename;

        // Compress image
        byte[] compressedImage = compressImageBytes(imageBytes, extension);

        // Upload to R2
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(mimeType)
                .build();

        s3Client.putObject(putRequest, RequestBody.fromBytes(compressedImage));

        String imageUrl = publicUrl + "/" + key;
        logger.info("Base64 image uploaded: {} (original: {}KB, compressed: {}KB)",
                imageUrl,
                imageBytes.length / 1024,
                compressedImage.length / 1024);

        return imageUrl;
    }

    /**
     * Delete an image from R2
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith(publicUrl)) {
            return;
        }

        String key = imageUrl.replace(publicUrl + "/", "");

        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.deleteObject(deleteRequest);
        logger.info("Image deleted: {}", imageUrl);
    }

    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Block SVG (security risk - can contain scripts) and other non-raster formats
        String extension = getExtension(file.getOriginalFilename()).toLowerCase();
        if (extension.equals("svg") || extension.equals("svgz")) {
            throw new IllegalArgumentException("SVG files are not allowed for security reasons. Please upload JPG, PNG, or WebP.");
        }

        // Max 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Image must be less than 10MB");
        }
    }

    private byte[] compressImage(MultipartFile file, String extension) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Convert all formats to JPEG for consistent compression
        // (PNG, GIF, BMP, TIFF, WebP → JPEG)
        String outputFormat = "jpeg";

        try {
            // First try to read the image to verify it's valid
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IOException("Unable to read image. Format may not be supported. Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF");
            }
            
            // Reset stream and compress
            Thumbnails.of(file.getInputStream())
                    .size(maxWidth, maxHeight)
                    .keepAspectRatio(true)
                    .outputQuality(compressionQuality)
                    .outputFormat(outputFormat)
                    .toOutputStream(outputStream);
        } catch (javax.imageio.IIOException e) {
            // Provide helpful error message for unsupported formats
            String supportedFormats = String.join(", ", Arrays.asList(ImageIO.getReaderFormatNames()));
            throw new IOException("Unable to process image format '" + extension + "'. Supported formats: " + supportedFormats, e);
        }

        return outputStream.toByteArray();
    }

    private byte[] compressImageBytes(byte[] imageBytes, String extension) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ByteArrayInputStream inputStream = new ByteArrayInputStream(imageBytes);

        // Convert all formats to JPEG
        String outputFormat = "jpeg";

        try {
            // First verify the image can be read
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (image == null) {
                throw new IOException("Unable to read image data. Format may not be supported.");
            }
            
            Thumbnails.of(inputStream)
                    .size(maxWidth, maxHeight)
                    .keepAspectRatio(true)
                    .outputQuality(compressionQuality)
                    .outputFormat(outputFormat)
                    .toOutputStream(outputStream);
        } catch (javax.imageio.IIOException e) {
            throw new IOException("Unable to process image format '" + extension + "'", e);
        }

        return outputStream.toByteArray();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        // Normalize extensions
        if (ext.equals("jpeg")) return "jpg";
        return ext;
    }

    private String getContentType(String extension) {
        return switch (extension.toLowerCase()) {
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }
}
