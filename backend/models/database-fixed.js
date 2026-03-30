import mysql from "mysql2";

// Direct database configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "499431",
  database: "smart_job_tracker"
});

export default db.promise();
