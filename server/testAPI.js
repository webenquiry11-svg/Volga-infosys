import fetch from 'node-fetch';

const testAPI = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/blogs');
    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    console.log('Number of blogs:', data.data.length);
  } catch (error) {
    console.error('Error:', error);
  }
};

testAPI();
