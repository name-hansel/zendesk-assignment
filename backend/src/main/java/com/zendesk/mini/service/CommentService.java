package com.zendesk.mini.service;

import com.zendesk.mini.dto.CommentRequest;
import com.zendesk.mini.dto.CommentResponse;
import com.zendesk.mini.entity.CommentEntity;
import com.zendesk.mini.entity.TicketEntity;
import com.zendesk.mini.entity.UserEntity;
import com.zendesk.mini.exception.ResourceNotFoundException;
import com.zendesk.mini.repository.CommentRepository;
import com.zendesk.mini.repository.TicketRepository;
import com.zendesk.mini.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CommentService {

    private final CommentRepository comments;
    private final TicketRepository tickets;
    private final UserRepository users;

    public CommentService(CommentRepository comments, TicketRepository tickets, UserRepository users) {
        this.comments = comments;
        this.tickets = tickets;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> findAll(UUID ticketId) {
        List<CommentEntity> entities = ticketId == null ? comments.findAll() : comments.findByTicketId(ticketId);
        return entities.stream().map(CommentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CommentResponse findById(UUID id) {
        return CommentResponse.from(load(id));
    }

    public CommentResponse create(CommentRequest request) {
        CommentEntity entity = new CommentEntity();
        apply(entity, request);
        return CommentResponse.from(comments.save(entity));
    }

    public CommentResponse update(UUID id, CommentRequest request) {
        CommentEntity entity = load(id);
        apply(entity, request);
        return CommentResponse.from(comments.save(entity));
    }

    public void delete(UUID id) {
        comments.delete(load(id));
        comments.flush();
    }

    private CommentEntity load(UUID id) {
        return comments.findById(id).orElseThrow(() -> new ResourceNotFoundException("Comment", id));
    }

    private void apply(CommentEntity entity, CommentRequest request) {
        TicketEntity ticket = tickets.findById(request.ticketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", request.ticketId()));
        UserEntity user = users.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.userId()));
        entity.setTicket(ticket);
        entity.setUser(user);
        entity.setBody(request.body());
    }
}
