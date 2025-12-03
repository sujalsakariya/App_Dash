import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '@/utils/RoleUtils';

const DashboardRedirect = () => {
  const userRole = getUserRole();
  
  // If user is payadmin, redirect to Payments page
  if (userRole === 'payadmin') {
    return <Navigate to="/Payments" replace />;
  }
  
  // For other users, redirect to normal dashboard
  return <Navigate to="/dashboard" replace />;
};

export { DashboardRedirect };
