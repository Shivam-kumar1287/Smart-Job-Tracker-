import mysql from "mysql2";

// Try to connect without password first (common for local MySQL)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Try empty password
});

db.connect((err) => {
  if (err) {
    console.log("Trying with password from .env...");
    // If empty password fails, try with .env password
    const dbWithPass = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });
    
    dbWithPass.connect((err2) => {
      if (err2) {
        console.error("Database connection failed with both attempts:");
        console.error("1. Empty password:", err.message);
        console.error("2. .env password:", err2.message);
        console.log("\nSolutions:");
        console.log("1. Make sure MySQL is running");
        console.log("2. Try empty password for root user");
        console.log("3. Check your MySQL root password");
        console.log("4. Create database manually using database_schema.sql");
        process.exit(1);
      } else {
        console.log("✅ Database connected successfully with .env password!");
        dbWithPass.destroy();
      }
    });
  } else {
    console.log("✅ Database connected successfully with empty password!");
    
    // Create database if not exists
    db.query("CREATE DATABASE IF NOT EXISTS smart_job_tracker", (err) => {
      if (err) {
        console.error("Error creating database:", err);
      } else {
        console.log("✅ Database 'smart_job_tracker' created/exists");
      }
      db.destroy();
    });
  }
});
