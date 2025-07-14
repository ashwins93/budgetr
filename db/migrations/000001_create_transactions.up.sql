CREATE TABLE IF NOT EXISTS transactions (
    id TEXT NOT NULL PRIMARY KEY,
    amount INT NOT NULL,
    description TEXT NOT NULL,
    effective_date INT NOT NULL,
    pinned INT NOT NULL DEFAULT 0
)