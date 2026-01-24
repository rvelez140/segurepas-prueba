import axios from 'axios';
import { loadToken } from './auth.service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:48721/api';

const getAuthHeaders = () => {
  const token = loadToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getDashboard = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await axios.get(
    `${API_URL}/analytics/dashboard?${params.toString()}`,
    getAuthHeaders()
  );
  return response.data;
};

export const getTrends = async (months: number = 12) => {
  const response = await axios.get(
    `${API_URL}/analytics/trends?months=${months}`,
    getAuthHeaders()
  );
  return response.data;
};
