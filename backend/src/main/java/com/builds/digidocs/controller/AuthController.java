package com.builds.digidocs.controller;

import com.builds.digidocs.dto.LoginRequest;
import com.builds.digidocs.dto.LoginResponse;
import com.builds.digidocs.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }
}