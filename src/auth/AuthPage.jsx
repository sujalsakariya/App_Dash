import { Navigate, Route, Routes } from 'react-router';
import { Login, ResetPasswordChange } from './pages';
import { AuthBrandedLayout } from '@/layouts/auth-branded';
const AuthPage = () => <Routes>
  <Route element={<AuthBrandedLayout />}>
    <Route index element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route path="/reset-password" element={<ResetPasswordChange />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Route>
</Routes>;
export { AuthPage };