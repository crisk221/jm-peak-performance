#!/usr/bin/env tsx

import { Client } from "pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const TIMEOUT_MS = 20000; // 20 seconds
const RETRY_INTERVAL_MS = 2000; // 2 seconds

async function checkDatabaseConnection(): Promise<boolean> {
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    return false;
  }

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    const result = await client.query("SELECT NOW() as current_time");
    console.log("✅ Database connection successful");
    console.log(`   Current time: ${result.rows[0].current_time}`);
    await client.end();
    return true;
  } catch (error) {
    console.log("⏳ Database not ready yet...");
    if (error instanceof Error) {
      console.log(`   Error: ${error.message}`);
    }
    try {
      await client.end();
    } catch {
      // Ignore cleanup errors
    }
    return false;
  }
}

async function waitForDatabase(): Promise<void> {
  console.log("🔍 Checking database connection...");
  console.log(`   Database URL: ${DATABASE_URL?.replace(/:[^:]*@/, ":***@")}`);

  const startTime = Date.now();

  while (Date.now() - startTime < TIMEOUT_MS) {
    const isConnected = await checkDatabaseConnection();

    if (isConnected) {
      console.log("🎉 Database is ready!");
      process.exit(0);
    }

    console.log(`   Retrying in ${RETRY_INTERVAL_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
  }

  console.error("❌ Database connection timeout after 20 seconds");
  process.exit(1);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Database check interrupted");
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Database check terminated");
  process.exit(1);
});

// Run the check
waitForDatabase().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
