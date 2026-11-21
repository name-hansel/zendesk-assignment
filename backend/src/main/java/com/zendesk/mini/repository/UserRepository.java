package com.zendesk.mini.repository;

import com.zendesk.mini.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    boolean existsByEmail(String email);

    Optional<UserEntity> findByUserId(String userId);

    boolean existsByEmailAndIdNot(String email, UUID id);
}
