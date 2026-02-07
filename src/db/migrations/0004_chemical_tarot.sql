ALTER TABLE "aktivnosti" ALTER COLUMN "tip" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "aktivnosti" ALTER COLUMN "tip" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "aktivnosti" DROP COLUMN "poreklo";