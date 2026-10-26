/**
 * apiClient.js — Centralized API Client
 * All API calls go through this module for consistent error handling.
 */
import { API_BASE_URL } from '@/lib/config';

/**
 * Makes an authenticated API request.
 * @param {string} endpoint - API endpoint (e.g. '/customers')
 * @param {Object} [options={}] - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} On API error with server message
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  }
}

// ─── Customers ────────────────────────────────────────────────────────────────
export const getCustomers = () => fetchAPI('/customers');
export const getCustomerById = (id) => fetchAPI(`/customers/${id}`);
export const createCustomer = (data) => fetchAPI('/customers', { method: 'POST', body: JSON.stringify(data) });
export const updateCustomer = (id, data) => fetchAPI(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCustomer = (id) => fetchAPI(`/customers/${id}`, { method: 'DELETE' });

// ─── Projects ─────────────────────────────────────────────────────────────────
export const getProjects = () => fetchAPI('/projects');
export const getProjectsByCustomer = (customerId) => fetchAPI(`/projects/customer/${customerId}`);
export const createProject = (data) => fetchAPI('/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id, data) => fetchAPI(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id) => fetchAPI(`/projects/${id}`, { method: 'DELETE' });

// ─── Quotations ───────────────────────────────────────────────────────────────
export const getQuotations = () => fetchAPI('/quotations');
export const getQuotationsByCustomer = (customerId) => fetchAPI(`/quotations/customer/${customerId}`);
export const createQuotation = (data) => fetchAPI('/quotations', { method: 'POST', body: JSON.stringify(data) });
export const deleteQuotation = (id) => fetchAPI(`/quotations/${id}`, { method: 'DELETE' });

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = () => fetchAPI('/settings');
export const updateSettings = (data) => fetchAPI('/settings', { method: 'PUT', body: JSON.stringify(data) });
