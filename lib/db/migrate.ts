import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { config } from "dotenv";

// Load environment variables
config({ path: "./.env.local" });

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "./lib/db/migrations" });

  console.log("Migrations completed!");

  process.exit(0);
};

runMigration().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
