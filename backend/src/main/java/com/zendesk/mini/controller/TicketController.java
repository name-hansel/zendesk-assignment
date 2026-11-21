package com.zendesk.mini.controller;

import com.zendesk.mini.dto.ticket.CreateTicketRequest;
import com.zendesk.mini.dto.ticket.TicketResponse;
import com.zendesk.mini.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> create(@RequestBody CreateTicketRequest request) {
        TicketResponse created = ticketService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
