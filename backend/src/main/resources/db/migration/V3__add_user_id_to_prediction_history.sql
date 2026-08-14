-- Add user_id FK to prediction_history for persistent per-user history
ALTER TABLE prediction_history ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE prediction_history ADD CONSTRAINT fk_prediction_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_prediction_user_id ON prediction_history (user_id);
