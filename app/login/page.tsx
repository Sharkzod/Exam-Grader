"use client";
import { useState } from 'react';
import { User, Lock, Mail, BookOpen, GraduationCap, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { login } from '@/app/services/authService';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';



const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // Keep role for UI purposes, but don't use it for validation
    role: 'lecturer' 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    if (touched[name]) {
      const tempErrors = { ...errors };
      delete tempErrors[name];
      
      if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        tempErrors.email = 'Please enter a valid email';
      }
      
      setErrors(tempErrors);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // FIXED: Remove role validation entirely
 const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Please fill in all fields correctly', {
      position: 'top-center'
    });
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const credentials = {
      email: formData.email,
      password: formData.password,
      rememberMe
    };

    const response = await login(credentials);
    
    console.log('Login successful:', response);
    
    if (!response.token) {
      throw new Error('No authentication token received');
    }

    // Get the user's actual role from backend - FIXED THIS LINE
    const userRole = response.user?.role;
    if (!userRole) {
      throw new Error('No role information received');
    }

    // Store user data and token
    localStorage.setItem('token', response.token);
    
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    // Show success toast with the CORRECT role from backend
    const roleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1);
    toast.success(`Welcome back, ${roleDisplay}! Redirecting to your dashboard...`, {
      duration: 2000,
      position: 'top-center',
      icon: '👋',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }
    });
    
    // Redirect based on ACTUAL user role from backend
    setTimeout(() => {
      if (userRole === 'lecturer' || userRole === 'admin') {
        window.location.href = '/markingSetup';
      } else if (userRole === 'student') {
        const userId = response.user?.id || response.id;
        window.location.href = `/student/dashboard/${userId}`;
      }
    }, 2000);
    
  } catch (error) {
    console.error('Login error:', error);
    setIsSubmitting(false);
    
    let errorMessage = 'Login failed. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('401') || error.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('404') || error.message.includes('User not found')) {
        errorMessage = 'No account found with this email. Please sign up first.';
      }
    }
    
    toast.error(errorMessage, {
      duration: 4000,
      position: 'top-center',
      icon: '❌',
      style: {
        background: '#EF4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }
    });
  }
};

  const toggleUserType = () => {
    const newRole = formData.role === 'lecturer' ? 'student' : 'lecturer';
    setFormData(prev => ({
      ...prev,
      role: newRole
    }));
    // Clear any previous errors when toggling
    setErrors({});
  };

  const isFormValid = () => {
    return formData.email && 
           formData.password &&
           Object.keys(errors).length === 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Toaster 
        toastOptions={{
          className: '',
          style: {
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            fontWeight: '500'
          },
        }}
      />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl backdrop-blur-sm mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-blue-100 text-lg">Sign in to your account</p>
            </div>
          </div>
          
          {/* Role Toggle */}
          <div className="flex bg-gray-50">
            <button
              type="button"
              onClick={toggleUserType}
              className={`flex-1 py-4 font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                formData.role === 'lecturer' 
                  ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-500' 
                  : 'text-gray-600 hover:bg-white/70 hover:text-gray-800'
              }`}
            >
              <BookOpen className={`h-5 w-5 transition-transform ${formData.role === 'lecturer' ? 'scale-110' : ''}`} />
              Lecturer
            </button>
            <button
              type="button"
              onClick={toggleUserType}
              className={`flex-1 py-4 font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                formData.role === 'student' 
                  ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-500' 
                  : 'text-gray-600 hover:bg-white/70 hover:text-gray-800'
              }`}
            >
              <GraduationCap className={`h-5 w-5 transition-transform ${formData.role === 'student' ? 'scale-110' : ''}`} />
              Student
            </button>
          </div>
          
          {/* Form */}
          <div className="p-8 space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  errors.email ? 'text-red-400' : touched.email && formData.email && !errors.email ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pl-12 pr-4 text-black w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : touched.email && formData.email && !errors.email
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  } focus:ring-4 placeholder-gray-400`}
                  placeholder="Enter your email address"
                />
                {touched.email && formData.email && !errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{errors.email}</p>
                </div>
              )}
            </div>
            
            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  errors.password ? 'text-red-400' : touched.password && formData.password && !errors.password ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pl-12 pr-12 text-black w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : touched.password && formData.password && !errors.password
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  } focus:ring-4 placeholder-gray-400`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{errors.password}</p>
                </div>
              )}
            </div>
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
            
            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid()}
                className={`w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isSubmitting || !isFormValid() 
                    ? 'opacity-50 cursor-not-allowed hover:scale-100' 
                    : 'hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing you in...
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      {formData.role === 'lecturer' ? <BookOpen className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                    </div>
                    Sign in as {formData.role === 'lecturer' ? 'Lecturer' : 'Student'}
                  </>
                )}
              </button>
            </div>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
            </div>
            
            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-600 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;