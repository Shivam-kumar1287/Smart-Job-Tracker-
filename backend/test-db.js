import dotenv from 'dotenv';
dotenv.config();

console.log('Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASS:', process.env.DB_PASS ? 'SET' : 'NOT SET');

import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log('\nAttempting to connect to MySQL...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connected to MySQL successfully!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query executed successfully:', rows);
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error number:', error.errno);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if MySQL server is running');
      console.log('2. Verify MySQL user credentials');
      console.log('3. Check if database exists');
      console.log('4. Try connecting without database first');
    }
  }
}

testConnection();
