import db from "../models/database.js";

export const getStats = async (req, res) => {
  const [[users]] = await db.query("SELECT COUNT(*) total FROM users");
  const [[jobs]] = await db.query("SELECT COUNT(*) total FROM jobs");

  res.json({ users: users.total, jobs: jobs.total });
};