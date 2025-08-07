import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { logger } from '@/utils/logger';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup, signInWithGoogle } = useAuth();

  React.useEffect(() => {
    logger.logPageView('/login');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const action = isSignUp ? 'signup' : 'login';
    logger.logUserAction(`${action} attempt`, { email, method: 'email' });

    try {
      if (isSignUp) {
        await signup(email, password, fullName);
        setError('');
        logger.logUserAction('signup success', { email });
        // Switch back to sign in after successful signup
        setIsSignUp(false);
      } else {
        await login(email, password);
        logger.logUserAction('login success', { email, method: 'email' });
      }
    } catch (err: any) {
      logger.error(`${action} failed`, 'Auth', { email, error: err.message });
      setError(err.message || `${isSignUp ? 'Sign up' : 'Sign in'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    logger.logUserAction('google signin attempt', { method: 'google' });
    
    try {
      await signInWithGoogle();
      logger.logUserAction('google signin success', { method: 'google' });
    } catch (err: any) {
      logger.error('Google sign-in failed', 'Auth', { error: err.message });
      setError(err.message || 'Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = !isSignUp;
    logger.logUserAction(`switched to ${newMode ? 'signup' : 'login'} mode`, { mode: newMode ? 'signup' : 'login' });
    setIsSignUp(newMode);
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Create Account' : 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp 
              ? 'Create your account to access the medical dashboard'
              : 'Enter your credentials to access your medical dashboard'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...')
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </Button>
          </form>

          <div className="my-6">
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button 
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-800 font-medium"
                disabled={isLoading}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;