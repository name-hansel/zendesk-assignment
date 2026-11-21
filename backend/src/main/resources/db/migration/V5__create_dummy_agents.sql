-- Dummy AGENT users for local testing.
-- Safe to re-run: existing rows (same id or email) are skipped.

INSERT INTO users (id, user_id, name, email, phone_number, role, created_at) VALUES
    ('a0000000-0000-4000-8000-000000000001', 'priya-nair-a1b2c3',   'Priya Nair',   'priya.nair@support.example.com',   '+91-9000000001', 'AGENT', now()),
    ('a0000000-0000-4000-8000-000000000002', 'rahul-mehta-d4e5f6',  'Rahul Mehta',  'rahul.mehta@support.example.com',  '+91-9000000002', 'AGENT', now()),
    ('a0000000-0000-4000-8000-000000000003', 'sneha-iyer-g7h8i9',   'Sneha Iyer',   'sneha.iyer@support.example.com',   '+91-9000000003', 'AGENT', now()),
    ('a0000000-0000-4000-8000-000000000004', 'arjun-verma-j1k2l3',  'Arjun Verma',  'arjun.verma@support.example.com',  NULL,            'AGENT', now()),
    ('a0000000-0000-4000-8000-000000000005', 'kavya-reddy-m4n5o6',  'Kavya Reddy',  'kavya.reddy@support.example.com',  '+91-9000000005', 'AGENT', now())
ON CONFLICT DO NOTHING;