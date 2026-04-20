import db from "../models/database.js";
import { getATSScore, analyzeResumeDetailed } from "../services/atsService.js";
import { sendMail } from "../utils/mailer.js";
import { generateOfferLetter } from "../utils/offerLetterGenerator.js";

/**
 * ✅ APPLY JOB (USER)
 * POST /api/applications
 */
export const applyJob = async (req, res) => {
  try {
    // Handle both JSON and multipart form data
    const job_id = req.body.job_id;
    const cover_letter = req.body.cover_letter || "";
    const user_id = req.user.id;
    const resume_file = req.file;

    console.log("Application data:", { 
      job_id, 
      cover_letter, 
      user_id, 
      resume_file,
      fullBody: req.body 
    });

    if (!job_id) {
      return res.status(400).json("Job ID is required");
    }

    // Check if already applied
    const [existing] = await db.query(
      "SELECT id FROM applications WHERE user_id=? AND job_id=?",
      [user_id, job_id]
    );

    if (existing.length) {
      return res.status(400).json("Already applied to this job");
    }

    // Get job details and check status
    const [jobRows] = await db.query("SELECT * FROM jobs WHERE id=?", [job_id]);
    if (jobRows.length === 0) {
      return res.status(404).json("Job not found");
    }
    const job = jobRows[0];
    if (job.status === 'closed') {
      return res.status(400).json("This job is no longer accepting applications");
    }

    // Insert application with resume file path
    const resume_path = resume_file ? resume_file.path : null;
    const [result] = await db.query(
      "INSERT INTO applications (user_id,job_id,cover_letter,resume_path) VALUES (?,?,?,?)",
      [user_id, job_id, cover_letter || "", resume_path]
    );

    if (jobRows.length > 0) {
      
      try {
        // Calculate CRI score based on resume and job description
        if (resume_path) {
          const { score, explanation, suggestions } = await getATSScore(resume_path, job.description);
          
          // Update application with ATS result
          if (score !== null) {
            await db.query(
              "UPDATE applications SET ats_score=?, ats_explanation=?, ats_suggestions=? WHERE id=?",
              [score, explanation, suggestions, result.insertId]
            );
          }
        }
      } catch (atsError) {
        console.error("ATS scoring error:", atsError);
        // Continue without ATS score if it fails
      }
    }

    res.json("Applied successfully");
  } catch (err) {
    console.error("Application error:", err);
    res.status(500).json("Application failed");
  }
};

export const getApplications = async (req, res) => {
  try {
    const hrId = req.user.id;
    const [rows] = await db.query(`
      SELECT a.*, u.name, u.email, u.name as user_name, u.email as user_email, u.phone, u.location, u.bio, u.skills, u.social_links, u.profile_image, j.job_role, j.company_name, j.rounds
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE j.created_by = ?
      ORDER BY a.applied_at DESC
    `, [hrId]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json("Error fetching applications");
  }
};

/**
 * ✅ GET PENDING APPLICATIONS (HR)
 */
export const getPendingApplications = async (req, res) => {
  try {
    const hrId = req.user.id;
    const [rows] = await db.query(`
      SELECT a.*, u.name, u.email, u.name as user_name, u.email as user_email, u.phone, u.location, u.bio, u.skills, u.social_links, u.profile_image, j.job_role, j.company_name, j.rounds
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE j.created_by = ? AND a.status = 'pending'
      ORDER BY a.applied_at DESC
    `, [hrId]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    res.status(500).json("Error fetching applications");
  }
};

/**
 * ✅ GET MY APPLICATIONS (USER)
 */
export const getMyApplications = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, j.job_role, j.company_name, j.description, j.rounds
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching my applications:", error);
    res.status(500).json("Error fetching applications");
  }
};

/**
 * ✅ ACCEPT APPLICATION (HR)
 */
