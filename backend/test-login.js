import axios from 'axios';

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    // Test with correct credentials
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'kshivam05@gmail.com',
      password: 'test123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Request data:', error.config?.data);
  }
}

testLogin();
