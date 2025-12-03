import React from 'react';
import { getUserRole, isStackAdmin, isPayAdmin, canAccessAllPages, isPaymentOnlyUser } from '@/utils/RoleUtils';

const RoleDebugger = () => {
  const userRole = getUserRole();
  
  if (!userRole) {
    return null; // Don't show anything if no user is logged in
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '12px',
      zIndex: 9999,
      minWidth: '200px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#495057' }}>
        Role Debug Info
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Current Role:</strong> <span style={{ color: '#007bff' }}>{userRole}</span>
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Is Stack Admin:</strong> <span style={{ color: isStackAdmin() ? '#28a745' : '#dc3545' }}>{isStackAdmin() ? 'Yes' : 'No'}</span>
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Is Pay Admin:</strong> <span style={{ color: isPayAdmin() ? '#28a745' : '#dc3545' }}>{isPayAdmin() ? 'Yes' : 'No'}</span>
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Can Access All:</strong> <span style={{ color: canAccessAllPages() ? '#28a745' : '#dc3545' }}>{canAccessAllPages() ? 'Yes' : 'No'}</span>
      </div>
      <div>
        <strong>Payment Only:</strong> <span style={{ color: isPaymentOnlyUser() ? '#28a745' : '#dc3545' }}>{isPaymentOnlyUser() ? 'Yes' : 'No'}</span>
      </div>
    </div>
  );
};

export { RoleDebugger };
