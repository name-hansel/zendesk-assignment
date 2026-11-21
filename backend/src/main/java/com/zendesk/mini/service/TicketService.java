package com.zendesk.mini.service;

import com.zendesk.mini.dto.ticket.CreateTicketRequest;
import com.zendesk.mini.dto.ticket.TicketResponse;
import com.zendesk.mini.entity.TicketEntity;
import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.enums.TicketStatus;
import com.zendesk.mini.enums.UserRole;
import com.zendesk.mini.exception.CustomerNotFoundException;
import com.zendesk.mini.exception.UserNotCustomerException;
import com.zendesk.mini.repository.TicketRepository;
import com.zendesk.mini.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    @Transactional
    public TicketResponse create(CreateTicketRequest req) {
        boolean hasId = req.customerUuid() != null;

        UserEntity customer = hasId ? findCustomer(req.customerUuid()) : userService.createCustomer(req.user());

        Instant now = Instant.now();
        TicketEntity ticket = new TicketEntity();
        ticket.setId(UUID.randomUUID());
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

        return TicketResponse.from(ticket, customer);
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
