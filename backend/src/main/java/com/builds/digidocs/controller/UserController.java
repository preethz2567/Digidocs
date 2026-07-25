package com.builds.digidocs.controller;

import com.builds.digidocs.dto.RegisterRequest;
import com.builds.digidocs.dto.RegisterResponse;
import com.builds.digidocs.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return service.register(request);
    }
}