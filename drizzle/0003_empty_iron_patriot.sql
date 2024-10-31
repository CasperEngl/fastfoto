CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"adminId" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"details" text,
	"performed_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminId_users_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
