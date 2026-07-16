'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';
import { Eye, EyeOff, Bug } from 'lucide-react';

export default function SignInClient() {
    const router = useRouter();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const result = await signIn('standard', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setErrorMsg(result.error);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            setErrorMsg("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 shadow-xl rounded-2xl border border-gray-100">
                
                {/* Header Section */}
                <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                        <Bug size={28} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Please sign in to your account to continue
                    </p>
                </div>

                {/* Form Section */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="you@company.com"
                                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        
                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="text-sm text-red-600 bg-red-50 p-3.5 rounded-lg border border-red-100 flex items-center">
                            <span className="block sm:inline">{errorMsg}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            className="w-full py-3 text-base font-medium rounded-lg shadow-sm" 
                            variant="primary"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </div>
                </form>
                
                {/* Footer Section */}
                <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
                    Don't have an account?{' '}
                    <a href="/signup" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                        Create one now
                    </a>
                </div>
            </div>
        </div>
    );
}