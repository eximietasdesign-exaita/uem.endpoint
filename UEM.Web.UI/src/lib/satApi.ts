import axios from 'axios';
export const sat = axios.create({ baseURL: '/sat' }); // via Vite proxy
