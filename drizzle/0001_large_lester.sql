CREATE TABLE IF NOT EXISTS "photographer_clients" (
	"id" text PRIMARY KEY NOT NULL,
	"photographer_id" text NOT NULL,
	"client_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "photographer_clients" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "albums" RENAME COLUMN "owner_id" TO "photographer_id";--> statement-breakpoint
ALTER TABLE "albums" DROP CONSTRAINT "albums_owner_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "photographer_clients" ADD CONSTRAINT "photographer_clients_photographer_id_users_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "photographer_clients" ADD CONSTRAINT "photographer_clients_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "albums" ADD CONSTRAINT "albums_photographer_id_users_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
