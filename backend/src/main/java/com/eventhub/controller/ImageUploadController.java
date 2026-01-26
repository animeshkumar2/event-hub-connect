package com.eventhub.controller;

import com.eventhub.service.ImageUploadService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class ImageUploadController {

    private static final Logger logger = LoggerFactory.getLogger(ImageUploadController.class);

    private final ImageUploadService imageUploadService;

    public ImageUploadController(ImageUploadService imageUploadService) {
        this.imageUploadService = imageUploadService;
    }

    /**
     * Upload a single image
     * @param file The image file
     * @param folder The folder path (e.g., "vendors/profiles", "listings/items")
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "uploads") String folder) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String url = imageUploadService.uploadImage(file, sanitizeFolder(folder));
            response.put("success", true);
            response.put("url", url);
            response.put("message", "Image uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid image upload: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Image upload failed", e);
            response.put("success", false);
            response.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Upload multiple images
     */
    @PostMapping("/images")
    public ResponseEntity<Map<String, Object>> uploadMultipleImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folder", defaultValue = "uploads") String folder) {
        
        Map<String, Object> response = new HashMap<>();
        List<String> urls = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        String sanitizedFolder = sanitizeFolder(folder);
        
        for (MultipartFile file : files) {
            try {
                String url = imageUploadService.uploadImage(file, sanitizedFolder);
                urls.add(url);
            } catch (Exception e) {
                logger.error("Failed to upload file: {}", file.getOriginalFilename(), e);
                errors.add(file.getOriginalFilename() + ": " + e.getMessage());
            }
        }
        
        response.put("success", errors.isEmpty());
        response.put("urls", urls);
        response.put("uploadedCount", urls.size());
        response.put("totalCount", files.length);
        
        if (!errors.isEmpty()) {
            response.put("errors", errors);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Upload vendor profile image
     */
    @PostMapping("/vendor/profile")
    public ResponseEntity<Map<String, Object>> uploadVendorProfileImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("vendorId") String vendorId) {
        
        String folder = "vendors/" + vendorId + "/profile";
        return uploadImage(file, folder);
    }

    /**
     * Upload vendor cover image
     */
    @PostMapping("/vendor/cover")
    public ResponseEntity<Map<String, Object>> uploadVendorCoverImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("vendorId") String vendorId) {
        
        String folder = "vendors/" + vendorId + "/cover";
        return uploadImage(file, folder);
    }

    /**
     * Upload vendor portfolio images
     */
    @PostMapping("/vendor/portfolio")
    public ResponseEntity<Map<String, Object>> uploadVendorPortfolioImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("vendorId") String vendorId) {
        
        String folder = "vendors/" + vendorId + "/portfolio";
        return uploadMultipleImages(files, folder);
    }

    /**
     * Upload listing images
     */
    @PostMapping("/listing")
    public ResponseEntity<Map<String, Object>> uploadListingImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("listingId") String listingId,
            @RequestParam(value = "type", defaultValue = "item") String type) {
        
        String folder = "listings/" + type + "/" + listingId;
        return uploadMultipleImages(files, folder);
    }

    /**
     * Delete an image
     */
    @DeleteMapping("/image")
    public ResponseEntity<Map<String, Object>> deleteImage(@RequestParam("url") String url) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            imageUploadService.deleteImage(url);
            response.put("success", true);
            response.put("message", "Image deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Image deletion failed", e);
            response.put("success", false);
            response.put("message", "Failed to delete image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Sanitize folder path to prevent directory traversal
     */
    private String sanitizeFolder(String folder) {
        if (folder == null) return "uploads";
        // Remove any path traversal attempts and normalize
        return folder.replaceAll("\\.\\.", "")
                     .replaceAll("//+", "/")
                     .replaceAll("^/+", "")
                     .replaceAll("/+$", "");
    }
}
