import React, { useState } from "react";
import {
  Shield,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  TrendingUp,
  HelpCircle,
  Check,
  Info,
  ArrowRight,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Heart,
  Activity,
  MessageSquare,
  Sparkle,
  Gift,
  Copy,
  Share2,
  X
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (mode: "login" | "register" | "resolver-login") => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [showReferModal, setShowReferModal] = useState(false);
  const [referNameOrEmail, setReferNameOrEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referNameOrEmail.trim()) return;
    const link = `${window.location.origin}/?ref=${encodeURIComponent(referNameOrEmail.trim().toLowerCase())}`;
    setGeneratedLink(link);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 sm:px-12 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <MapPin size={18} className="animate-bounce" />
            </div>
            <span className="font-display text-2xl font-black text-slate-900 tracking-tight">
              Lokally
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
            <button onClick={() => scrollToSection("about")} className="hover:text-blue-600 transition">
              About
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-blue-600 transition">
              How It Works
            </button>
            <button onClick={() => scrollToSection("privacy")} className="hover:text-blue-600 transition">
              Privacy & Trust
            </button>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("login")}
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition px-3 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowReferModal(true)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-[0.98]"
            >
              Join Your Neighbors
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100">
        {/* Soft background glow circles */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-16 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left CTA */}
          <div className="lg:col-span-6 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100/60 px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider text-blue-600 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              CITIZEN-FIRST CIVIC HUB
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-none">
              Empowering <br />
              <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Better Neighborhoods
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base font-medium text-slate-500 leading-relaxed max-w-xl">
              Lokally lets you report local civic issues in seconds, track resolver status in real-time, and collaborate transparently to maintain local community safety.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <button
                onClick={() => onNavigate("register")}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700 hover:shadow-blue-600/25 active:scale-[0.98] transition-all"
              >
                <span>Report an Issue</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => onNavigate("login")}
                className="rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 active:scale-[0.98] transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Micro proof line */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-500">100% Secure Credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-500">Verified City Resolvers</span>
              </div>
            </div>
          </div>

          {/* Right Illustration & Live Preview Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[480px] rounded-[32px] bg-slate-900 p-3 shadow-2xl relative border border-slate-850">
              <div className="absolute -top-4 -right-4 bg-amber-500 text-white rounded-2xl px-3 py-1.5 text-[10px] font-black tracking-wider uppercase shadow-lg flex items-center gap-1">
                <Sparkle size={10} className="animate-spin" />
                <span>AI INTEGRATED</span>
              </div>

              {/* Mockup screen */}
              <div className="bg-slate-50 rounded-[24px] overflow-hidden border border-slate-100 p-5 space-y-4">
                {/* Header of mockup */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">lokally.org/feed</span>
                </div>

                {/* Simulated Feed card */}
                <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                        AC
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-900">Alex Citizen</h4>
                        <span className="text-[9px] text-slate-400">22 hours ago</span>
                      </div>
                    </div>
                    <span className="bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 text-[8px] font-extrabold text-amber-600 uppercase">
                      In Progress
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Broken Streetlight</h5>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Flickering and dark streetlight near Sector 4 block entrance.
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">Upvotes (12)</span>
                      <span className="font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">Comments (3)</span>
                    </div>
                    <span className="text-blue-600 font-bold">View details →</span>
                  </div>
                </div>

                {/* Secondary resolution card mockup */}
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex gap-2.5 items-center">
                    <div className="h-7 w-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900">Resolution Status Verified</h4>
                      <p className="text-[9px] text-slate-500">Verified by Municipal Officer</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-600 bg-white/80 border border-emerald-200 rounded-lg px-2 py-1 font-bold">
                    Fixed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-slate-900 py-10 text-white relative">
        <div className="absolute inset-0 bg-linear-to-r from-blue-900/10 to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">REPORTED ISSUES</span>
              <p className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">1,420+</p>
              <span className="text-xs text-slate-400 block">Logged securely by citizens</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">RESOLUTION RATE</span>
              <p className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">94.8%</p>
              <span className="text-xs text-slate-400 block">Addressed by active resolvers</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">AVERAGE FILL-TIME</span>
              <p className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">12 sec</p>
              <span className="text-xs text-slate-400 block">Accelerated by AI suggestions</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block">TOTAL DISTRICTS</span>
              <p className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">32+</p>
              <span className="text-xs text-slate-400 block">Interconnected city sectors</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT LOKALLY & BENTO GRID FEATURES */}
      <section id="about" className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          {/* Section Heading */}
          <div className="max-w-2xl mx-auto text-center mb-20 space-y-3">
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
              <Activity size={12} />
              <span>THE COOPERATIVE MISSION</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              A Platform Built For Citizens, Owned By The Community
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
              We bridge the communication barrier between residents and civic authorities. Experience complete transparency, fast logging, and absolute accountability.
            </p>
          </div>

          {/* Bento-style Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Grid Box 1 - 7 cols */}
            <div className="md:col-span-7 bg-slate-50 border border-slate-150 p-8 rounded-3xl flex flex-col justify-between hover:border-slate-300 transition duration-300 group">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-blue-600">
                  <Volume2 size={20} />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">Instant Citizen Voice</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-lg">
                  Submit reports in seconds. Give exact coordinates on the map, provide descriptions, and attach images or videos as concrete evidence. Other neighbors can immediately view and upvote your report to gain visibility.
                </p>
              </div>
              <div className="pt-6 text-xs font-bold text-blue-600 flex items-center gap-1 cursor-pointer group-hover:text-blue-700 transition">
                <span>Explore the Community Feed</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Grid Box 2 - 5 cols */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-150 p-8 rounded-3xl flex flex-col justify-between hover:border-slate-300 transition duration-300 group">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center text-amber-600">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">AI Diagnostic Autofill</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Struggling to write or select options? Our integrated Gemini AI diagnostic helper analyzes your media and description to suggest categories, priority tiers, and write a summary automatically to streamline report queues.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-amber-600 tracking-wider uppercase">Powered by Gemini SDK</span>
            </div>

            {/* Grid Box 3 - 5 cols */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-150 p-8 rounded-3xl flex flex-col justify-between hover:border-slate-300 transition duration-300 group">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100/60 flex items-center justify-center text-purple-600">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">Verified Action Timeline</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Real-time progression tracking. Monitor your report status history as it updates from "Reported" to "Verified", "In Progress", and ultimately "Resolved". Resolvers attach visual proof and notes on resolution.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-purple-600 tracking-wider uppercase">Municipal-Linked Actions</span>
            </div>

            {/* Grid Box 4 - 7 cols */}
            <div className="md:col-span-7 bg-slate-50 border border-slate-150 p-8 rounded-3xl flex flex-col justify-between hover:border-slate-300 transition duration-300 group">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600">
                  <Users size={20} />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">Collaborative Local Discussion</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-lg">
                  Every issue report houses its own secure thread where residents, municipal resolvers, and community leaders can discuss concerns, plan actions, suggest detours, or update each other until the issue is solved.
                </p>
              </div>
              <div className="pt-6 text-xs font-bold text-emerald-600 flex items-center gap-1 cursor-pointer group-hover:text-emerald-700 transition">
                <span>Start contributing with your neighbors</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          {/* Section Heading */}
          <div className="max-w-2xl mx-auto text-center mb-20 space-y-3">
            <span className="text-[10px] font-extrabold tracking-widest text-blue-600 uppercase">STEP-BY-STEP OPERATION</span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-none">
              How Lokally Works
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
              Our flow guarantees transparency. We make sure every valid report gets processed without red tape.
            </p>
          </div>

          {/* 3 Step Card Process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 relative shadow-xs hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="h-10 w-10 rounded-full bg-blue-600 text-white font-display font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/20 mb-6">
                  01
                </span>
                <h3 className="font-display text-lg font-black text-slate-900 mb-3">Create & Authenticate</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Join our secure environment as a citizen. Your profile stores all reported items, custom upvotes, verified progress, and activity stats in one consolidated space.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Identity protected</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 relative shadow-xs hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="h-10 w-10 rounded-full bg-blue-600 text-white font-display font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/20 mb-6">
                  02
                </span>
                <h3 className="font-display text-lg font-black text-slate-900 mb-3">File a Smart Report</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Provide description context, location on our map system, and attach evidence media. Use our automated Gemini AI diagnostics to classify and prioritize details with high speed.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>AI category-autofilled</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 relative shadow-xs hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="h-10 w-10 rounded-full bg-blue-600 text-white font-display font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/20 mb-6">
                  03
                </span>
                <h3 className="font-display text-lg font-black text-slate-900 mb-3">Track Real-Time Actions</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Discuss steps in active threads, upvote existing issues to express priority, and watch verification timelines until verified municipal officers publish visual proof of completion.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Full resolution proof</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY POLICY & TRUST SECURITY */}
      <section id="privacy" className="py-20 max-w-7xl mx-auto px-6 sm:px-12">
        <div className="bg-slate-900 rounded-[40px] p-8 sm:p-14 text-white grid grid-cols-1 lg:grid-cols-12 gap-12 items-center shadow-2xl relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10">
              <Shield size={22} />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">GUARANTEED COMPLIANCE</span>
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Your Trust is Our Core Commitment
              </h2>
            </div>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              We gather only necessary information to operate, authenticate, and process local reports. Your credentials and security are absolute.
            </p>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Policy item 1 */}
            <div className="bg-white/5 border border-white/10/50 hover:bg-white/10 rounded-2xl p-5 flex gap-4 items-start transition duration-200">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-white text-xs uppercase tracking-wide">Minimal Data Footprint</h4>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  We collect your profile registration details strictly for secure verification, dashboard state retention, and municipal activity metrics.
                </p>
              </div>
            </div>

            {/* Policy item 2 */}
            <div className="bg-white/5 border border-white/10/50 hover:bg-white/10 rounded-2xl p-5 flex gap-4 items-start transition duration-200">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-white text-xs uppercase tracking-wide">Strict Zero-Selling Guarantee</h4>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  We strictly never rent, trade, or sell any user details, phone numbers, email logs, or locations with marketing entities or external platforms.
                </p>
              </div>
            </div>

            {/* Policy item 3 */}
            <div className="bg-white/5 border border-white/10/50 hover:bg-white/10 rounded-2xl p-5 flex gap-4 items-start transition duration-200">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-white text-xs uppercase tracking-wide">Secure Shield Transparency</h4>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  Report summaries, maps, and comments are visible to build cooperative community context, but your phone numbers, emails, and address lines remain encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-150 py-16 mt-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <MapPin size={15} />
            </div>
            <span className="font-display text-xl font-black text-slate-900 tracking-tight">
              Lokally
            </span>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            <button onClick={() => scrollToSection("about")} className="hover:text-blue-600 transition">
              About
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-blue-600 transition">
              How It Works
            </button>
            <button onClick={() => scrollToSection("privacy")} className="hover:text-blue-600 transition">
              Privacy
            </button>
            <button
              onClick={() => onNavigate("resolver-login")}
              className="hover:text-blue-600 transition text-slate-600 border border-slate-200 px-4 py-2 rounded-xl bg-slate-50 hover:border-blue-200 normal-case"
            >
              Municipal Resolver Login
            </button>
          </div>

          {/* Copyright */}
          <span className="text-xs font-bold text-slate-400">
            &copy; 2026 Lokally. All rights reserved.
          </span>
        </div>
      </footer>

      {/* REFERRAL / JOIN MODAL */}
      {showReferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-slate-100 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowReferModal(false);
                setReferNameOrEmail("");
                setGeneratedLink("");
              }}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="mb-6 space-y-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Gift size={20} className="animate-bounce" />
              </div>
              <h3 className="font-display text-2xl font-black text-slate-900 tracking-tight">
                Join the Neighborhood! 🎁
              </h3>
              <p className="text-xs font-medium text-slate-400">
                Lokally connects neighbors, tracks municipal resolutions, and rewards active civic engagement.
              </p>
            </div>

            {/* Action Columns */}
            <div className="space-y-6">
              {/* Option 1: Register */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/20 p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                      Option 1: Sign Up & Claim +5 XP
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                      Create your free account today. If you were invited by a neighbor, you will start with <span className="font-bold text-blue-600">5 XP</span>!
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black text-blue-700 uppercase tracking-wide">
                    +5 XP
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowReferModal(false);
                    onNavigate("register");
                  }}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                >
                  Register Account Now
                </button>
              </div>

              {/* Option 2: Refer */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <span>Option 2: Refer & Earn +10 XP</span>
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                    Generate a shareable referral link! Send it to your neighbors — when they join, they get 5 XP and you get <span className="font-bold text-blue-600">10 XP</span>.
                  </p>
                </div>

                <form onSubmit={handleGenerateLink} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter your name or email"
                    value={referNameOrEmail}
                    onChange={(e) => setReferNameOrEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-300 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    Generate
                  </button>
                </form>

                {generatedLink && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                      <Check size={10} strokeWidth={3} /> Link Generated Successfully!
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 focus:outline-hidden"
                      />
                      <button
                        onClick={handleCopy}
                        className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition ${
                          copied ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
