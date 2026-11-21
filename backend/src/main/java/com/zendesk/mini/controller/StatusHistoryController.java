package com.zendesk.mini.controller;

import com.zendesk.mini.dto.StatusHistoryRequest;
import com.zendesk.mini.dto.StatusHistoryResponse;
import com.zendesk.mini.service.StatusHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/status-history")
public class StatusHistoryController {

    private final StatusHistoryService statusHistoryService;

    public StatusHistoryController(StatusHistoryService statusHistoryService) {
        this.statusHistoryService = statusHistoryService;
    }

    @GetMapping
    public List<StatusHistoryResponse> list(@RequestParam(required = false) UUID ticketId) {
        return statusHistoryService.findAll(ticketId);
    }

    @GetMapping("/{id}")
    public StatusHistoryResponse get(@PathVariable UUID id) {
        return statusHistoryService.findById(id);
    }

    @PostMapping
    public ResponseEntity<StatusHistoryResponse> create(@RequestBody @Valid StatusHistoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(statusHistoryService.create(request));
    }

    @PutMapping("/{id}")
    public StatusHistoryResponse update(@PathVariable UUID id, @RequestBody @Valid StatusHistoryRequest request) {
        return statusHistoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        statusHistoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
