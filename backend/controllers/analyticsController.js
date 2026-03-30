import db from "../models/database.js";

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's applications
    const [applications] = await db.query(
      "SELECT status, COUNT(*) as count FROM applications WHERE user_id = ? GROUP BY status",
      [userId]
    );
    
    // Get saved jobs from localStorage (this would be handled differently in a real app)
    const savedJobs = 0; // Placeholder - would come from database in production
    
    const stats = {
      totalApplications: applications.reduce((sum, app) => sum + app.count, 0),
      pendingApplications: applications.find(app => app.status === 'pending')?.count || 0,
      acceptedApplications: applications.find(app => app.status === 'accepted')?.count || 0,
      rejectedApplications: applications.find(app => app.status === 'rejected')?.count || 0,
      savedJobs: savedJobs
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json("Error fetching user stats");
  }
};

export const getHRStats = async (req, res) => {
  try {
    const hrId = req.user.id;
    
    // Get HR's jobs
    const [jobs] = await db.query("SELECT COUNT(*) as total FROM jobs WHERE created_by = ?", [hrId]);
    
    // Get applications for HR's jobs
    const [applications] = await db.query(
      `SELECT status, COUNT(*) as count FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE j.created_by = ? 
       GROUP BY status`,
      [hrId]
    );
    
    const stats = {
      totalJobs: jobs[0].total,
      totalApplications: applications.reduce((sum, app) => sum + app.count, 0),
      pendingApplications: applications.find(app => app.status === 'pending')?.count || 0,
      acceptedApplications: applications.find(app => app.status === 'accepted')?.count || 0,
      rejectedApplications: applications.find(app => app.status === 'rejected')?.count || 0,
      activeJobs: jobs[0].total // All jobs are considered active for now
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching HR stats:", error);
    res.status(500).json("Error fetching HR stats");
  }
};

export const getJobAnalytics = async (req, res) => {
  try {
    const hrId = req.user.id;
    
    // Get job performance analytics
    const [jobAnalytics] = await db.query(
      `SELECT j.id, j.job_role, j.company_name, j.created_at,
       COUNT(a.id) as total_applications,
       SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) as accepted,
       SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM jobs j 
       LEFT JOIN applications a ON j.id = a.job_id 
       WHERE j.created_by = ? 
       GROUP BY j.id, j.job_role, j.company_name, j.created_at
       ORDER BY j.created_at DESC`,
      [hrId]
    );
    
    res.json(jobAnalytics);
  } catch (error) {
    console.error("Error fetching job analytics:", error);
    res.status(500).json("Error fetching job analytics");
  }
};

export const getApplicationTrends = async (req, res) => {
  try {
    const hrId = req.user.id;
    
    // Get application trends over time
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
    
    res.json(trends);
  } catch (error) {
    console.error("Error fetching application trends:", error);
    res.status(500).json("Error fetching application trends");
  }
};

export const getTopPerformingJobs = async (req, res) => {
  try {
    const hrId = req.user.id;
    
    // Get top performing jobs by application rate
    const [topJobs] = await db.query(
      `SELECT j.id, j.job_role, j.company_name,
       COUNT(a.id) as total_applications,
       (SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) / COUNT(a.id) * 100) as acceptance_rate
       FROM jobs j 
       LEFT JOIN applications a ON j.id = a.job_id 
       WHERE j.created_by = ? 
       AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY j.id, j.job_role, j.company_name
       HAVING total_applications > 0
       ORDER BY acceptance_rate DESC
       LIMIT 5`,
      [hrId]
    );
    
    res.json(topJobs);
  } catch (error) {
    console.error("Error fetching top performing jobs:", error);
    res.status(500).json("Error fetching top performing jobs");
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user activity timeline
    const [activity] = await db.query(
      `SELECT 'application' as type, a.created_at, 
       CONCAT('Applied for ', j.job_role, ' at ', j.company_name) as description
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.user_id = ?
       UNION ALL
       SELECT 'profile_update' as type, updated_at as created_at, 
       'Profile updated' as description
       FROM users 
       WHERE id = ? AND updated_at IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId, userId]
    );
    
    res.json(activity);
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json("Error fetching user activity");
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's skills and application history
    const [userSkills] = await db.query("SELECT skills FROM users WHERE id = ?", [userId]);
    const [userApplications] = await db.query(
      `SELECT DISTINCT j.required_skills 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.user_id = ?`,
      [userId]
    );
    
    // Get recommended jobs based on skills
    const [recommendations] = await db.query(
      `SELECT DISTINCT j.id, j.job_role, j.company_name, j.description, j.required_skills, j.created_at
       FROM jobs j 
       WHERE j.id NOT IN (
         SELECT job_id FROM applications WHERE user_id = ?
       )
       AND (j.required_skills LIKE ? OR j.required_skills LIKE ?)
       ORDER BY j.created_at DESC
       LIMIT 5`,
      [userId, `%${userSkills[0]?.skills || ''}%`, `%JavaScript%`]
    );
    
    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json("Error fetching recommendations");
  }
};
