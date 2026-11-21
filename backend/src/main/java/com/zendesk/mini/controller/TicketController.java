package com.zendesk.mini.controller;

import com.zendesk.mini.dto.ticket.CreateTicketRequest;
import com.zendesk.mini.dto.ticket.TicketResponse;
import com.zendesk.mini.dto.ticket.UpdateTicketRequest;
import com.zendesk.mini.enums.TicketStatus;
import com.zendesk.mini.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public List<TicketResponse> list(@RequestParam(required = false) TicketStatus status) {
        return ticketService.findAll(status);
    }

    @GetMapping("/{id}")
    public TicketResponse get(@PathVariable UUID id) {
        return ticketService.findById(id);
    }

    @PostMapping
    public ResponseEntity<TicketResponse> create(@RequestBody CreateTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.create(request));
    }

    @PutMapping("/{id}")
    public TicketResponse update(@PathVariable UUID id, @RequestBody @Valid UpdateTicketRequest request) {
        return ticketService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ticketService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customer/{customerId}")
    public List<TicketResponse> getByCustomer(@PathVariable String customerId) {
        return ticketService.getTicketsByCustomer(customerId);
    }
}
