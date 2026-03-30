import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function setAccountRole() {
  const email = 'kshivam0508@gmail.com';
  try {
    const con = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    console.log(`Searching for user with email: ${email}...`);
    const [rows] = await con.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      console.log(`❌ User ${email} not found.`);
    } else {
      await con.execute('UPDATE users SET role = ? WHERE email = ?', ['hr', email]);
      console.log(`✅ Success: ${email} has been updated to the HR role.`);
    }

    await con.end();
    process.exit(0);
  } catch (err) {
    console.error(`❌ Operation failed: ${err.message}`);
    process.exit(1);
  }
}

setAccountRole();
