CREATE TABLE users (
                       id             BIGINT        NOT NULL AUTO_INCREMENT,
                       first_name     VARCHAR(40)   NOT NULL,
                       last_name      VARCHAR(40)   NOT NULL,
                       email          VARCHAR(254)  NOT NULL,
                       password_hash  VARCHAR(100)  NOT NULL,
                       program        VARCHAR(60)   NULL,
                       year_of_study  VARCHAR(20)   NULL,
                       bio            VARCHAR(160)  NULL,
                       email_verified BOOLEAN       NOT NULL DEFAULT FALSE,
                       created_at     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                       updated_at     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                 ON UPDATE CURRENT_TIMESTAMP(6),

                       PRIMARY KEY (id),
                       CONSTRAINT uq_users_email UNIQUE (email)
);