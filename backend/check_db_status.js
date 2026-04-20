import db from './models/database.js';

async function check() {
  try {
    const [[{ db_name }]] = await db.query("SELECT DATABASE() as db_name");
    console.log("Connected to database:", db_name);

    const [cols] = await db.query("DESCRIBE applications");
    const statusCol = cols.find(c => c.Field === 'status');
    console.log("Status column type:", statusCol.Type);

    const [rows] = await db.query("SELECT count(*) as count FROM applications");
    console.log("Current row count:", rows[0].count);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
