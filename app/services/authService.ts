// src/services/authService.ts
const API_URL = 'http://localhost:5001'; 
// const API_URL = 'https://exam-grader-backend.onrender.com'

export const signup = async (userData: {
  name: string;
  email: string;
  password: string;
  mat_no: string;
  phone: string;
  role: string;
  department: string;
  level?: string;
}) => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Signup failed');
  }

  return response.json();
};

// authService.js

export const login = async (credentials: {
  email: string;
  password: string;
  role: string;
  rememberMe?: boolean;
}) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Don't include Authorization header for login
    },
    body: JSON.stringify(credentials),
    credentials: 'include', // For cookies if using them
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return await response.json();
};

// Add a separate function for authenticated requests
export const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token is invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    throw new Error('Failed to fetch profile');
  }

  return await response.json();
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Helper function to logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};