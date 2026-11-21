package com.zendesk.mini.service;

import com.zendesk.mini.dto.user.CreateUserRequest;
import com.zendesk.mini.dto.user.UserRequest;
import com.zendesk.mini.dto.user.UserResponse;
import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.UserRole;
import com.zendesk.mini.exception.ConflictException;
import com.zendesk.mini.exception.ResourceNotFoundException;
import com.zendesk.mini.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return UserResponse.from(load(id));
    }

    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use: " + request.email());
        }
        UserEntity entity = new UserEntity();
        apply(entity, request);
        return UserResponse.from(userRepository.save(entity));
    }

    public UserResponse update(UUID id, UserRequest request) {
        UserEntity entity = load(id);
        if (userRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new ConflictException("Email already in use: " + request.email());
        }
        apply(entity, request);
        return UserResponse.from(userRepository.save(entity));
    }

    public void delete(UUID id) {
        userRepository.delete(load(id));
        userRepository.flush();
    }

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

    private UserEntity load(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private void apply(UserEntity entity, UserRequest request) {
        entity.setUserId(request.userId());
        entity.setName(request.name());
        entity.setEmail(request.email());
        entity.setPhoneNumber(request.phoneNumber());
        entity.setRole(request.role());
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
