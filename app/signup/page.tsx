"use client";
import { useState } from 'react';
import { User, Lock, Mail, Phone, BookOpen, GraduationCap, Eye, EyeOff, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import { signup } from '@/app/services/authService';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';



const SignupPage = () => {
  const [isLecturer, setIsLecturer] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  mat_no: '',
  confirmPassword: '',
  role: 'lecturer',
  department: '',
  level: ''
});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s+\-()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
      if (!formData.department.trim()) {
    newErrors.department = 'Department is required';
  }
  
  // Add level validation for students
  if (formData.role === 'student' && !formData.level) {
    newErrors.level = 'Level is required for students';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;setErrors(newErrors);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength <= 1) return { label: 'Very Weak', color: 'bg-red-500' };
    if (strength <= 2) return { label: 'Weak', color: 'bg-orange-500' };
    if (strength <= 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
    
    // Real-time validation
    if (touched[name]) {
      const tempErrors = { ...errors };
      delete tempErrors[name];
      
      if (name === 'confirmPassword' && value !== formData.password) {
        tempErrors.confirmPassword = 'Passwords do not match';
      } else if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
        tempErrors.confirmPassword = 'Passwords do not match';
      } else if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        tempErrors.email = 'Please enter a valid email';
      }
      
      setErrors(tempErrors);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name } = e.target;
  setTouched(prev => ({ ...prev, [name]: true }));
};

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // if (!validateForm()) {
  //   toast.error('Please fix the form errors before submitting');
  //   return;
  // }
  
  setIsSubmitting(true);
  setApiError('');
  
  try {
    const userData = {
      name: formData.fullName,
      email: formData.email,
      mat_no: formData.mat_no,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      level: formData.role === 'student' ? formData.level : undefined
    };

    const response = await signup(userData);
    console.log('Response', response)
    
    console.log('Signup successful:', response);
    setIsSubmitting(false);
    
    toast.success('Account created successfully!', {
      duration: 5000,
      position: 'top-center',
      icon: '🎉',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }
    });

    setTimeout(() => {
      window.location.href = '/login'
    }, 2000);
    
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      mat_no: '',
      role: 'lecturer',
      department: '',
      level: ''
    });
    setTouched({});
  } catch (error) {
    console.log('Signup error:', error);
    setIsSubmitting(false);
    
    const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
    setApiError(errorMessage);
    
    // Show error toast
    toast.error(errorMessage, {
      duration: 5000,
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
  setIsLecturer(!isLecturer);
  setFormData(prev => ({
    ...prev,
    role: !isLecturer ? 'lecturer' : 'student',
    level: '' // Reset level when switching
  }));
  setErrors({});
};

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthInfo = getPasswordStrengthLabel(passwordStrength);

  const isFormValid = () => {
  const baseValid = formData.fullName && 
         formData.email && 
         formData.phone && 
         formData.password && 
         formData.confirmPassword &&
         formData.department &&
         formData.mat_no &&
         Object.keys(errors).length === 0;
  
  // For students, also check level
  if (formData.role === 'student') {
    return baseValid && formData.level;
  }
  
  return baseValid;
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
        {/* Success Animation */}
        {success && (
          <div className="mb-4 bg-white rounded-2xl shadow-lg border border-green-200 p-6 text-center animate-in slide-in-from-top duration-500">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Account Created Successfully!</h3>
            <p className="text-green-600 text-sm">Welcome to the Exam Marking System. You can now log in to your account.</p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl backdrop-blur-sm mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Join Our Platform</h1>
              <p className="text-blue-100 text-lg">Create your account to get started</p>
            </div>
          </div>
          
          {/* Role Toggle */}
          <div className="flex bg-gray-50">
            <button
              type="button"
              onClick={() => setIsLecturer(true)}
              className={`flex-1 py-4 font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                isLecturer 
                  ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-500' 
                  : 'text-gray-600 hover:bg-white/70 hover:text-gray-800'
              }`}
            >
              <BookOpen className={`h-5 w-5 transition-transform ${isLecturer ? 'scale-110' : ''}`} />
              Lecturer
            </button>
            <button
              type="button"
              onClick={() => setIsLecturer(false)}
              className={`flex-1 py-4 font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                !isLecturer 
                  ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-500' 
                  : 'text-gray-600 hover:bg-white/70 hover:text-gray-800'
              }`}
            >
              <GraduationCap className={`h-5 w-5 transition-transform ${!isLecturer ? 'scale-110' : ''}`} />
              Student
            </button>
          </div>
          
          {/* Form */}
          <div className="p-8 space-y-6 text-gray-700">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  errors.fullName ? 'text-red-400' : touched.fullName && formData.fullName ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pl-12 pr-4 w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white ${
                    errors.fullName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : touched.fullName && formData.fullName
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  } focus:ring-4 placeholder-gray-400`}
                  placeholder="Enter your full name"
                />
                {touched.fullName && formData.fullName && !errors.fullName && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.fullName && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{errors.fullName}</p>
                </div>
              )}
            </div>
            
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
                  className={`pl-12 pr-4 w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white ${
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
            
            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  errors.phone ? 'text-red-400' : touched.phone && formData.phone && !errors.phone ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pl-12 pr-4 w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white ${
                    errors.phone 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : touched.phone && formData.phone && !errors.phone
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  } focus:ring-4 placeholder-gray-400`}
                  placeholder="Enter your phone number"
                />
                {touched.phone && formData.phone && !errors.phone && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.phone && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{errors.phone}</p>
                </div>
              )}
            </div>

            {/* Department */}
{!isLecturer && (
<div className="space-y-2">
  <label htmlFor="department" className="block text-sm font-semibold text-gray-700">
    Department
  </label>
  <div className="relative group">
    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
      errors.department ? 'text-red-400' : touched.department && formData.department ? 'text-green-400' : 'text-gray-400'
    }`}>
      <BookOpen className="h-5 w-5" />
    </div>
    <input
      type="text"
      id="department"
      name="department"
      value={formData.department}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`pl-12 pr-4 w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white ${
        errors.department 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
          : touched.department && formData.department
          ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
      } focus:ring-4 placeholder-gray-400`}
      placeholder="Enter your department"
    />
    {touched.department && formData.department && !errors.department && (
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-400" />
      </div>
    )}
  </div>
  {errors.department && (
    <div className="flex items-center gap-2 text-red-600">
      <AlertCircle className="h-4 w-4" />
      <p className="text-sm">{errors.department}</p>
    </div>
  )}
</div>
)}

{!isLecturer && (
<div className="space-y-2">
  <label htmlFor="department" className="block text-sm font-semibold text-gray-700">
    Matriculation No:
  </label>
  <div className="relative group">
    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
      errors.department ? 'text-red-400' : touched.department && formData.department ? 'text-green-400' : 'text-gray-400'
    }`}>
      <GraduationCap className="h-5 w-5" />
    </div>
    <input
      type="text"
      id="mat_no"
      name="mat_no"
      value={formData.mat_no}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`pl-12 pr-4 w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white ${
        errors.mat_no 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
          : touched.mat_no && formData.mat_no
          ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
      } focus:ring-4 placeholder-gray-400`}
      placeholder="Enter your Matriculation no."
    />
    {touched.mat_no && formData.mat_no && !errors.mat_no && (
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-400" />
      </div>
    )}
  </div>
  {errors.mat_no && (
    <div className="flex items-center gap-2 text-red-600">
      <AlertCircle className="h-4 w-4" />
      <p className="text-sm">{errors.mat_no}</p>
    </div>
  )}
</div>
)}

{/* Level (only shown for students) */}
{!isLecturer && (
  <div className="space-y-2">
    <label htmlFor="level" className="block text-sm font-semibold text-gray-700">
      Level
    </label>
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
        errors.level ? 'text-red-400' : touched.level && formData.level ? 'text-green-400' : 'text-gray-400'
      }`}>
        <GraduationCap className="h-5 w-5" />
      </div>
      <select
        id="level"
        name="level"
        value={formData.level}
        onChange={(e) => handleChange(e as any)} // TypeScript workaround
        onBlur={handleBlur}
        className={`pl-12 pr-4 w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white appearance-none ${
          errors.level 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
            : touched.level && formData.level
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
        } focus:ring-4 placeholder-gray-400`}
      >
        <option value="">Select your level</option>
        <option value="100">100 Level</option>
        <option value="200">200 Level</option>
        <option value="300">300 Level</option>
        <option value="400">400 Level</option>
        <option value="500">500 Level</option>
        <option value="600">600 Level</option>
        <option value="ND">ND</option>
        <option value="HND">HND</option>
        <option value="MSc">MSc</option>
        <option value="PhD">PhD</option>
      </select>
      {touched.level && formData.level && !errors.level && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
      )}
    </div>
    {errors.level && (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">{errors.level}</p>
      </div>
    )}
  </div>
)}


