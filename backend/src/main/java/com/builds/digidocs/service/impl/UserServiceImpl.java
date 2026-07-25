package com.builds.digidocs.service.impl;

import com.builds.digidocs.dto.RegisterRequest;
import com.builds.digidocs.dto.RegisterResponse;
import com.builds.digidocs.dto.LoginRequest;
import com.builds.digidocs.dto.LoginResponse;
import com.builds.digidocs.entity.User;
import com.builds.digidocs.repository.UserRepository;
import com.builds.digidocs.security.JwtService;
import com.builds.digidocs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;

    private final JwtService jwtService;

    private final BCryptPasswordEncoder encoder;

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
        throw new RuntimeException("Invalid email or password");
    }

    String token = jwtService.generateToken(user.getEmail());

    return new LoginResponse(token);
}
}