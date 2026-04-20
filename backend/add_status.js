import db from "./models/database.js";

async function addStatus() {
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM jobs LIKE 'status'");
    if (rows.length === 0) {
      await db.query("ALTER TABLE jobs ADD COLUMN status ENUM('open', 'closed') DEFAULT 'open'");
      console.log("Added status column to jobs table");
    } else {
      console.log("Status column already exists");
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
addStatus();
