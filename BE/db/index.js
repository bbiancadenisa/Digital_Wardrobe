import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") }); // load BE/.env

// Connection pool setup (recommended instead of Client)
const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "postgres",
  password: String(process.env.DB_PASSWORD ?? ""),
  port: Number(process.env.DB_PORT ?? 5433),
  database: process.env.DB_NAME ?? "Digital_Wardrobe_Database",
});

// Surface pooled client errors (idle clients etc.)
pool.on("error", (err) => {
  console.error(
    "Unexpected PostgreSQL pool error:",
    (err && (err.stack || err.message)) || err
  );
});

// Test connection once at startup
pool
  .connect()
  .then((client) => {
    console.log("PostgreSQL connected successfully");
    client.release();
  })
  .catch((err) =>
    console.error(
      "PostgreSQL connection error:",
      (err && (err.stack || err.message)) || err
    )
  );

export default pool;
