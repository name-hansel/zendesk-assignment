CREATE TABLE comments (
    id        UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users (id),
    body      TEXT NOT NULL
);

CREATE INDEX idx_comments_ticket_id ON comments (ticket_id);
