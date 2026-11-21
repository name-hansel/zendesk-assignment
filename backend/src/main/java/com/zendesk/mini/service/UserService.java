package com.zendesk.mini.service;

import com.zendesk.mini.dto.user.CreateUserRequest;
import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.UserRole;
import com.zendesk.mini.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserEntity createCustomer(CreateUserRequest request) {
        UserEntity user = new UserEntity();
        user.setUserId(generateUserId(request.name()));
        user.setName(request.name().trim());
        user.setEmail(request.email());
        user.setPhoneNumber(request.phoneNumber());
        user.setRole(UserRole.CUSTOMER);
        user.setCreatedAt(Instant.now());

        return userRepository.save(user);
    }

    private String generateUserId(String name) {
        String slug = name.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        if (slug.length() > 25) {
            slug = slug.substring(0, 25);
        }
        String suffix = UUID.randomUUID().toString().substring(0, 6);
        return slug + "-" + suffix;   // e.g. "asha-sharma-4f2a9c"
    }
}
