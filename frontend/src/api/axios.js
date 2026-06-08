import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ominous-space-system-pj7w9xq4q6g5hr677-8000.app.github.dev/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default api;