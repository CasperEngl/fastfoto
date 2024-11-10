ALTER TYPE "public"."team_role" RENAME TO "studio_role";--> statement-breakpoint
ALTER TABLE "team_clients" RENAME TO "studio_clients";--> statement-breakpoint
ALTER TABLE "team_members" RENAME TO "studio_members";--> statement-breakpoint
ALTER TABLE "teams" RENAME TO "studios";--> statement-breakpoint
ALTER TABLE "albums" RENAME COLUMN "team_id" TO "studio_id";--> statement-breakpoint
ALTER TABLE "studio_clients" RENAME COLUMN "team_id" TO "studio_id";--> statement-breakpoint
ALTER TABLE "studio_members" RENAME COLUMN "team_id" TO "studio_id";--> statement-breakpoint
ALTER TABLE "albums" DROP CONSTRAINT "albums_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "studio_clients" DROP CONSTRAINT "team_clients_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "studio_clients" DROP CONSTRAINT "team_clients_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio_members" DROP CONSTRAINT "team_members_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "studio_members" DROP CONSTRAINT "team_members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studios" DROP CONSTRAINT "teams_created_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "studio_clients" DROP CONSTRAINT "undefined";--> statement-breakpoint
ALTER TABLE "studio_clients" ADD CONSTRAINT "studio_clients_pk" PRIMARY KEY("studio_id","user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "albums" ADD CONSTRAINT "albums_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studio_clients" ADD CONSTRAINT "studio_clients_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studio_clients" ADD CONSTRAINT "studio_clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studio_members" ADD CONSTRAINT "studio_members_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studio_members" ADD CONSTRAINT "studio_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studios" ADD CONSTRAINT "studios_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
