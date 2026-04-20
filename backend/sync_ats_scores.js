import db from './models/database.js';
import { getATSScore } from './services/atsService.js';

async function updateAllScores() {
  try {
    console.log("Fetching applications with 0% or NULL score...");
    const [apps] = await db.query(`
      SELECT a.id, a.resume_path, j.description 
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE (a.ats_score IS NULL OR a.ats_score <= 0) AND a.resume_path IS NOT NULL
    `);

    console.log(`Found ${apps.length} applications to update.`);

    for (const app of apps) {
      console.log(`Processing application ID: ${app.id}...`);
      try {
        const { score, explanation } = await getATSScore(app.resume_path, app.description);
        
        if (score !== null) {
          await db.query(
            "UPDATE applications SET ats_score=?, ats_explanation=? WHERE id=?",
            [score, explanation, app.id]
          );
          console.log(`Updated ID ${app.id}: Score ${score}%`);
        }
      } catch (err) {
        console.error(`Failed to update application ${app.id}:`, err.message);
      }
    }

    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

updateAllScores();
