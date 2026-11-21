package com.zendesk.mini.service;

import com.zendesk.mini.dto.StatusHistoryRequest;
import com.zendesk.mini.dto.StatusHistoryResponse;
import com.zendesk.mini.entity.StatusHistoryEntity;
import com.zendesk.mini.entity.TicketEntity;
import com.zendesk.mini.exception.ResourceNotFoundException;
import com.zendesk.mini.repository.StatusHistoryRepository;
import com.zendesk.mini.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class StatusHistoryService {

    private final StatusHistoryRepository history;
    private final TicketRepository tickets;

    public StatusHistoryService(StatusHistoryRepository history, TicketRepository tickets) {
        this.history = history;
        this.tickets = tickets;
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> findAll(UUID ticketId) {
        List<StatusHistoryEntity> entities = ticketId == null
                ? history.findAllByOrderByTimestampAsc()
                : history.findByTicketIdOrderByTimestampAsc(ticketId);
        return entities.stream().map(StatusHistoryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public StatusHistoryResponse findById(UUID id) {
        return StatusHistoryResponse.from(load(id));
    }

    public StatusHistoryResponse create(StatusHistoryRequest request) {
        StatusHistoryEntity entity = new StatusHistoryEntity();
        entity.setTimestamp(Instant.now());
        apply(entity, request);
        return StatusHistoryResponse.from(history.save(entity));
    }

    public StatusHistoryResponse update(UUID id, StatusHistoryRequest request) {
        StatusHistoryEntity entity = load(id);
        apply(entity, request);
        return StatusHistoryResponse.from(history.save(entity));
    }

    public void delete(UUID id) {
        history.delete(load(id));
        history.flush();
    }

    private StatusHistoryEntity load(UUID id) {
        return history.findById(id).orElseThrow(() -> new ResourceNotFoundException("Status history", id));
    }

    /**
     * On create, a null timestamp defaults to now. On update, a null timestamp keeps the stored value.
     */
    private void apply(StatusHistoryEntity entity, StatusHistoryRequest request) {
        TicketEntity ticket = tickets.findById(request.ticketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", request.ticketId()));
        entity.setTicket(ticket);
        entity.setPrevStatus(request.prevStatus());
        entity.setNewStatus(request.newStatus());
        if (request.timestamp() != null) {
            entity.setTimestamp(request.timestamp());
        }
    }
}
