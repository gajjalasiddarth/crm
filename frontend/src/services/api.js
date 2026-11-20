import axios from 'axios';

//const api = axios.create({ baseURL: '/api' });
const api = axios.create({
  baseURL: 'https://customer-relationship-management-vp3l.onrender.com/api'
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updateprofile', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  forgotPassword: (data) => api.post('/auth/forgotpassword', data),
  resetPassword: (token, data) => api.put(`/auth/resetpassword/${token}`, data),
};

// Contacts
export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getOne: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, d) => api.put(`/contacts/${id}`, d),
  delete: (id) => api.delete(`/contacts/${id}`),
  getActivities: (id) => api.get(`/contacts/${id}/activities`),
};

// Leads
export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getOne: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, d) => api.put(`/leads/${id}`, d),
  delete: (id) => api.delete(`/leads/${id}`),
  convert: (id, d) => api.post(`/leads/${id}/convert`, d),
};

// Deals
export const dealsAPI = {
  getAll: (params) => api.get('/deals', { params }),
  getOne: (id) => api.get(`/deals/${id}`),
  create: (data) => api.post('/deals', data),
  update: (id, d) => api.put(`/deals/${id}`, d),
  delete: (id) => api.delete(`/deals/${id}`),
  getPipeline: () => api.get('/deals/pipeline'),
};

// Tasks
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, d) => api.put(`/tasks/${id}`, d),
  delete: (id) => api.delete(`/tasks/${id}`),
  getUpcoming: () => api.get('/tasks/upcoming'),
};

// Emails
export const emailsAPI = {
  getAll: (params) => api.get('/emails', { params }),
  getOne: (id) => api.get(`/emails/${id}`),
  send: (data) => api.post('/emails', data),
  delete: (id) => api.delete(`/emails/${id}`),
};

// Reports
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getRevenue: (params) => api.get('/reports/revenue', { params }),
  getTeam: () => api.get('/reports/team'),
  getActivities: (params) => api.get('/reports/activities', { params }),
};

// Users
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, d) => api.put(`/users/${id}`, d),
  delete: (id) => api.delete(`/users/${id}`),
};

// Activities
export const activitiesAPI = {
  getAll: (params) => api.get('/activities', { params }),
};
