import db from '../models/database.js';

export const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const [rows] = await db.query('SELECT 1 as status');
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};
