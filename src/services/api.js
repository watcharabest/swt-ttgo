// ตัวอย่าง src/services/api.js หรือที่ไหนก็ได้
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

export default api;
