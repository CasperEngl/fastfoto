ALTER TABLE "photographer_clients" RENAME TO "team_clients";--> statement-breakpoint
ALTER TABLE "team_clients" RENAME COLUMN "client_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "team_clients" DROP CONSTRAINT "photographer_clients_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "team_clients" DROP CONSTRAINT "photographer_clients_client_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "team_clients" ADD CONSTRAINT "team_clients_pk" PRIMARY KEY("team_id","user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_clients" ADD CONSTRAINT "team_clients_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_clients" ADD CONSTRAINT "team_clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "team_clients" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "team_clients" DROP COLUMN IF EXISTS "updated_at";