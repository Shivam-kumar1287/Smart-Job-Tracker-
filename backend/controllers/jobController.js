import db from "../models/database.js";

export const createJob = async (req, res) => {
  try {
    const { company_name, job_role, description, required_skills, rounds } = req.body;

    const [result] = await db.query(
      "INSERT INTO jobs (company_name,job_role,description,required_skills,rounds,created_by) VALUES (?,?,?,?,?,?)",
      [company_name, job_role, description, required_skills, rounds, req.user.id]
    );

    res.json({ message: "Job created successfully", jobId: result.insertId });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json("Error creating job");
  }
};

export const getJobs = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM jobs ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json("Error fetching jobs");
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM jobs WHERE created_by = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching my jobs:", error);
    res.status(500).json("Error fetching jobs");
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, job_role, description, required_skills, rounds } = req.body;

    await db.query(
      "UPDATE jobs SET company_name=?, job_role=?, description=?, required_skills=?, rounds=? WHERE id=? AND created_by=?",
      [company_name, job_role, description, required_skills, rounds, id, req.user.id]
    );

    res.json("Job updated successfully");
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json("Error updating job");
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM jobs WHERE id=? AND created_by=?",
      [id, req.user.id]
    );

    res.json("Job deleted successfully");
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json("Error deleting job");
  }
};

export const getJobById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM jobs WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json("Job not found");
    
    // Get application statistics for this job
    const [appStats] = await db.query(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted FROM applications WHERE job_id = ?",
      [req.params.id]
    );
    
    const job = rows[0];
    job.application_stats = {
      total_applications: appStats[0].total,
      accepted_applications: appStats[0].accepted,
      acceptance_rate: appStats[0].total > 0 ? (appStats[0].accepted / appStats[0].total * 100).toFixed(1) : 0
    };
    
    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json("Error fetching job");
  }
};

export const getJobPerformance = async (req, res) => {
  try {
    const jobId = req.params.id;
    const hrId = req.user.id;
    
    // Verify job belongs to HR
    const [jobCheck] = await db.query("SELECT id FROM jobs WHERE id = ? AND created_by = ?", [jobId, hrId]);
    if (jobCheck.length === 0) return res.status(403).json("Not authorized");
    
    // Get detailed performance metrics
    const [performance] = await db.query(
      `SELECT 
        j.*,
        COUNT(a.id) as total_applications,
        SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        AVG(a.ats_score) as avg_ats_score,
        MAX(a.ats_score) as max_ats_score,
        MIN(a.ats_score) as min_ats_score
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.id = ?
       GROUP BY j.id`,
      [jobId]
    );
    
    // Get application timeline
    const [timeline] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as applications
       FROM applications 
       WHERE job_id = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [jobId]
    );
    
    // Get top skills from applicants
    const [topSkills] = await db.query(
      `SELECT u.skills, COUNT(*) as count
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.job_id = ? AND u.skills IS NOT NULL
       GROUP BY u.skills
       ORDER BY count DESC
       LIMIT 10`,
      [jobId]
    );
    
    const result = performance[0] || {};
    result.timeline = timeline;
    result.top_skills = topSkills;
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching job performance:", error);
    res.status(500).json("Error fetching job performance");
  }
};

export const getSimilarJobs = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Get current job details
    const [currentJob] = await db.query("SELECT * FROM jobs WHERE id = ?", [jobId]);
    if (currentJob.length === 0) return res.status(404).json("Job not found");
    
    // Find similar jobs based on skills and role
    const [similarJobs] = await db.query(
      `SELECT *, 
        (CASE WHEN required_skills LIKE ? THEN 3 
         WHEN required_skills LIKE ? THEN 2 
         WHEN job_role LIKE ? THEN 1 ELSE 0 END) as similarity_score
       FROM jobs 
       WHERE id != ? 
       AND (required_skills LIKE ? OR job_role LIKE ? OR company_name = ?)
       ORDER BY similarity_score DESC, created_at DESC
       LIMIT 5`,
      [
        `%${currentJob[0].required_skills.split(',')[0]}%`,
        `%${currentJob[0].job_role}%`,
        `%${currentJob[0].job_role}%`,
        jobId,
        `%${currentJob[0].required_skills.split(',')[0]}%`,
        `%${currentJob[0].job_role}%`,
        currentJob[0].company_name
      ]
    );
    
    res.json(similarJobs);
  } catch (error) {
    console.error("Error fetching similar jobs:", error);
    res.status(500).json("Error fetching similar jobs");
  }
};