CREATE TABLE status_history (
    id          UUID PRIMARY KEY,
    ticket_id   UUID        NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    prev_status VARCHAR(30),
    new_status  VARCHAR(30) NOT NULL,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_status_history_prev_status CHECK (prev_status IN
        ('OPEN', 'PENDING', 'SOLVED', 'CLOSED')),
    CONSTRAINT chk_status_history_new_status CHECK (new_status IN
        ('OPEN', 'PENDING', 'SOLVED', 'CLOSED'))
);

CREATE INDEX idx_status_history_ticket_id ON status_history (ticket_id);
