import { jwtDecode } from 'jwt-decode';

// Get user role from JWT token
export const getUserRole = () => {
  // First try to get from localStorage (faster)
  const storedRole = localStorage.getItem('userRole');
  if (storedRole) {
    return storedRole;
  }

  // Fallback to JWT token decoding
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 <= Date.now()) {
      return null;
    }

    // Extract user role from JWT token - check common claim names
    const role = decoded.role || 
                 decoded.Role || 
                 decoded.user_role || 
                 decoded.UserRole || 
                 decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                 decoded.sub || 
                 decoded.unique_name;
                 
    // Store for future use
    if (role) {
      localStorage.setItem('userRole', role);
    }
    
    return role;
  } catch (error) {
    // Silently handle JWT decode errors
    return null;
  }
};

// Filter menu items based on user role
export const getFilteredMenuItems = (menuItems, userRole) => {
  if (!userRole) {
    return menuItems;
  }

  // For payadmin users, only show payment and expense related items
  if (userRole === 'payadmin') {
    return menuItems.filter(item => {
      // Keep headings and items related to payments and expenses
      return item.heading === 'Payments' || 
             item.heading === 'Expenses' ||
             item.path === '/Payments' ||
             item.path === '/Expense';
    });
  }

  // For stackadmin (main admin) and other authorized roles, show all items
  if (userRole === 'stackadmin' || userRole === 'admin' || userRole === 'user' || userRole === 'manager') {
    return menuItems;
  }

  // For unknown roles, show limited access (same as payadmin for safety)
  return menuItems.filter(item => {
    return item.heading === 'Payments' || 
           item.heading === 'Expenses' ||
           item.path === '/Payments' ||
           item.path === '/Expense';
  });
};
