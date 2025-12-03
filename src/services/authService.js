import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Define a service that handles authentication-related functionality
const authService = {
  // Set up axios with authentication headers
  setupAxios: () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },
  
  // Login the user
  login: async (username, password) => {
    const API_URL = import.meta.env.VITE_APP_API_URL;
    
    const response = await axios.post(`${API_URL}/User/Login`, {
      username,
      password,
    });
    
    if (response.data && response.data.tokenId) {
      // Store the token and user data
      localStorage.setItem('token', response.data.tokenId);
      localStorage.setItem('userName', response.data.name || 'User');
      
      // Try to extract and store user role from JWT token
      try {
        const decoded = jwtDecode(response.data.tokenId);
        const userRole = decoded.role || decoded.Role || decoded.user_role || decoded.UserRole || 
                         decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                         decoded.sub || decoded.unique_name;
        
        if (userRole) {
          localStorage.setItem('userRole', userRole);
        }
      } catch (error) {
        // Silently handle JWT decode errors
      }
      
      // Setup axios with the new token
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokenId}`;
      
      return response.data;
    }
    
    return null;
  },
  
  // Logout the user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    delete axios.defaults.headers.common['Authorization'];
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;