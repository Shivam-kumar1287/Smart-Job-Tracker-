import db from "./models/database.js";

async function fixStatus() {
  try {
    console.log("Fixing application status...");

    // Update the column definition first (need to use raw SQL)
    // In MySQL we use MODIFY or CHANGE
    await db.query(`
      ALTER TABLE applications 
      MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending'
    `).catch(async (err) => {
      console.log("Could not modify ENUM directly, checking if we need to update data first...");
      // If there are 'applied' records, they need to be 'pending'
      await db.query("UPDATE applications SET status = 'pending' WHERE status = 'applied'").catch(() => {});
      
      // Try again
      await db.query(`
        ALTER TABLE applications 
        MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending'
      `);
    });

    console.log("Status fix complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error fixing status:", err);
    process.exit(1);
  }
}

fixStatus();
