import axios from 'axios';
import { SHEETS_API_BASE } from './ApiConstants';

export const axiosInstance = axios.create({
  baseURL: SHEETS_API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});