import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1
});

async function fixStatus() {
  try {
    console.log("Starting robust status fix...");

    // 1. Change status to VARCHAR to avoid ENUM restrictions
    console.log("Changing status column to VARCHAR...");
    await db.query("ALTER TABLE applications MODIFY COLUMN status VARCHAR(50)");

    // 2. Update 'applied' to 'pending'
    console.log("Updating 'applied' status to 'pending'...");
    await db.query("UPDATE applications SET status = 'pending' WHERE status = 'applied' OR status IS NULL OR status = ''");

    // 3. Change back to ENUM with 'pending'
    console.log("Converting status column back to ENUM with 'pending'...");
    await db.query("ALTER TABLE applications MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending'");

    console.log("Robust status fix complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error in robust status fix:", err);
    process.exit(1);
  }
}

fixStatus();
