package com.zendesk.mini.service;

import com.zendesk.mini.dto.user.CreateUserRequest;
import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.UserRole;
import com.zendesk.mini.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class UserService {

    private UserRepository userRepository;

    public UserEntity createCustomer(CreateUserRequest request) {
        UUID id = UUID.randomUUID();
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setUserId("CUS-" + id.toString().replace("-", "").substring(0, 12));
        user.setName(request.name().trim());
        user.setEmail(request.email());
        user.setPhoneNumber(request.phoneNumber());
        user.setRole(UserRole.CUSTOMER);
        user.setCreatedAt(Instant.now());

        return userRepository.save(user);
    }
}