export const acceptApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status to prevent duplicate actions/emails
    const [statusRows] = await db.query(
      "SELECT status FROM applications WHERE id = ?",
      [id]
    );

    if (statusRows.length === 0) return res.status(404).json("Application not found");
    if (statusRows[0].status !== 'pending') return res.status(400).json("Application is already " + statusRows[0].status);

    // Update application status
    await db.query(
      "UPDATE applications SET status = 'accepted' WHERE id = ?",
      [id]
    );

    // Get application details for email
    const [appRows] = await db.query(`
      SELECT a.*, u.email as user_email, u.name as user_name, j.job_role, j.company_name
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [id]);

    if (appRows.length > 0) {
      const app = appRows[0];
      
      // Send acceptance email
      await sendMail(
        app.user_email,
        "Application Approved! \uD83C\uDF89",
        `Congratulations ${app.user_name}!\n\nYour application for the ${app.job_role} position at ${app.company_name} has been approved!\n\nOur AI-driven HR evaluation determined that your resume strongly meets the required criteria, achieving an excellent CRI Match Score of ${app.ats_score || "N/A"}%.\n\nWe are excited about your qualifications and will be in touch shortly regarding the interview rounds.\n\nBest regards,\n${app.company_name} HR Team`
      );
    }

    res.json("Application accepted successfully");
  } catch (error) {
    console.error("Error accepting application:", error);
    res.status(500).json("Error accepting application");
  }
};

/**
 * ✅ REJECT APPLICATION (HR)
 */
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status to prevent duplicate actions/emails
    const [statusRows] = await db.query(
      "SELECT status FROM applications WHERE id = ?",
      [id]
    );

    if (statusRows.length === 0) return res.status(404).json("Application not found");
    if (statusRows[0].status !== 'pending') return res.status(400).json("Application is already " + statusRows[0].status);

    // Update application status
    await db.query(
      "UPDATE applications SET status = 'rejected' WHERE id = ?",
      [id]
    );

    // Get application details for email
    const [appRows] = await db.query(`
      SELECT a.*, u.email as user_email, u.name as user_name, j.job_role, j.company_name
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [id]);

    if (appRows.length > 0) {
      const app = appRows[0];
      
      // Send rejection email
      await sendMail(
        app.user_email,
        "Application Update - Smart Job Tracker",
        `Dear ${app.user_name},\n\nThank you for your interest in the ${app.job_role} position at ${app.company_name}.\n\nAfter a careful AI-driven review of your application, your resume attained a CRI Match Score of ${app.ats_score || "N/A"}%. Unfortunately, we have decided to move forward with other candidates whose qualifications more closely align with our current needs.\n\nWe encourage you to apply for future openings that may be a better fit.\n\nBest regards,\n${app.company_name} HR Team`
      );
    }

    res.json("Application rejected successfully");
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json("Error rejecting application");
  }
};

export const getApplicationAnalytics = async (req, res) => {
  try {
    const hrId = req.user.id;
    
    // Get comprehensive application analytics
    const [analytics] = await db.query(
      `SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        AVG(ats_score) as avg_ats_score,
        MAX(ats_score) as max_ats_score,
        MIN(ats_score) as min_ats_score
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.created_by = ?`,
      [hrId]
    );
    
    // Get application trends
    const [trends] = await db.query(
      `SELECT DATE(a.created_at) as date, COUNT(*) as applications
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.created_by = ? 
       AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(a.created_at)
       ORDER BY date DESC`,
      [hrId]
    );
    
    // Get top performing jobs
    const [topJobs] = await db.query(
      `SELECT j.id, j.job_role, j.company_name,
       COUNT(a.id) as total_applications,
       (SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) / COUNT(a.id) * 100) as acceptance_rate
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.created_by = ?
       GROUP BY j.id, j.job_role, j.company_name
       HAVING total_applications > 0
       ORDER BY acceptance_rate DESC
       LIMIT 5`,
      [hrId]
    );
    
    const result = analytics[0] || {};
    result.trends = trends;
    result.top_jobs = topJobs;
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching application analytics:", error);
    res.status(500).json("Error fetching application analytics");
  }
};

export const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const hrId = req.user.id;
    
    // Verify application belongs to HR's job
    const [application] = await db.query(
      `SELECT a.*, u.name, u.email, u.name as user_name, u.email as user_email, u.phone, u.skills, u.bio, u.social_links, u.profile_image,
       j.job_role, j.company_name, j.description, j.required_skills, j.rounds
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ? AND j.created_by = ?`,
      [id, hrId]
    );
    
    if (application.length === 0) {
      return res.status(404).json("Application not found");
    }
    
    res.json(application[0]);
  } catch (error) {
    console.error("Error fetching application details:", error);
    res.status(500).json("Error fetching application details");
  }
};

