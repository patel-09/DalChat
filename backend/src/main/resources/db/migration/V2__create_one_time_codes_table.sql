CREATE TABLE one_time_codes (
                                id          BIGINT        NOT NULL AUTO_INCREMENT,
                                user_id     BIGINT        NOT NULL,
                                purpose     VARCHAR(30)   NOT NULL,
                                code_hash   VARCHAR(100)  NOT NULL,
                                expires_at  DATETIME(6)   NOT NULL,
                                attempts    INT           NOT NULL DEFAULT 0,
                                used_at     DATETIME(6)   NULL,
                                created_at  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

                                PRIMARY KEY (id),
                                CONSTRAINT fk_one_time_codes_user
                                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                                INDEX idx_one_time_codes_user_purpose (user_id, purpose)
);