CREATE TABLE IF NOT EXISTS "albums" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "photos" (
	"id" text PRIMARY KEY NOT NULL,
	"albumId" text NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"uploaded_at" timestamp NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "albums" ADD CONSTRAINT "albums_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "photos" ADD CONSTRAINT "photos_albumId_albums_id_fk" FOREIGN KEY ("albumId") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
