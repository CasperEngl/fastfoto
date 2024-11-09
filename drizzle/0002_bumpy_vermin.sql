ALTER TABLE "users_to_teams" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users_to_teams" CASCADE;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ALTER COLUMN "performed_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "photographer_clients" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "photos" ALTER COLUMN "uploaded_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "updated_at" timestamp DEFAULT now();