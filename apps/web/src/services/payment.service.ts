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

export const createCheckoutSession = async (plan: string, billingCycle: string) => {
  const response = await axios.post(
    `${API_URL}/subscriptions/stripe/checkout`,
    { plan, billingCycle },
    getAuthHeaders()
  );
  return response.data;
};

export const getUserSubscriptions = async (userId: string) => {
  const response = await axios.get(
    `${API_URL}/subscriptions/user/${userId}`,
    getAuthHeaders()
  );
  return response.data;
};

export const cancelSubscription = async (subscriptionId: string) => {
  const response = await axios.post(
    `${API_URL}/subscriptions/${subscriptionId}/cancel`,
    {},
    getAuthHeaders()
  );
  return response.data;
};
