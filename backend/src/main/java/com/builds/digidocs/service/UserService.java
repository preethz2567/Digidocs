package com.builds.digidocs.service;

import com.builds.digidocs.dto.LoginRequest;
import com.builds.digidocs.dto.LoginResponse;
import com.builds.digidocs.dto.ProfileResponse;
import com.builds.digidocs.dto.RegisterRequest;
import com.builds.digidocs.dto.RegisterResponse;
import com.builds.digidocs.dto.ChangePasswordRequest;

public interface UserService {

    RegisterResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    ProfileResponse getProfile(String email);
    ProfileResponse updateProfile(String email, com.builds.digidocs.dto.UpdateProfileRequest request);
    void uploadAvatar(String email, org.springframework.web.multipart.MultipartFile file);
    void deleteAvatar(String email);
    org.springframework.core.io.Resource getAvatar(String email);
    void changePassword(String email, ChangePasswordRequest request);

}
