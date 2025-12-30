import axios from 'axios';

const axiosInstance = axios.create({
  timeout: 15000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});


// Export the single instance
export default axiosInstance;
