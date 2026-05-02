import db from "./models/database.js";

async function updateSchema() {
  try {
    await db.query(`ALTER TABLE users ADD COLUMN otp VARCHAR(10) DEFAULT NULL`);
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error(err);
    }
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN otp_expires DATETIME DEFAULT NULL`);
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error(err);
    }
  }
  
  console.log("Schema updated successfully");
  process.exit(0);
}

updateSchema();
