package com.builds.digidocs.service.impl;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.builds.digidocs.dto.ChangePasswordRequest;
import com.builds.digidocs.dto.LoginRequest;
import com.builds.digidocs.dto.LoginResponse;
import com.builds.digidocs.dto.ProfileResponse;
import com.builds.digidocs.dto.RegisterRequest;
import com.builds.digidocs.dto.RegisterResponse;
import com.builds.digidocs.dto.UpdateProfileRequest;
import com.builds.digidocs.entity.User;
import com.builds.digidocs.exception.InvalidRequestException;
import com.builds.digidocs.exception.UnauthorizedException;
import com.builds.digidocs.exception.UserNotFoundException;
import com.builds.digidocs.repository.UserRepository;
import com.builds.digidocs.security.JwtService;
import com.builds.digidocs.service.UserService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.net.MalformedURLException;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repository;

    private final JwtService jwtService;
    private static final Logger logger =
        LoggerFactory.getLogger(UserServiceImpl.class);

    private final BCryptPasswordEncoder encoder;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public UserServiceImpl(UserRepository repository,
                       JwtService jwtService,
                       BCryptPasswordEncoder encoder) {
    this.repository = repository;
    this.jwtService = jwtService;
    this.encoder = encoder;
}

    @Override
    public RegisterResponse register(RegisterRequest request) {

        if(repository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        User saved = repository.save(user);
        
        logger.info("User registered: {}", saved.getEmail());

        return new RegisterResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail()
        );
    }

    @Override
public LoginResponse login(LoginRequest request) {

    User user = repository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));

    if (!encoder.matches(request.getPassword(), user.getPassword())) {
        throw new UnauthorizedException("Invalid email or password");
    }

    String token = jwtService.generateToken(user.getEmail());

    logger.info("User logged in: {}", user.getEmail());

    return new LoginResponse(token);
}

@Override
public ProfileResponse getProfile(String email) {

    User user = repository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

    return new ProfileResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getProfileImage()
    );
}

@Override
public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
    User user = repository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

    user.setName(request.getName());
    repository.save(user);

    logger.info("Profile updated for user: {}", email);

    return new ProfileResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getProfileImage()
    );
}

@Override
public void uploadAvatar(String email, MultipartFile file) {
    if (file.isEmpty()) {
        throw new InvalidRequestException("File cannot be empty");
    }

    String contentType = file.getContentType();
    if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/jpg"))) {
        throw new InvalidRequestException("Only JPG/PNG images are allowed");
    }

    if (file.getSize() > 5 * 1024 * 1024) {
        throw new InvalidRequestException("Maximum file size is 5 MB");
    }

    User user = repository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

    try {
        Path uploadPath = Paths.get(uploadDir, "profile-images");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Delete old avatar if it exists
        if (user.getProfileImage() != null) {
            Path oldFile = uploadPath.resolve(user.getProfileImage());
            Files.deleteIfExists(oldFile);
        }

        // Save new avatar
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        user.setProfileImage(filename);
        repository.save(user);

        logger.info("Avatar uploaded for user: {}", email);
    } catch (Exception e) {
        logger.error("Failed to upload avatar", e);
        throw new RuntimeException("Failed to upload avatar");
    }
}

@Override
public void deleteAvatar(String email) {
    User user = repository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

    if (user.getProfileImage() != null) {
        try {
            Path filePath = Paths.get(uploadDir, "profile-images", user.getProfileImage());
            Files.deleteIfExists(filePath);
            user.setProfileImage(null);
            repository.save(user);
            logger.info("Avatar deleted for user: {}", email);
        } catch (Exception e) {
            logger.error("Failed to delete avatar", e);
            throw new RuntimeException("Failed to delete avatar");
        }
    }
}

@Override
public Resource getAvatar(String email) {
    User user = repository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

    if (user.getProfileImage() == null) {
        throw new InvalidRequestException("No avatar found");
    }

    try {
        Path filePath = Paths.get(uploadDir, "profile-images", user.getProfileImage());
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("File not found");
        }
    } catch (MalformedURLException e) {
        throw new RuntimeException("File not found");
    }
}

@Override
public void changePassword(String email, ChangePasswordRequest request) {

    User user = repository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (!encoder.matches(
            request.getCurrentPassword(),
            user.getPassword())) {

        throw new UnauthorizedException("Current password is incorrect");
    }

    user.setPassword(
            encoder.encode(request.getNewPassword())
    );

    repository.save(user);
    logger.info("Password changed for user: {}", user.getEmail());
}
}