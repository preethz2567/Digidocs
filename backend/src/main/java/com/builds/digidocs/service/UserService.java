package com.builds.digidocs.service;

import com.builds.digidocs.dto.LoginRequest;
import com.builds.digidocs.dto.LoginResponse;
import com.builds.digidocs.dto.RegisterRequest;
import com.builds.digidocs.dto.RegisterResponse;

public interface UserService {

    RegisterResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);

}
