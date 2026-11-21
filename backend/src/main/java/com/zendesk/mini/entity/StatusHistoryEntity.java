package com.zendesk.mini.entity;

import com.zendesk.mini.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "status_history")
@Getter
@Setter
public class StatusHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private TicketEntity ticket;

    @Enumerated(EnumType.STRING)
    @Column(name = "prev_status", length = 30)
    private TicketStatus prevStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private TicketStatus newStatus;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;
}