export const getApplicationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's application history with job details
    const [history] = await db.query(
      `SELECT a.*, j.job_role, j.company_name, j.description, j.required_skills
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [userId]
    );
    
    res.json(history);
  } catch (error) {
    console.error("Error fetching application history:", error);
    res.status(500).json("Error fetching application history");
  }
};

export const updateApplicationRound = async (req, res) => {
  try {
    const { id } = req.params;
    const { round } = req.body;
    
    // Fetch application details for potential offer letter
    const [appRows] = await db.query(`
      SELECT a.*, u.name as user_name, u.email as user_email, j.job_role, j.company_name, j.rounds
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [id]);

    if (appRows.length === 0) return res.status(404).json("Application not found");
    const app = appRows[0];

    await db.query(
      "UPDATE applications SET current_round = ? WHERE id = ?",
      [round, id]
    );

    // If this is the final round
    if (parseInt(round) >= parseInt(app.rounds)) {
      // Atomic update to prevent multiple emails
      const [updateResult] = await db.query(
        "UPDATE applications SET is_offer_sent = TRUE WHERE id = ? AND is_offer_sent = FALSE",
        [id]
      );

      // Only send if we were the one who flipped it from FALSE to TRUE
      if (updateResult.affectedRows > 0) {
        try {
          const filePath = await generateOfferLetter(app.user_name, app.job_role, app.company_name);
          
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0;">
              <div style="background: linear-gradient(to right, #2563eb, #7c3aed); padding: 40px 20px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">CONGRATULATIONS!</h1>
              </div>
              <div style="padding: 40px 30px; line-height: 1.6; color: #334155;">
                <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">Dear ${app.user_name},</p>
                <p>We are absolutely thrilled to inform you that you have successfully completed all rounds of interviews for the position of <strong>${app.job_role}</strong> at <strong>${app.company_name}</strong>.</p>
                <p>Your performance throughout our rigorous selection process was exceptional, and we believe you will be a fantastic addition to our professional family.</p>
                <div style="background: #f8fafc; padding: 25px; border-radius: 15px; margin: 30px 0; border: 1px solid #f1f5f9;">
                  <p style="margin: 0; font-size: 14px; font-weight: bold; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 10px;">Next Steps</p>
                  <p style="margin: 0;">Please find your official <strong>Offer Letter</strong> attached to this email. We encourage you to review it carefully and reach out to our team if you have any questions.</p>
                </div>
                <p>We can't wait to see the impact you'll make here!</p>
                <p style="margin-top: 40px; font-weight: bold;">Warm Regards,</p>
                <p style="margin: 0; color: #2563eb; font-weight: 800;">The Talent Acquisition Team</p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">${app.company_name}</p>
              </div>
            </div>
          `;

          await sendMail(
            app.user_email,
            `Exciting News: Your Official Offer Letter from ${app.company_name}`,
            `Congratulations ${app.user_name}! You have been selected for the position of ${app.job_role} at ${app.company_name}. Please find your offer letter attached.`,
            html,
            [{ filename: 'Offer_Letter.pdf', path: filePath }]
          );

        } catch (err) {
          console.error("Error sending offer letter:", err);
          // Rollback flag if email failed, so HR can try again
          await db.query("UPDATE applications SET is_offer_sent = FALSE WHERE id = ?", [id]);
        }
      }
    }
    
    res.json("Application round updated successfully");
  } catch (error) {
    console.error("Error updating application round:", error);
    res.status(500).json("Error updating application round");
  }
};

export const analyzeResume = async (req, res) => {
  try {
    const { jd } = req.body;
    const resume_path = req.file ? req.file.path : null;

    if (!resume_path || !jd) {
      return res.status(400).json("Resume and Job Description are required");
    }

    const analysis = await analyzeResumeDetailed(resume_path, jd);
    res.json(analysis);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).json("Error during analysis: " + error.message);
  }
};
