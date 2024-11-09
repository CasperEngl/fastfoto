ALTER TABLE "albums" DROP CONSTRAINT "albums_photographer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN IF EXISTS "photographer_id";