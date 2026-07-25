package com.builds.digidocs.service;

import com.builds.digidocs.dto.RegisterRequest;
import com.builds.digidocs.dto.RegisterResponse;

public interface UserService {

    RegisterResponse register(RegisterRequest request);

}
