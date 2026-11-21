package com.zendesk.mini.repository;

import com.zendesk.mini.entity.TicketEntity;
import com.zendesk.mini.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<TicketEntity, UUID> {

    List<TicketEntity> findByCustomer_IdOrderByCreatedAtDesc(UUID customerId);

    List<TicketEntity> findByStatus(TicketStatus status);
}
