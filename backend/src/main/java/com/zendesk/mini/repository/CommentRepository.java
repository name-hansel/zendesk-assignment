package com.zendesk.mini.repository;

import com.zendesk.mini.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<CommentEntity, UUID> {

    List<CommentEntity> findByTicketId(UUID ticketId);
}
