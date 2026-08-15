package com.builds.digidocs.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

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
import com.builds.digidocs.service.StorageService;
import com.builds.digidocs.exception.StorageException;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder;
    private final StorageService storageService;

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    public UserServiceImpl(UserRepository repository,
                           JwtService jwtService,
                           BCryptPasswordEncoder encoder,
                           StorageService storageService) {
        this.repository = repository;
        this.jwtService = jwtService;
        this.encoder = encoder;
        this.storageService = storageService;
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
            if (user.getProfileImage() != null) {
                try {
                    storageService.delete(user.getProfileImage());
                } catch (StorageException e) {
                    logger.warn("Could not delete old avatar for user {}: {}", email, e.getMessage());
                }
            }

            String storageKey = "profile-images/" + user.getId() + "/" + UUID.randomUUID().toString();
            storageService.upload(storageKey, file.getInputStream(), file.getSize(), file.getContentType());

            user.setProfileImage(storageKey);
            repository.save(user);

            logger.info("Avatar uploaded for user: {}", email);
        } catch (Exception e) {
            logger.error("Failed to upload avatar", e);
            throw new RuntimeException("Failed to upload avatar", e);
        }
    }

    @Override
    public void deleteAvatar(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.getProfileImage() != null) {
            try {
                storageService.delete(user.getProfileImage());
                user.setProfileImage(null);
                repository.save(user);
                logger.info("Avatar deleted for user: {}", email);
            } catch (Exception e) {
                logger.error("Failed to delete avatar", e);
                throw new RuntimeException("Failed to delete avatar", e);
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
            return storageService.download(user.getProfileImage());
        } catch (StorageException e) {
            logger.error("Failed to get avatar", e);
            throw new RuntimeException("File not found", e);
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
