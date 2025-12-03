import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import {  useNavigate } from 'react-router-dom';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import authService from '@/services/authService';

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: ''
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: checked
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset field errors
    const errors = {
      username: '',
      password: ''
    };
    let hasErrors = false;

    // Field-specific validation
    if (!formData.username) {
      errors.username = 'Username is required';
      hasErrors = true;
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
      hasErrors = true;
    }

    // Update field errors state
    setFieldErrors(errors);

    // Stop submission if there are errors
    if (hasErrors) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the login service
      const response = await authService.login(formData.username, formData.password);

      if (response) {
        // Store remember me preference
        if (formData.rememberMe) {
          localStorage.setItem('remember', 'true');
        }

        // Navigate to dashboard immediately
        navigate('/dashboard'); // Adjust this path as needed
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      // Handle API errors
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="relative max-w-md w-full mx-auto backdrop-blur-xl rounded-2xl space-y-6">
        {/* Logo/Brand Section */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <p className="dark:text-gray-800 text-gray-400 text-lg font-semibold loginHead ">Sign in</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-50 ease-in-out duration-200">
              <AlertIcon>
                <AlertCircle className="h-4 w-4" />
              </AlertIcon>
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 loginLabel">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 " />
              </div>
              <Input
                name="username"
                type="text"
                placeholder="Enter Username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                className={`pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 loginInput ${fieldErrors.username ? 'border-red-500' : ''}`}
              />
            </div>
            {fieldErrors.username && (
              <p className="text-2sm text-red-500 mt-1">{fieldErrors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700 loginLabel">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`pl-10 pr-10 h-12 border-gray-300 bg-gray-300 focus:bg-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 loginInput ${fieldErrors.password ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </Button>
            </div>
            {fieldErrors.password && (
              <p className="text-2sm text-red-500 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transform transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 font-semibold"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </div>
  );
}