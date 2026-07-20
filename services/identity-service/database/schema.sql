BEGIN;

CREATE TABLE users (
                       id UUID PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) NOT NULL,
                       password_hash TEXT NOT NULL,
                       created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                       CONSTRAINT users_name_not_blank
                           CHECK (BTRIM(name) <> ''),

                       CONSTRAINT users_email_not_blank
                           CHECK (BTRIM(email) <> '')
);

CREATE UNIQUE INDEX users_email_unique_idx
    ON users (LOWER(email));

COMMIT;