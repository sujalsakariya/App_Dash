import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 <= Date.now()) {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Extract user role from JWT token
    // The role might be in different claims, check common ones
    const userRole = decoded.role || decoded.Role || decoded.user_role || decoded.UserRole || 
                     decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                     decoded.sub || decoded.unique_name;

    // If no allowed roles specified, allow access (backward compatibility)
    if (!allowedRoles || allowedRoles.length === 0) {
      return children || <Outlet />;
    }

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(userRole)) {
      return children || <Outlet />;
    }

    // If user doesn't have required role, redirect to unauthorized or dashboard
    return <Navigate to="/" replace />;

  } catch (error) {
    console.error('Error decoding token:', error);
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
};

export { RoleBasedRoute };
