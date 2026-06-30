import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Heart, Globe, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const Auth: React.FC = () => {
  const { loginUser } = useApp();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'organization'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        const user = await loginUser(email, 'user');
        // If a new user just created in mockDb, let's navigate to onboarding
        if (user.bio === 'Just joined KindLink! Excited to help out.' && user.skills.length === 0) {
          navigate('/onboarding');
        } else {
          navigate('/feed');
        }
      } else if (mode === 'register') {
        // Go to verification simulation
        setMode('verify');
      } else if (mode === 'forgot') {
        alert('Reset password link sent (simulated)');
        setMode('login');
      }
    } catch (err) {
      setError('An error occurred during authentication');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const user = await loginUser(email, role);
      navigate('/onboarding');
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setLoading(true);
    try {
      const mockEmail = `${provider.toLowerCase()}user@example.com`;
      const user = await loginUser(mockEmail, 'user');
      if (user.bio === 'Just joined KindLink! Excited to help out.' && user.skills.length === 0) {
        navigate('/onboarding');
      } else {
        navigate('/feed');
      }
    } catch (err) {
      setError(`OAuth failed with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-all duration-200">
      <Card className="w-full max-w-md p-8 text-center relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-blue-500 via-brand-green-500 to-brand-amber-500" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue-500/10 flex items-center justify-center mb-3">
            <Heart className="w-6 h-6 text-brand-blue-500 fill-brand-blue-500/10" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
            {mode === 'verify' && 'Verify your email'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login' && 'Connecting communities, one deed at a time'}
            {mode === 'register' && 'Join Kith and make a difference'}
            {mode === 'forgot' && 'Enter your email to receive a recovery link'}
            {mode === 'verify' && `We sent a code to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-xl text-left">
            {error}
          </div>
        )}

        {mode !== 'verify' && (
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
                      onClick={() => setRole('user')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        role === 'user'
                          ? 'border-brand-blue-500 bg-brand-blue-50/20 text-brand-blue-600 dark:text-brand-blue-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Individual Helper
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('organization')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        role === 'organization'
                          ? 'border-brand-green-500 bg-brand-green-50/20 text-brand-green-600 dark:text-brand-green-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      NGO / Organization
                    </button>
                  </div>
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
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
                <span className="flex items-center">
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              )}
            </Button>
          </form>
        )}

        {mode === 'verify' && (
          <div className="space-y-6">
            <div className="flex justify-center space-x-2 my-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <input
                  key={num}
                  type="text"
                  maxLength={1}
                  defaultValue={num === 1 ? '4' : num === 2 ? '8' : num === 3 ? '2' : ''}
                  className="w-12 h-12 text-center text-lg font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
                />
              ))}
            </div>

            <Button onClick={handleVerify} fullWidth disabled={loading}>
              {loading ? 'Verifying...' : (
                <span className="flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Verify and Continue
                </span>
              )}
            </Button>
            
            <button
              onClick={() => setMode('register')}
              className="text-xs text-slate-500 hover:underline block mx-auto cursor-pointer"
            >
              Go back
            </button>
          </div>
        )}

        {mode !== 'verify' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleOAuth('Google')}
                className="flex items-center justify-center py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition active-scale"
              >
                <Globe className="w-4 h-4 text-red-500" />
              </button>
              <button
                onClick={() => handleOAuth('Apple')}
                className="flex items-center justify-center py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition active-scale"
              >
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200"></span>
              </button>
              <button
                onClick={() => handleOAuth('Facebook')}
                className="flex items-center justify-center py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition active-scale"
              >
                <span className="text-sm font-bold text-brand-blue-600">f</span>
              </button>
            </div>

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
          </>
        )}
      </Card>
    </div>
  );
};
