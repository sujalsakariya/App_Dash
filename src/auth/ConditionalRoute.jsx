import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ConditionalRoute = ({ element, allowedRoles = [], blockedRoles = [], redirectTo = "/" }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 <= Date.now()) {
      return <Navigate to="/auth/login" replace />;
    }

    // Extract user role from JWT token
    const userRole = decoded.role || decoded.Role || decoded.user_role || decoded.UserRole || 
                     decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                     decoded.sub || decoded.unique_name;

    // Check if user role is blocked (like payadmin trying to access non-payment pages)
    if (blockedRoles && blockedRoles.length > 0 && blockedRoles.includes(userRole)) {
      return <Navigate to={redirectTo} replace />;
    }

    // If no allowed roles specified, allow access (unless blocked)
    if (!allowedRoles || allowedRoles.length === 0) {
      return element;
    }

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(userRole)) {
      return element;
    }

    // If user doesn't have required role, redirect
    return <Navigate to={redirectTo} replace />;

  } catch (error) {
    // Silently handle JWT decode errors
    return <Navigate to="/auth/login" replace />;
  }
};

export { ConditionalRoute };
