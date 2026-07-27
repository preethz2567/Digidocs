package com.builds.digidocs.controller;

import com.builds.digidocs.dto.ChangePasswordRequest;
import com.builds.digidocs.dto.ProfileResponse;
import com.builds.digidocs.dto.RegisterRequest;
import com.builds.digidocs.dto.RegisterResponse;
import com.builds.digidocs.security.JwtService;
import com.builds.digidocs.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

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