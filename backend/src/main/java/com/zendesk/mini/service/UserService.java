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

    private final UserRepository users;

    public UserService(UserRepository users) {
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return users.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return UserResponse.from(load(id));
    }

    public UserResponse create(UserRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use: " + request.email());
        }
        UserEntity entity = new UserEntity();
        apply(entity, request);
        return UserResponse.from(users.save(entity));
    }

    public UserResponse update(UUID id, UserRequest request) {
        UserEntity entity = load(id);
        if (users.existsByEmailAndIdNot(request.email(), id)) {
            throw new ConflictException("Email already in use: " + request.email());
        }
        apply(entity, request);
        return UserResponse.from(users.save(entity));
    }

    public void delete(UUID id) {
        users.delete(load(id));
        users.flush();
    }

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

        return users.save(user);
    }

    private UserEntity load(UUID id) {
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private void apply(UserEntity entity, UserRequest request) {
        entity.setUserId(request.userId());
        entity.setName(request.name());
        entity.setEmail(request.email());
        entity.setPhoneNumber(request.phoneNumber());
        entity.setRole(request.role());
    }
}
