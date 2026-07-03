import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ArrowRight, ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';
import kithLogo from '../assets/kithlogo.png';

export const Auth: React.FC = () => {
  const { loginUser, updateProfile, showToast } = useApp();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'individual' | 'kith'>('individual');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Show/Hide password & Email verification screens
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        try {
          const user = await loginUser(email, password, 'individual', false);
          // If a new user with empty bio, redirect to onboarding
          if (user.bio === 'Just joined Kith! Excited to help out.' && user.skills.length === 0) {
            navigate('/onboarding');
          } else {
            if (user.role === 'admin') {
              navigate('/admin-dashboard');
            } else if (user.role === 'kith') {
              navigate('/org-dashboard');
            } else {
              navigate('/feed');
            }
          }
        } catch (err: any) {
          if (err.message === 'VERIFICATION_REQUIRED') {
            setVerificationSent(true);
          } else {
            setError('Invalid email or password. Please try again.');
          }
        }
      } else if (mode === 'register') {
        // Direct signup & signin
        const user = await loginUser(email, password, role, true);
        if (name) {
          await updateProfile({ name });
        }
        navigate('/onboarding');
      } else if (mode === 'forgot') {
        showToast('Reset password link sent (simulated)', 'info');
        setMode('login');
      }
    } catch (err: any) {
      if (err.message === 'VERIFICATION_REQUIRED') {
        setVerificationSent(true);
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-all duration-200">
      {verificationSent ? (
        <Card className="w-full max-w-md p-8 text-center relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-blue-500 via-brand-green-500 to-brand-amber-500" />
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-blue-50 dark:bg-brand-blue-900/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-brand-blue-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
              Confirm your email
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              We've sent a verification link to <strong className="text-slate-700 dark:text-slate-350">{email}</strong>.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-2xl border dark:border-slate-800">
              Please click the link in that email to activate your account. If you don't see it, please check your spam folder.
            </p>
          </div>

          <Button
            onClick={() => {
              setVerificationSent(false);
              setMode('login');
              setPassword('');
            }}
            fullWidth
          >
            Back to Sign In
          </Button>
        </Card>
      ) : (
        <Card className="w-full max-w-md p-8 text-center relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-blue-500 via-brand-green-500 to-brand-amber-500" />
          
          {/* Back Button */}
          <button
            onClick={() => navigate('/landing')}
            className="absolute top-4 left-4 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Back to Landing Page"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center mb-8">
            <img src={kithLogo} alt="KindLink Logo" className="w-20 h-20 object-contain mb-3 animate-scale-in" />
            <h1 className="text-2xl font-bold font-display text-slate-800 dark:text-white mt-2">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'login' && 'Connecting communities, one deed at a time'}
              {mode === 'register' && 'Join KindLink and make a difference'}
              {mode === 'forgot' && 'Enter your email to receive a recovery link'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-xl text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                
                {/* Account Type Selector */}
                <div className="text-left mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Register as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('individual')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        role === 'individual'
                          ? 'border-brand-blue-500 bg-brand-blue-50/20 text-brand-blue-600 dark:text-brand-blue-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Individual Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('kith')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        role === 'kith'
                          ? 'border-brand-green-500 bg-brand-green-50/20 text-brand-green-600 dark:text-brand-green-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Kith Account
                    </button>
                  </div>
                  
                  {/* Brief Role Explainer */}
                  <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-2.5 text-left leading-relaxed bg-slate-50/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    {role === 'individual' ? (
                      <span>💡 <strong>Individual Account:</strong> Explore feed items, claim free donations, register for volunteer opportunities, book mentorships, and chat directly.</span>
                    ) : (
                      <span>💡 <strong>Kith Account:</strong> Post volunteer events, list donations, offer free mentorship programs, and coordinate active volunteer rosters.</span>
                    )}
                  </p>
                </div>
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mode !== 'forgot' && (
              <div className="w-full text-left mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm transition-all focus:outline-none focus:border-brand-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-brand-blue-500 text-slate-800 dark:text-slate-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-brand-blue-500 hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Processing...' : (
                <span className="flex items-center justify-center">
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-brand-blue-500 hover:underline font-semibold cursor-pointer"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-brand-blue-500 hover:underline font-semibold cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
