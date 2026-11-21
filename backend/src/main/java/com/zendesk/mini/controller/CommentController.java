package com.zendesk.mini.controller;

import com.zendesk.mini.dto.CommentRequest;
import com.zendesk.mini.dto.CommentResponse;
import com.zendesk.mini.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public List<CommentResponse> list(@RequestParam(required = false) UUID ticketId) {
        return commentService.findAll(ticketId);
    }

    @GetMapping("/{id}")
    public CommentResponse get(@PathVariable UUID id) {
        return commentService.findById(id);
    }

    @PostMapping
    public ResponseEntity<CommentResponse> create(@RequestBody @Valid CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.create(request));
    }

    @PutMapping("/{id}")
    public CommentResponse update(@PathVariable UUID id, @RequestBody @Valid CommentRequest request) {
        return commentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        commentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
