const API_BASE_URL = '/api';

const API = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
  },
  
  posts: {
    getAll: `${API_BASE_URL}/posts`,
    getById: (id) => `${API_BASE_URL}/posts/${id}`,
    create: `${API_BASE_URL}/posts`,
    update: (id) => `${API_BASE_URL}/posts/${id}`,
    delete: (id) => `${API_BASE_URL}/posts/${id}`,
    like: (id) => `${API_BASE_URL}/posts/${id}/like`,
    comments: {
      getAll: (postId) => `${API_BASE_URL}/posts/${postId}/comments`,
      create: (postId) => `${API_BASE_URL}/posts/${postId}/comments`,
    }
  },
  
  users: {
    getProfile: (id) => `${API_BASE_URL}/users/${id}`,
    updateProfile: `${API_BASE_URL}/users/profile`,
    getPosts: (id) => `${API_BASE_URL}/users/${id}/posts`,
  }
};

async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

window.API = API;
window.apiRequest = apiRequest;