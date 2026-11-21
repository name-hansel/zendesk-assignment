CREATE TABLE tickets (
    id          UUID PRIMARY KEY,
    subject     VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,
    customer_id UUID         NOT NULL REFERENCES users (id),
    agent_id    UUID         REFERENCES users (id),
    status      VARCHAR(30)  NOT NULL DEFAULT 'OPEN',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    closed_at   TIMESTAMPTZ,
    CONSTRAINT chk_tickets_status CHECK (status IN
        ('OPEN', 'PENDING', 'SOLVED', 'CLOSED'))
);

CREATE INDEX idx_tickets_customer_id ON tickets (customer_id);
CREATE INDEX idx_tickets_agent_id    ON tickets (agent_id);
CREATE INDEX idx_tickets_status      ON tickets (status);