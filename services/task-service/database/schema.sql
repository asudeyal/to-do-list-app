BEGIN;

CREATE TABLE categories (
                            id UUID PRIMARY KEY,
                            owner_id UUID NOT NULL,
                            name VARCHAR(80) NOT NULL,
                            color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                            CONSTRAINT categories_name_not_blank
                                CHECK (BTRIM(name) <> ''),

                            CONSTRAINT categories_color_format
                                CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),

    CONSTRAINT categories_id_owner_unique
        UNIQUE (id, owner_id)
);

CREATE UNIQUE INDEX categories_owner_name_unique_idx
    ON categories (owner_id, LOWER(name));


CREATE TABLE tasks (
                       id UUID PRIMARY KEY,
                       owner_id UUID NOT NULL,
                       category_id UUID,
                       title VARCHAR(200) NOT NULL,
                       description TEXT,
                       status VARCHAR(20) NOT NULL DEFAULT 'pending',
                       priority VARCHAR(10) NOT NULL DEFAULT 'medium',
                       due_date DATE,
                       created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                       CONSTRAINT tasks_title_not_blank
                           CHECK (BTRIM(title) <> ''),

                       CONSTRAINT tasks_description_length
                           CHECK (
                               description IS NULL
                                   OR CHAR_LENGTH(description) <= 2000
                               ),

                       CONSTRAINT tasks_status_check
                           CHECK (
                               status IN ('pending', 'in_progress', 'completed')
                               ),

                       CONSTRAINT tasks_priority_check
                           CHECK (
                               priority IN ('low', 'medium', 'high')
                               ),

                       CONSTRAINT tasks_category_owner_fk
                           FOREIGN KEY (category_id, owner_id)
                               REFERENCES categories (id, owner_id)
                               ON DELETE SET NULL (category_id)
);

CREATE INDEX tasks_owner_status_idx
    ON tasks (owner_id, status);

CREATE INDEX tasks_owner_due_date_idx
    ON tasks (owner_id, due_date);

CREATE INDEX tasks_category_owner_idx
    ON tasks (category_id, owner_id);

COMMIT;