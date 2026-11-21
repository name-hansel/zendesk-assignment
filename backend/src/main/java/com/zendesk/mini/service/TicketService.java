package com.zendesk.mini.service;

import com.zendesk.mini.dto.ticket.CreateTicketRequest;
import com.zendesk.mini.dto.ticket.TicketResponse;
import com.zendesk.mini.dto.ticket.UpdateTicketRequest;
import com.zendesk.mini.entity.TicketEntity;
import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.TicketStatus;
import com.zendesk.mini.enums.UserRole;
import com.zendesk.mini.exception.CustomerNotFoundException;
import com.zendesk.mini.exception.ResourceNotFoundException;
import com.zendesk.mini.exception.UserNotCustomerException;
import com.zendesk.mini.repository.TicketRepository;
import com.zendesk.mini.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public List<TicketResponse> findAll(TicketStatus status) {
        List<TicketEntity> entities = status == null ? ticketRepository.findAll() : ticketRepository.findByStatus(status);
        return entities.stream().map(TicketResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TicketResponse findById(UUID id) {
        return TicketResponse.from(load(id));
    }

    @Transactional
    public TicketResponse create(CreateTicketRequest req) {
        boolean hasId = req.customerUuid() != null;

        UserEntity customer = hasId ? findCustomer(req.customerUuid()) : userService.createCustomer(req.customer());

        Instant now = Instant.now();
        TicketEntity ticket = new TicketEntity();
        ticket.setSubject(req.subject().trim());
        ticket.setDescription(req.description().trim());
        ticket.setCustomer(customer);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        ticketRepository.save(ticket);

//        StatusHistory history = new StatusHistory();
//        history.setId(UUID.randomUUID());
//        history.setTicketId(ticket.getId());
//        history.setPrevStatus(null);
//        history.setNewStatus("OPEN");
//        history.setTimestamp(now);
//        statusHistoryRepository.save(history);

        return TicketResponse.from(ticket);
    }

    @Transactional
    public TicketResponse update(UUID id, UpdateTicketRequest request) {
        TicketEntity ticket = load(id);
        ticket.setSubject(request.subject());
        ticket.setDescription(request.description());
        ticket.setAgent(request.agentId() == null ? null : loadUser(request.agentId()));
        if (request.status() != null) {
            ticket.setStatus(request.status());
        }
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            if (ticket.getClosedAt() == null) {
                ticket.setClosedAt(Instant.now());
            }
        } else {
            ticket.setClosedAt(null);
        }
        return TicketResponse.from(ticketRepository.saveAndFlush(ticket));
    }

    @Transactional
    public void delete(UUID id) {
        ticketRepository.delete(load(id));
        ticketRepository.flush();
    }

    private TicketEntity load(UUID id) {
        return ticketRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
    }

    private UserEntity loadUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private UserEntity findCustomer(UUID id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
        if (user.getRole() != UserRole.CUSTOMER) {
            throw new UserNotCustomerException(id);
        }
        return user;
    }
}
