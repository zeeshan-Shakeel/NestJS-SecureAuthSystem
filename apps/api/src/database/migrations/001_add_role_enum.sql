CREATE TYPE role_type AS ENUM ('User', 'admin');

ALTER TABLE "User"
ALTER COLUMN "role" TYPE role_type
USING role::role_type;


