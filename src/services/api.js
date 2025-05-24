// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,  // อ่านจาก .env.production / Vercel
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
