CREATE TABLE IF NOT EXISTS "album_clients" (
	"id" text PRIMARY KEY NOT NULL,
	"album_id" text NOT NULL,
	"studio_client_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "album_clients" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users_to_albums" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users_to_albums" CASCADE;--> statement-breakpoint
ALTER TABLE "studio_clients" DROP CONSTRAINT "studio_clients_pk";--> statement-breakpoint
ALTER TABLE "studio_clients" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "album_clients" ADD CONSTRAINT "album_clients_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "album_clients" ADD CONSTRAINT "album_clients_studio_client_id_studio_clients_id_fk" FOREIGN KEY ("studio_client_id") REFERENCES "public"."studio_clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "album_clients_album_id_studio_client_id_unique" ON "album_clients" USING btree ("album_id","studio_client_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "studio_clients_studio_id_user_id_unique" ON "studio_clients" USING btree ("studio_id","user_id");