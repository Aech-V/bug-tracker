'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/Button';
import { SIGN_UP } from '../../graphql/mutations';
import { Eye, EyeOff, Bug, CheckCircle2, XCircle } from 'lucide-react';

export default function SignUpClient() {
    const router = useRouter();
    
    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Validation State
    const [errorMsg, setErrorMsg] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const [signUp, { loading }] = useMutation(SIGN_UP);

    // Strict Email Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Password Criteria Requirements
    const criteria = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[^A-Za-z0-9]/.test(formData.password),
    };

    // Evaluate Password Strength in real-time
    useEffect(() => {
        let score = 0;
        if (criteria.length) score += 1;
        if (criteria.uppercase) score += 1;
        if (criteria.lowercase) score += 1;
        if (criteria.number) score += 1;
        if (criteria.special) score += 1;
        setPasswordStrength(score);
    }, [formData.password]);

    const handleEmailBlur = () => {
        if (formData.email && !emailRegex.test(formData.email)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setEmailError('');

        // 1. Validate Email
        if (!emailRegex.test(formData.email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        // 2. Validate Password Strength (Must meet all 5 criteria)
        if (passwordStrength < 5) {
            setErrorMsg('Please ensure your password meets all the security requirements.');
            return;
        }

        // 3. Validate Password Match
        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        try {
            await signUp({
                variables: {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                },
            });

            // Automatically sign in the user after successful registration
            const signInResult = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (signInResult?.error) {
                setErrorMsg(signInResult.error);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Failed to create account. Email might already be in use.');
        }
    };

    // Helper for strength bar color
    const getStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength <= 4) return 'bg-amber-500';
        return 'bg-green-500';
    };

    const getStrengthLabel = () => {
        if (formData.password.length === 0) return '';
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength <= 4) return 'Good';
        return 'Strong';
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
                        Create an account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Join the platform to start tracking issues
                    </p>
                </div>

                {/* Form Section */}
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                        <input
                            type="email"
                            required
                            placeholder="you@company.com"
                            className={`block w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none ${emailError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                            value={formData.email}
                            onBlur={handleEmailBlur}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (emailError) setEmailError('');
                            }}
                        />
                        {emailError && <p className="mt-1.5 text-xs text-red-600">{emailError}</p>}
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Create a strong password"
                                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        {/* Password Strength Meter */}
                        {formData.password && (
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-500">Password strength</span>
                                    <span className={`text-xs font-bold ${passwordStrength >= 5 ? 'text-green-600' : passwordStrength >= 3 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {getStrengthLabel()}
                                    </span>
                                </div>
                                <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div 
                                            key={level} 
                                            className={`h-full flex-1 transition-colors duration-300 ${passwordStrength >= level ? getStrengthColor() : 'bg-transparent'}`} 
                                        />
                                    ))}
                                </div>
                                
                                {/* Strict Criteria Checklist */}
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        {criteria.length ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-300" />}
                                        <span className={criteria.length ? 'text-gray-700' : ''}>8+ characters</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {criteria.uppercase ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-300" />}
                                        <span className={criteria.uppercase ? 'text-gray-700' : ''}>Uppercase letter</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {criteria.lowercase ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-300" />}
                                        <span className={criteria.lowercase ? 'text-gray-700' : ''}>Lowercase letter</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {criteria.number ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-300" />}
                                        <span className={criteria.number ? 'text-gray-700' : ''}>Number</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 col-span-2">
                                        {criteria.special ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-300" />}
                                        <span className={criteria.special ? 'text-gray-700' : ''}>Special character (!@#$%^&*)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                placeholder="Confirm your password"
                                className={`block w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* General Error Message */}
                    {errorMsg && (
                        <div className="text-sm text-red-600 bg-red-50 p-3.5 rounded-lg border border-red-100 flex items-center">
                            {errorMsg}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            className="w-full py-3 text-base font-medium rounded-lg shadow-sm" 
                            isLoading={loading}
                            disabled={loading || passwordStrength < 5}
                        >
                            Create Account
                        </Button>
                    </div>
                </form>
                
                {/* Footer Section */}
                <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
                    Already have an account?{' '}
                    <a href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                        Sign in instead
                    </a>
                </div>
            </div>
        </div>
    );
}