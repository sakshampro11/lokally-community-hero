import React, { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";

interface ResolverAuthViewProps {
  onBackToLanding: () => void;
  loginForm: any;
  setLoginForm: (form: any) => void;
  authError: string | null;
  authSuccess: string | null;
  onLoginSubmit: (e: FormEvent) => void;
  prefillResolver: (email: string, pass: string) => void;
}

export default function ResolverAuthView({
  onBackToLanding,
  loginForm,
  setLoginForm,
  authError,
  authSuccess,
  onLoginSubmit,
  prefillResolver
}: ResolverAuthViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* CARD CONTAINER (Centered box, shadow-2xl, border) */}
      <div className="w-full max-w-md bg-white rounded-[32px] border border-slate-150 shadow-xl p-8 sm:p-10 space-y-6">
        
        {/* Back Link */}
        <div className="flex justify-between items-center">
          <button
            onClick={onBackToLanding}
            className="group flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-display text-sm font-black tracking-tight"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Lokally</span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 self-end mb-1"></span>
          </button>
          
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1 uppercase">
            Resolver Auth
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight">Resolver Portal</h1>
          <p className="text-sm font-medium text-slate-400">Sign in to manage and resolve community issues.</p>
        </div>

        {/* Messages */}
        {authError && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 animate-pulse">
            {authError}
          </div>
        )}
        {authSuccess && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 animate-pulse">
            {authSuccess}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Resolver Email
            </label>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="resolver@lokally.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white transition shadow-lg shadow-blue-600/15 hover:bg-blue-700 active:scale-[0.98] mt-2"
          >
            Sign In as Resolver
          </button>
        </form>

        {/* Fast Quick Access Seed Helper */}
        <div className="pt-2 border-t border-slate-100 text-center space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fast Seed Profiles</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => prefillResolver("resolver@lokally.com", "resolverpassword")}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-100 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition"
            >
              Seed Profile (.com)
            </button>
            <button
              onClick={() => prefillResolver("resolver@lokally.gov", "resolversecure123")}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-100 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition"
            >
              Seed Profile (.gov)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
