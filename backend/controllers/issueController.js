import db from "../models/database.js";

export const reportIssue = async (req, res) => {
  const { message } = req.body;

  await db.query("INSERT INTO issues (reported_by,message) VALUES (?,?)", [
    req.user.id,
    message
  ]);

  res.json("Issue reported");
};