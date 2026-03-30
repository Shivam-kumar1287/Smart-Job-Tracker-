import db from "./models/database-fixed.js";

async function updateDatabaseSchema() {
  try {
    console.log("Updating database schema...");

    // Add cover_letter column to applications table
    await db.query(`
      ALTER TABLE applications 
      ADD COLUMN cover_letter TEXT 
      AFTER resume_path
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log("Added cover_letter column to applications table");
      }
    });

    // Add missing columns to users table for profile functionality
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN phone VARCHAR(50) 
      AFTER email
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log("Added phone column to users table");
      }
    });

    await db.query(`
      ALTER TABLE users 
      ADD COLUMN location VARCHAR(255) 
      AFTER phone
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log("Added location column to users table");
      }
    });

    await db.query(`
      ALTER TABLE users 
      ADD COLUMN bio TEXT 
      AFTER location
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log("Added bio column to users table");
      }
    });

    await db.query(`
      ALTER TABLE users 
      ADD COLUMN skills TEXT 
      AFTER bio
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log("Added skills column to users table");
      }
    });

    await db.query(`
      ALTER TABLE users 
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
      AFTER created_at
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.log("Added updated_at column to users table");
      }
    });

    console.log("Database schema updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating database schema:", error);
    process.exit(1);
  }
}

updateDatabaseSchema();
