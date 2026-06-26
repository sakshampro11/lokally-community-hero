import React, { FormEvent, useState } from "react";
import { ArrowLeft, Check, Shield, Eye, EyeOff } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface CitizenAuthViewProps {
  authTab: "login" | "register";
  setAuthTab: (tab: "login" | "register") => void;
  onBackToLanding: () => void;
  loginForm: any;
  setLoginForm: (form: any) => void;
  registerForm: any;
  setRegisterForm: (form: any) => void;
  agreeTerms: boolean;
  setAgreeTerms: (agree: boolean) => void;
  authError: string | null;
  authSuccess: string | null;
  onLoginSubmit: (e: FormEvent) => void;
  onRegisterSubmit: (e: FormEvent) => void;
}

export default function CitizenAuthView({
  authTab,
  setAuthTab,
  onBackToLanding,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  agreeTerms,
  setAgreeTerms,
  authError,
  authSuccess,
  onLoginSubmit,
  onRegisterSubmit
}: CitizenAuthViewProps) {
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* CARD CONTAINER (White box, rounded borders) */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] border border-slate-150 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* LEFT COLUMN IN SIGN IN / RIGHT COLUMN IN SIGN UP */}
        <div className={`lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between ${authTab === "register" ? "lg:order-2" : "lg:order-1"}`}>
          {/* Back button */}
          <div>
            <button
              onClick={onBackToLanding}
              className="group flex items-center gap-3 text-slate-900 hover:text-blue-600 font-display text-sm font-black tracking-tight"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform text-blue-600" />
              <BrandLogo size="sm" />
            </button>
          </div>

          {/* Form wrapper */}
          <div className="my-auto py-8 max-w-md w-full mx-auto">
            {authTab === "login" ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Sign in</h1>
                  <p className="text-sm font-medium text-slate-400">Welcome back! Sign in to your dashboard.</p>
                </div>

                {/* Messages */}
                {authError && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                    {authSuccess}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={onLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="Your password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        title={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white transition shadow-lg shadow-blue-600/15 hover:bg-blue-700 active:scale-[0.98] mt-2"
                  >
                    Sign in
                  </button>
                </form>

                {/* Toggle link */}
                <p className="text-center text-xs font-bold text-slate-400">
                  Don't have an account?{" "}
                  <button onClick={() => setAuthTab("register")} className="text-blue-600 hover:underline">
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Create an account</h1>
                  <p className="text-sm font-medium text-slate-400">Join the community. Report city issues. Make a difference.</p>
                </div>

                {/* Messages */}
                {authError && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                    {authSuccess}
                  </div>
                )}

                {/* Register Form */}
                <form onSubmit={onRegisterSubmit} className="space-y-4">
                  {/* Name Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        First name
                      </label>
                      <input
                        type="text"
                        required
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        placeholder="First name"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Last name
                      </label>
                      <input
                        type="text"
                        required
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        placeholder="Last name"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Locality */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Address / Locality
                    </label>
                    <input
                      type="text"
                      required
                      value={registerForm.address}
                      onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                      placeholder="Your locality / neighbourhood"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Passwords */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        required
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="Create a strong password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        title={showRegisterPassword ? "Hide password" : "Show password"}
                      >
                        {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        required
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter your password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        title={showRegisterConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showRegisterConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs font-medium text-slate-400 select-none cursor-pointer leading-tight">
                      I agree to all the Terms and Privacy Policy
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white transition shadow-lg shadow-blue-600/15 hover:bg-blue-700 active:scale-[0.98] mt-2"
                  >
                    Create account
                  </button>
                </form>

                {/* Toggle link */}
                <p className="text-center text-xs font-bold text-slate-400">
                  Already have an account?{" "}
                  <button onClick={() => setAuthTab("login")} className="text-blue-600 hover:underline">
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Empty spacer just to balance the column layout */}
          <div className="hidden lg:block h-6"></div>
        </div>

        {/* RIGHT COLUMN (Illustration in Sign In / Left in Sign Up) */}
        <div className={`lg:col-span-6 bg-slate-50 p-8 flex items-center justify-center border-slate-150 ${authTab === "register" ? "lg:order-1 lg:border-r" : "lg:order-2 lg:border-l"}`}>
          {authTab === "login" ? (
            /* Citizen Sign In Illustration */
            <div className="w-full max-w-[380px] aspect-square flex flex-col items-center justify-center text-center space-y-6">
              <svg viewBox="0 0 400 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background circles */}
                <circle cx="200" cy="200" r="160" fill="url(#loginIllustrationGrad)" opacity="0.4" />
                <circle cx="200" cy="200" r="120" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />

                {/* Hand Holding Phone */}
                <g transform="translate(110, 100)">
                  {/* Arm/Hand back shadow */}
                  <path d="M60 220 C80 180, 100 130, 110 100 L160 110 L150 220 Z" fill="#E2E8F0" opacity="0.5" />
                  
                  {/* Phone Shell */}
                  <rect x="30" y="20" width="120" height="230" rx="24" fill="#0F172A" />
                  {/* Phone Screen */}
                  <rect x="36" y="28" width="108" height="214" rx="18" fill="#FFFFFF" />

                  {/* Green Security Shield & Lock */}
                  <g transform="translate(60, 80)">
                    <rect x="0" y="0" width="60" height="70" rx="30" fill="#10B981" opacity="0.1" />
                    <circle cx="30" cy="35" r="24" fill="#10B981" />
                    {/* Locked Padlock */}
                    <path d="M23 32 L23 39 L37 39 L37 32 Z M26 32 C26 28 34 28 34 32" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="30" cy="35" r="2.5" fill="white" />
                  </g>

                  {/* Text lines */}
                  <rect x="55" y="170" width="70" height="6" rx="3" fill="#E2E8F0" />
                  <rect x="65" y="184" width="50" height="4" rx="2" fill="#F1F5F9" />

                  {/* Hand overlapping the phone */}
                  <path d="M10 160 C20 150, 40 165, 45 180 C40 195, 20 190, 10 185" stroke="#FDBA74" strokeWidth="16" strokeLinecap="round" />
                  <path d="M125 150 C140 145, 155 160, 150 175 C140 185, 120 180, 115 170" stroke="#FDBA74" strokeWidth="14" strokeLinecap="round" />
                  {/* Thumb */}
                  <path d="M20 190 C30 200, 45 190, 55 175" stroke="#FDBA74" strokeWidth="14" strokeLinecap="round" />
                </g>

                <defs>
                  <linearGradient id="loginIllustrationGrad" x1="200" y1="40" x2="200" y2="360" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D1FAE5" />
                    <stop offset="1" stopColor="#ECFDF5" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ) : (
            /* Citizen Sign Up Illustration */
            <div className="w-full max-w-[380px] aspect-square flex flex-col items-center justify-center text-center space-y-6">
              <svg viewBox="0 0 400 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background circles */}
                <circle cx="200" cy="200" r="160" fill="url(#registerIllustrationGrad)" opacity="0.4" />
                <circle cx="200" cy="200" r="120" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />

                {/* Hand interacting with phone */}
                <g transform="translate(110, 100)">
                  {/* Phone shell */}
                  <rect x="40" y="20" width="120" height="230" rx="24" fill="#0F172A" />
                  {/* Phone screen */}
                  <rect x="46" y="28" width="108" height="214" rx="18" fill="#FFFFFF" />

                  {/* UI components on screen */}
                  {/* Map grid lines */}
                  <path d="M46 60 L154 60 M46 120 L154 120 M80 28 L80 242 M120 28 L120 242" stroke="#F1F5F9" strokeWidth="1.5" />
                  
                  {/* Profile bubbles on screen */}
                  <circle cx="75" cy="80" r="14" fill="#3B82F6" opacity="0.1" />
                  <circle cx="75" cy="80" r="10" fill="#3B82F6" />
                  <rect x="96" y="74" width="40" height="6" rx="3" fill="#64748B" />
                  <rect x="96" y="84" width="25" height="4" rx="2" fill="#94A3B8" />

                  <circle cx="125" cy="150" r="14" fill="#10B981" opacity="0.1" />
                  <circle cx="125" cy="150" r="10" fill="#10B981" />
                  <rect x="60" y="144" width="45" height="6" rx="3" fill="#64748B" />
                  <rect x="80" y="154" width="25" height="4" rx="2" fill="#94A3B8" />

                  {/* Pin Drop */}
                  <g transform="translate(90, 175)">
                    <circle cx="10" cy="10" r="12" fill="#EFF6FF" />
                    <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3B82F6"/>
                  </g>

                  {/* User hand tapping */}
                  <g transform="translate(80, 160)">
                    {/* Index finger tapping */}
                    <path d="M-40 140 L20 60 C24 55, 34 60, 30 68 L-20 150 Z" fill="#FDBA74" />
                    <circle cx="20" cy="60" r="7" fill="#FDBA74" />
                  </g>
                </g>

                <defs>
                  <linearGradient id="registerIllustrationGrad" x1="200" y1="40" x2="200" y2="360" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#DBEAFE" />
                    <stop offset="1" stopColor="#EFF6FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
