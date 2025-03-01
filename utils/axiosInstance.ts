import { getStorageItemAsync } from '@/hooks/useStorageState';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/', // Base URL for your API
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const session = await getStorageItemAsync("session");
      if (session) {
        config.headers.Authorization = `Token ${session}`;
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;