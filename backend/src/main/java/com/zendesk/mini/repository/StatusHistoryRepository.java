package com.zendesk.mini.repository;

import com.zendesk.mini.entity.StatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StatusHistoryRepository extends JpaRepository<StatusHistoryEntity, UUID> {

    List<StatusHistoryEntity> findByTicketIdOrderByTimestampAsc(UUID ticketId);

    List<StatusHistoryEntity> findAllByOrderByTimestampAsc();
}
