package com.builds.digidocs.controller;

import com.builds.digidocs.dto.ChangePasswordRequest;
import com.builds.digidocs.dto.ProfileResponse;
import com.builds.digidocs.dto.RegisterRequest;
import com.builds.digidocs.dto.RegisterResponse;
import com.builds.digidocs.dto.UpdateProfileRequest;
import com.builds.digidocs.security.JwtService;
import com.builds.digidocs.service.UserService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;
    private final JwtService jwtService;

    public UserController(UserService service, JwtService jwtService) {
        this.service = service;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return service.register(request);
    }

    @GetMapping("/me")
    public ProfileResponse getProfile(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return service.getProfile(email);
    }

    @PutMapping("/profile")
    public ProfileResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return service.updateProfile(email, request);
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<String> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        service.uploadAvatar(email, file);
        return ResponseEntity.ok("Avatar uploaded successfully");
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<String> deleteAvatar(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        service.deleteAvatar(email);
        return ResponseEntity.ok("Avatar deleted successfully");
    }

    @GetMapping("/me/avatar")
    public ResponseEntity<Resource> getAvatar(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        Resource resource = service.getAvatar(email);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // Note: actual media type might be png or jpg, browser usually sniffs correctly
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @PutMapping("/change-password")
    public String changePassword(
    @Valid @RequestBody ChangePasswordRequest request,
    @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);

        String email = jwtService.extractEmail(token);

        service.changePassword(email, request);

        return "Password changed successfully";
}
}