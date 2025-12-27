import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const fetchRequests = (teamId = null) => {
  // Pass teamId as a query param if it exists
  const params = teamId ? { teamId } : {};
  return api.get('/requests', { params });
};

export const assignRequest = (requestId, userId) => {
  return api.patch(`/requests/${requestId}/assign`, { userId });
};

export const fetchEquipmentHistory = (equipmentId) => {
  return api.get(`/equipment/${equipmentId}/requests`);
};

export default api;