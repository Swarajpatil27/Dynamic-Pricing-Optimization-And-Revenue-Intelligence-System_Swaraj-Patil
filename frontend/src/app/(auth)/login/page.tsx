'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Standard Email/Password Submission
  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('token', 'standard-auth-token');
    router.push('/dashboard/products');
  };

  // Google Sign-In Success Handler
  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log('Google Auth Success:', credentialResponse);
    localStorage.setItem('token', credentialResponse.credential || 'google-auth-token');
    router.push('/dashboard/products');
  };

  // Google Sign-In Error Handler
  const handleGoogleError = () => {
    alert('Google Sign-In failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId="195149060016-upksnoae67mfubg8rj7op2ut6imgkeco.apps.googleusercontent.com">
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full space-y-6">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">PricePilot AI</h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to your revenue optimization dashboard
            </p>
          </div>

          {/* Standard Login Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@company.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-medium absolute uppercase">
              Or
            </span>
          </div>

          {/* Google Sign-In Button */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Footer Links */}
          <p className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}