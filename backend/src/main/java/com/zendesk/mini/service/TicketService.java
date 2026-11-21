package com.zendesk.mini.service;

import com.zendesk.mini.dto.TicketRequest;
import com.zendesk.mini.dto.TicketResponse;
import com.zendesk.mini.entity.TicketEntity;
import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.TicketStatus;
import com.zendesk.mini.exception.ResourceNotFoundException;
import com.zendesk.mini.repository.TicketRepository;
import com.zendesk.mini.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TicketService {

    private final TicketRepository tickets;
    private final UserRepository users;

    public TicketService(TicketRepository tickets, UserRepository users) {
        this.tickets = tickets;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> findAll(TicketStatus status) {
        List<TicketEntity> entities = status == null ? tickets.findAll() : tickets.findByStatus(status);
        return entities.stream().map(TicketResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TicketResponse findById(UUID id) {
        return TicketResponse.from(load(id));
    }

    public TicketResponse create(TicketRequest request) {
        TicketEntity entity = new TicketEntity();
        apply(entity, request);
        return TicketResponse.from(tickets.save(entity));
    }

    public TicketResponse update(UUID id, TicketRequest request) {
        TicketEntity entity = load(id);
        apply(entity, request);
        return TicketResponse.from(tickets.save(entity));
    }

    public void delete(UUID id) {
        tickets.delete(load(id));
        tickets.flush();
    }

    private TicketEntity load(UUID id) {
        return tickets.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
    }

    /**
     * A null status keeps the current status on update (defaults to OPEN on create).
     * A null agentId unassigns the agent. closed_at is set when the ticket is CLOSED and cleared otherwise.
     */
    private void apply(TicketEntity entity, TicketRequest request) {
        entity.setSubject(request.subject());
        entity.setDescription(request.description());
        entity.setCustomer(loadUser(request.customerId()));
        entity.setAgent(request.agentId() == null ? null : loadUser(request.agentId()));
        if (request.status() != null) {
            entity.setStatus(request.status());
        }
        if (entity.getStatus() == TicketStatus.CLOSED) {
            if (entity.getClosedAt() == null) {
                entity.setClosedAt(Instant.now());
            }
        } else {
            entity.setClosedAt(null);
        }
    }

    private UserEntity loadUser(UUID id) {
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
