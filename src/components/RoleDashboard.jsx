import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '@/utils/RoleUtils';
import { Demo1LightSidebarPage } from '@/pages/dashboards';

const RoleDashboard = () => {
  const userRole = getUserRole();
  
  // If user is payadmin, redirect to Payments page since they shouldn't see dashboard
  if (userRole === 'payadmin') {
    return <Navigate to="/Payments" replace />;
  }
  
  // For stackadmin (main admin) and other authorized users, show the normal dashboard
  if (userRole === 'stackadmin' || userRole === 'admin' || userRole === 'user' || userRole === 'manager') {
    return <Demo1LightSidebarPage />;
  }
  
  // For unknown roles, redirect to payments for safety
  return <Navigate to="/Payments" replace />;
};

export { RoleDashboard };