{!isLecturer && (
  <div className="space-y-2">
    <label htmlFor="level" className="block text-sm font-semibold text-gray-700">
      Role
    </label>
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
        errors.level ? 'text-red-400' : touched.role && formData.role ? 'text-green-400' : 'text-gray-400'
      }`}>
        <Briefcase className="h-5 w-5" />
      </div>
      <select
        id="role"
        name="role"
        value={formData.role}
        onChange={(e) => handleChange(e as any)} // TypeScript workaround
        onBlur={handleBlur}
        className={`pl-12 pr-4 w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white appearance-none ${
          errors.level 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
            : touched.role && formData.role
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
        } focus:ring-4 placeholder-gray-400`}
      >
        <option value="">Choose your role</option>
        <option value="100">Student</option>
        
      </select>
      {touched.role && formData.role && !errors.role && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
      )}
    </div>
    {errors.role && (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">{errors.level}</p>
      </div>
    )}
  </div>
)}
            
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
                  className={`pl-12 pr-12 w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white ${
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password strength:</span>
                    <span className={`font-medium ${passwordStrength >= 3 ? 'text-green-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {passwordStrengthInfo.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrengthInfo.color}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{errors.password}</p>
                </div>
              )}
            </div>
            
            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  errors.confirmPassword ? 'text-red-400' : touched.confirmPassword && formData.confirmPassword && !errors.confirmPassword ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pl-12 pr-12 w-full h-12 rounded-xl border-2 transition-all duration-200 bg-white ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : touched.confirmPassword && formData.confirmPassword && !errors.confirmPassword
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  } focus:ring-4 placeholder-gray-400`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {touched.confirmPassword && formData.confirmPassword && !errors.confirmPassword && (
                  <div className="absolute inset-y-0 right-12 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{errors.confirmPassword}</p>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting }
                className={`w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isSubmitting  
                    ? 'opacity-50 cursor-not-allowed hover:scale-100' 
                    : 'hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      {isLecturer ? <BookOpen className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                    </div>
                    Join as {isLecturer ? 'Lecturer' : 'Student'}
                  </>
                )}
              </button>
            </div>
            
            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href='/login' className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;