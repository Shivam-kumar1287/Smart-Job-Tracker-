import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function fixApplicationsTable() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');

    // Add created_at column to applications table
    try {
      await db.execute(`
        ALTER TABLE applications 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Added created_at column to applications table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ created_at column already exists in applications table');
      } else {
        throw error;
      }
    }

    // Add updated_at column to applications table
    try {
      await db.execute(`
        ALTER TABLE applications 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✅ Added updated_at column to applications table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ updated_at column already exists in applications table');
      } else {
        throw error;
      }
    }

    // Check if applications table has the correct structure
    const [columns] = await db.execute(`
      DESCRIBE applications
    `);
    
    console.log('\n📋 Applications table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    await db.end();
    console.log('\n🎉 Database schema updated successfully!');

  } catch (error) {
    console.error('❌ Error updating database schema:', error);
    process.exit(1);
  }
}

fixApplicationsTable();
