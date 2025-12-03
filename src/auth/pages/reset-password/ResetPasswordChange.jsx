import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, KeenIcon } from '@/components';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import { useLayout } from '@/providers';
import axios, { AxiosError } from 'axios';
import { MoveLeft } from 'lucide-react';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-xs ${
      type === 'success' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
    } border-l-4 animate-fadeIn`}>
      <div className="flex items-center">
        <div className={`mr-3 ${type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          <KeenIcon icon={type === 'success' ? 'check-circle' : 'x-circle'} />
        </div>
        <div className="text-sm font-medium">{message}</div>
        <button 
          onClick={onClose} 
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-700"
        >
          <KeenIcon icon="x" />
        </button>
      </div>
    </div>
  );
};

const passwordSchema = Yup.object().shape({
  oldPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('Please confirm your new password'),
});

const ResetPasswordChange = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(undefined);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirmation, setShowNewPasswordConfirmation] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
      setLoading(true);
      setHasErrors(undefined);

      try {
        const token = localStorage.getItem('token');
        const id = 0; // Replace this with actual user ID if available

        await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/User/ResetPassword`,
          {
            id,
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Remove token and user data from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        delete axios.defaults.headers.common['Authorization'];

        setHasErrors(false);
        showNotification('Password changed successfully! Please login with your new password.', 'success');
        resetForm();
        
        // Delay navigation to allow the user to see the notification
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } catch (error) {
        let errorMessage = 'Password reset failed. Please try again.';
        
        if (error instanceof AxiosError && error.response) {
          errorMessage = error.response.data.message || errorMessage;
        }
        
        setStatus(errorMessage);
        setHasErrors(true);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      {notification.show && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={hideNotification} 
        />
      )}
      
      <div className="max-w-[370px] w-full">
        <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit} noValidate>
          <Link to='/' className='text-white flex'><MoveLeft />&nbsp; Back</Link>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-100 dark:text-gray-900">Change Password</h3>
            <span className="text-2sm text-gray-100 dark:text-gray-900">Update your password below</span>
          </div>

          {hasErrors && <Alert variant="danger">{formik.status}</Alert>}

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-200 dark:text-gray-900">Current Password</label>
            <label className="input">
              <input
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                autoComplete="off"
                {...formik.getFieldProps('oldPassword')}
                className={clsx('form-control bg-transparent dark:text-gray-900', {
                  'is-invalid': formik.touched.oldPassword && formik.errors.oldPassword,
                  'is-valid': formik.touched.oldPassword && !formik.errors.oldPassword,
                })}
              />
              <button
                className="btn btn-icon"
                onClick={(e) => {
                  e.preventDefault();
                  setShowOldPassword(!showOldPassword);
                }}
              >
                <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showOldPassword })} />
                <KeenIcon icon="eye-slash" className={clsx('text-gray-500', { hidden: !showOldPassword })} />
              </button>
            </label>
            {formik.touched.oldPassword && formik.errors.oldPassword && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.oldPassword}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-200 dark:text-gray-900">New Password</label>
            <label className="input">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                autoComplete="off"
                {...formik.getFieldProps('newPassword')}
                className={clsx('form-control bg-transparent dark:text-gray-900', {
                  'is-invalid': formik.touched.newPassword && formik.errors.newPassword,
                  'is-valid': formik.touched.newPassword && !formik.errors.newPassword,
                })}
              />
              <button className="btn btn-icon" onClick={(e) => { e.preventDefault(); setShowNewPassword(!showNewPassword); }}>
                <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showNewPassword })} />
                <KeenIcon icon="eye-slash" className={clsx('text-gray-500', { hidden: !showNewPassword })} />
              </button>
            </label>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <span role="alert" className="text-danger text-xs mt-1">{formik.errors.newPassword}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-200 dark:text-gray-900">Confirm New Password</label>
            <label className="input">
              <input
                type={showNewPasswordConfirmation ? 'text' : 'password'}
                placeholder="Confirm new password"
                autoComplete="off"
                {...formik.getFieldProps('confirmPassword')}
                className={clsx('form-control bg-transparent dark:text-gray-900', {
                  'is-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword,
                  'is-valid': formik.touched.confirmPassword && !formik.errors.confirmPassword,
                })}
              />
              <button className="btn btn-icon" onClick={(e) => { e.preventDefault(); setShowNewPasswordConfirmation(!showNewPasswordConfirmation); }}>
                <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showNewPasswordConfirmation })} />
                <KeenIcon icon="eye-slash" className={clsx('text-gray-500', { hidden: !showNewPasswordConfirmation })} />
              </button>
            </label>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <span role="alert" className="text-danger text-xs mt-1">{formik.errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary flex justify-center grow" disabled={loading}>
            {loading ? 'Please wait...' : 'Submit'}
          </button>
        </form>
      </div>
    </>
  );
};

export { ResetPasswordChange };