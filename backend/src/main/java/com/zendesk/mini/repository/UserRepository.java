package com.zendesk.mini.repository;

import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    boolean existsByEmail(String email);

    Optional<UserEntity> findByUserId(String userId);

    boolean existsByEmailAndIdNot(String email, UUID id);

    List<UserEntity> findByRole(UserRole role);
}
