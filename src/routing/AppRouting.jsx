import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, ConditionalRoute } from '@/auth';
import { Demo1Layout } from '@/layouts/demo1';
import { RoleDashboard } from '@/components/RoleDashboard';
import { Leads } from '@/pages/leads';
import { AuthPage } from '@/auth';
import { ErrorsRouting } from '@/errors';
import { DataLeads } from '@/pages/dataPage/DataLeads';
import { Sales } from '@/pages/sales/Sales';
import { Report } from '@/pages/report/Report';
import { DPLeads } from '@/pages/DPLeads/DPLeads';
import { Statement } from '@/pages/DPLeads/statement';
import { Payment } from '../pages/Payments/Payment';
import { Expense } from '@/pages/Expense';

const AppRouting = () => {
  return (
    <Routes>
      {/* Public routes (login, reset, etc.) */}
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="error/*" element={<ErrorsRouting />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Demo1Layout />}>
          {/* Dashboard - role-based redirect */}
          <Route path="/" element={<RoleDashboard />} />

          {/* Other pages - accessible to stackadmin and other roles, but NOT payadmin */}
          <Route
            path="/Leads"
            element={
              <ConditionalRoute
                element={<Leads />}
                allowedRoles={['stackadmin', 'Stackadmin', 'admin']}
                blockedRoles={['payadmin']}
                redirectTo="/Payments"
              />
            }
          />
          <Route
            path="/AllLeads"
            element={
              <ConditionalRoute
                element={<DataLeads />}
                allowedRoles={['stackadmin', 'Stackadmin', 'admin']}
                blockedRoles={['payadmin']}
                redirectTo="/Payments"
              />
            }
          />
          <Route
            path="/Sales"
            element={
              <ConditionalRoute
                element={<Sales />}
                allowedRoles={['stackadmin', 'Stackadmin', 'admin']}
                blockedRoles={['payadmin']}
                redirectTo="/Payments"
              />
            }
          />
          <Route
            path="/Dispositions"
            element={
              <ConditionalRoute
                element={<Report />}
                allowedRoles={['stackadmin', 'Stackadmin', 'admin']}
                blockedRoles={['payadmin']}
                redirectTo="/Payments"
              />
            }
          />
          <Route
            path="/DPLeads$$2026"
            element={
              <ConditionalRoute
                element={<DPLeads />}
                allowedRoles={['stackadmin', 'Stackadmin', 'admin']}
                blockedRoles={['payadmin']}
                redirectTo="/Payments"
              />
            }
          />
          <Route
            path="/DPLeads/Statement"
            element={
              <ConditionalRoute
                element={<Statement />}
                allowedRoles={['stackadmin', 'Stackadmin', 'admin']}
                blockedRoles={['payadmin']}
                redirectTo="/Payments"
              />
            }
          />
          {/* Payment and Expense pages - accessible to ALL authenticated users (stackadmin and payadmin) */}
          <Route path="/Payments" element={<Payment />} />
          <Route path="/Expense" element={<Expense />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export { AppRouting };
