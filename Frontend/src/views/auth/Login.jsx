
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const SigninHandler = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      toast.error('Login failed');
      console.error('Login failed:', result.error);
    } else {
      console.log('Login successful:', result);
      toast.success('Login successful');
      router.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r  to-teal-900 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold  mb-2">Welcome Back</h1>
            <p className="text-emerald-900 text-sm">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={SigninHandler} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-200"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-200"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-stone-500"
                  />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <a
                  href="/register"
                  className="text-sm text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-4 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
