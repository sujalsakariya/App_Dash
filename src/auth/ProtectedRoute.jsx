import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  let isValid = false;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      isValid = decoded.exp * 1000 > Date.now(); // Convert to milliseconds
    } catch (e) {
      isValid = false;
    }
  }

  if (!token || !isValid) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute };
