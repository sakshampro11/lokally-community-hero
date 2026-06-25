import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo } from "./BrandLogo";
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
  X,
  Camera,
  ThumbsUp,
  Map as MapIcon,
  ChevronRight
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (mode: "login" | "register" | "resolver-login") => void;
}

const resolutionSteps = [
  {
    id: 1,
    stepTitle: "1. Snap & Identify",
    badge: "Reported",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
    description: "Snap a live geo-tagged photo. AI detects details and pre-fills category, priority, and title instantly.",
    issueTitle: "Hazardous Pothole",
    issueDesc: "Deep pothole on Main St. endangering bikers.",
    statusText: "Initializing Secure Report...",
    bgColor: "from-blue-500/10 to-indigo-500/10"
  },
  {
    id: 2,
    stepTitle: "2. Upvotes & Trust",
    badge: "Verified",
    badgeColor: "bg-violet-50 text-violet-600 border-violet-100",
    description: "Neighbors upvote to confirm and escalate priority. Safe citizen reports gain fast community momentum.",
    issueTitle: "Hazardous Pothole",
    issueDesc: "Deep pothole on Main St. endangering bikers.",
    statusText: "Verified by 24 neighbors",
    bgColor: "from-violet-500/10 to-purple-500/10"
  },
  {
    id: 3,
    stepTitle: "3. Resolver Claim",
    badge: "In Progress",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
    description: "Official district resolvers receive the verified alert and schedule dispatch immediately.",
    issueTitle: "Hazardous Pothole",
    issueDesc: "Deep pothole on Main St. endangering bikers.",
    statusText: "Assigned: Public Works Team B",
    bgColor: "from-amber-500/10 to-orange-500/10"
  },
  {
    id: 4,
    stepTitle: "4. Live Action",
    badge: "In Progress",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
    description: "Resolvers share live progress notes and photos on-site. The neighborhood stays fully informed.",
    issueTitle: "Hazardous Pothole",
    issueDesc: "Repair crew is laying hot-mix asphalt and compacting.",
    statusText: "Status: Laying Asphalt (80% Done)",
    bgColor: "from-yellow-500/10 to-amber-500/10"
  },
  {
    id: 5,
    stepTitle: "5. Solved & Rewarded",
    badge: "Resolved",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    description: "The issue is resolved and marked clean! Citizen earns +50 impact points and civic reputation.",
    issueTitle: "Hazardous Pothole",
    issueDesc: "Pothole completely filled and leveled with road surface.",
    statusText: "Issue Solved! +50 Civic Points",
    bgColor: "from-emerald-500/10 to-teal-500/10"
  }
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [showReferModal, setShowReferModal] = useState(false);
  const [referNameOrEmail, setReferNameOrEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Animated resolution steps
  const [activeStep, setActiveStep] = useState(0);
  const [stepAutoplay, setStepAutoplay] = useState(true);

  // Auto-cycle steps (every 5 seconds)
  useEffect(() => {
    if (!stepAutoplay) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % resolutionSteps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [stepAutoplay]);

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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 sm:px-12 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className="flex items-center gap-2 cursor-pointer select-none group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <BrandLogo size="md" />
            </div>
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
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigate("login")}
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition px-2 py-1.5 sm:px-3 sm:py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowReferModal(true)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 px-3 py-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs font-bold text-white shadow-md transition-all active:scale-[0.98]"
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
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            {/* The smartphone container */}
            <div className="w-full max-w-[440px] rounded-[38px] bg-slate-950 p-3.5 shadow-2xl relative border border-slate-800">
              {/* Dynamic status pill */}
              <div className="absolute -top-3.5 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl px-3 py-1.5 text-[9px] font-black tracking-wider uppercase shadow-lg flex items-center gap-1.5 z-10">
                <Sparkle size={11} className="animate-spin text-amber-300" />
                <span>AI POWERED CIVIC FLOW</span>
              </div>

              {/* Mockup screen */}
              <div className="bg-slate-50 rounded-[28px] overflow-hidden border border-slate-100 p-4 min-h-[390px] flex flex-col justify-between relative">
                {/* Header of mockup */}
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/50">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400"></span>
                    <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400">lokally.org/simulated-flow</span>
                  <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded-md">LIVE</span>
                </div>

                {/* ANIMATED TRANSITION AREA */}
                <div className="my-3 flex-1 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {activeStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-3"
                      >
                        {/* Live Camera View Finder */}
                        <div className="relative rounded-2xl overflow-hidden border border-slate-300 h-36 bg-slate-900 flex items-center justify-center">
                          {/* Simulated pothole photo */}
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-70" />
                          
                          {/* Scan-line animation */}
                          <div className="absolute inset-x-0 h-0.5 bg-blue-500 top-0 animate-bounce" style={{ animationDuration: '3s' }} />
                          
                          {/* Camera grid overlay */}
                          <div className="absolute inset-0 border border-white/10 grid grid-cols-3 grid-rows-3 pointer-events-none" />
                          
                          {/* Live Geo Tag indicator */}
                          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs px-2 py-1 rounded-lg text-[9px] font-bold text-white flex items-center gap-1">
                            <MapPin size={9} className="text-red-500 animate-pulse" />
                            <span>GPS: Lat 28.61, Lng 77.20</span>
                          </div>

                          <div className="absolute top-2 right-2 bg-blue-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            Viewfinder
                          </div>
                        </div>

                        {/* AI Detection HUD */}
                        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles size={12} className="text-violet-600 animate-pulse" />
                            <span className="text-[10px] font-extrabold text-violet-700 uppercase tracking-wider">AI Auto-Detection Complete</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                            <div className="bg-slate-50 p-1 rounded border border-slate-100">
                              <span className="text-slate-400 block font-bold">CATEGORY</span>
                              <span className="text-slate-800 font-extrabold">Road Condition</span>
                            </div>
                            <div className="bg-slate-50 p-1 rounded border border-slate-100">
                              <span className="text-slate-400 block font-bold">SEVERITY</span>
                              <span className="text-rose-600 font-extrabold">High Priority</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-3"
                      >
                        {/* Feed card mockup with dynamic upvoting */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700">
                                AC
                              </div>
                              <div>
                                <h4 className="text-[10px] font-extrabold text-slate-950">Alex Citizen</h4>
                                <span className="text-[8px] font-bold text-slate-400">Verified Citizen</span>
                              </div>
                            </div>
                            <span className="bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 text-[8px] font-extrabold text-blue-600 uppercase">
                              Reported
                            </span>
                          </div>

                          <div>
                            <h5 className="text-[11px] font-extrabold text-slate-900 flex items-center gap-1">
                              <span>Hazardous Pothole</span>
                              <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1 py-0.2 rounded">Severe</span>
                            </h5>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-normal font-medium">
                              Deep pavement depression on Main Street blocking left lane.
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex gap-2">
                              {/* Pulsing Upvote bubble */}
                              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg text-[9px] font-black animate-bounce">
                                <ThumbsUp size={10} />
                                <span>Upvotes (24)</span>
                              </div>
                              <div className="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-1 rounded-lg text-[9px] font-bold">
                                Comments (4)
                              </div>
                            </div>
                            <span className="text-[9px] font-extrabold text-indigo-600">Trust Index: 100%</span>
                          </div>
                        </div>

                        {/* Neighbor Comment bubble */}
                        <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5 flex gap-2">
                          <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-700 shrink-0">
                            R
                          </div>
                          <p className="text-[9px] text-slate-600 font-medium leading-normal">
                            <span className="font-bold block text-slate-800">Rita (Neighbor):</span>
                            My car took heavy impact here yesterday. Highly dangerous!
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-3"
                      >
                        {/* Dispatch Tracker Map */}
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-32 bg-slate-100 flex items-center justify-center">
                          {/* Simulated mini map */}
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-40 filter grayscale" />
                          
                          {/* Simulated pin */}
                          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 text-blue-600 flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white border-2 border-white shadow-md animate-pulse">
                              <MapIcon size={12} />
                            </div>
                            <span className="text-[8px] font-bold bg-slate-900 text-white px-1 py-0.2 rounded mt-1">Crew #4</span>
                          </div>

                          <div className="absolute top-1/3 right-1/3 text-rose-600 flex flex-col items-center">
                            <MapPin size={16} className="animate-bounce" />
                            <span className="text-[8px] font-bold bg-rose-600 text-white px-1 py-0.2 rounded mt-0.5">Pothole</span>
                          </div>

                          {/* Trail connecting pin */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <path d="M 140 80 Q 180 40 230 60" fill="transparent" stroke="#2563eb" strokeWidth="2" strokeDasharray="4,4" className="animate-[dash_2s_linear_infinite]" />
                          </svg>
                        </div>

                        {/* Dispatch ticket notification */}
                        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock size={16} className="animate-spin" style={{ animationDuration: '4s' }} />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">RESOLVER ASSIGNED</h4>
                            <p className="text-[9px] text-slate-600 font-bold mt-0.5 leading-normal">
                              Municipal Works Team B marked ticket as "Scheduled". Dispatch crew en-route.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-3"
                      >
                        {/* Live Crew progress card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 text-[10px] font-extrabold">
                              👷‍♂️
                            </div>
                            <div>
                              <h4 className="text-[10px] font-extrabold text-slate-900">Dave (Municipal Lead)</h4>
                              <span className="text-[8px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase">On-Site Work Active</span>
                            </div>
                          </div>

                          {/* Active Asphalt Repair Photo */}
                          <div className="relative rounded-xl overflow-hidden h-24 border border-slate-200">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center" />
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                              <span className="text-white text-[10px] font-extrabold bg-slate-900/80 px-2 py-1 rounded-lg flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                Live Resolution Update
                              </span>
                            </div>
                          </div>

                          {/* Repair progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                              <span>Asphalt Laying & Levelling</span>
                              <span className="text-blue-600 font-extrabold">80% Done</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div className="h-full bg-blue-600 rounded-full animate-[pulse_1.5s_infinite]" style={{ width: '80%' }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-3"
                      >
                        {/* Solved Celebration card */}
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-center space-y-3 relative overflow-hidden">
                          {/* Absolute micro sparkling star elements */}
                          <div className="absolute top-2 left-4 text-amber-500 text-xs animate-bounce">⭐</div>
                          <div className="absolute bottom-4 right-4 text-amber-500 text-xs animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</div>

                          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <CheckCircle2 size={24} className="scale-110" />
                          </div>

                          <div>
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider">
                              Verified Resolved
                            </span>
                            <h4 className="text-xs font-black text-slate-900 mt-1.5">Road Leveled & Polished</h4>
                            <p className="text-[9px] text-slate-500 font-medium leading-relaxed max-w-xs mx-auto mt-1">
                              Alexander's report is officially solved. Pothole filled and sealed.
                            </p>
                          </div>

                          {/* Reward points badge */}
                          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl px-3 py-1.5 shadow-sm">
                            <Trophy size={11} className="text-white shrink-0" />
                            <span className="text-[10px] font-black tracking-tight leading-none">+50 Civic XP Added</span>
                          </div>
                        </div>

                        {/* Neighbor notification summary */}
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                          <span className="text-[9px] text-slate-400 font-bold">Reputation level</span>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">"Local Guardian" Badge</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* STEP CONTROLS (TABS) */}
                <div className="border-t border-slate-200/60 pt-2.5">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mb-2">
                    <span>Complaint Lifecycle Simulator</span>
                    <button
                      onClick={() => setStepAutoplay(!stepAutoplay)}
                      className={`px-2 py-0.5 rounded-md hover:bg-slate-200/50 transition font-black text-[8px] ${
                        stepAutoplay ? "text-blue-600 bg-blue-50" : "text-slate-500 bg-slate-200"
                      }`}
                    >
                      {stepAutoplay ? "⏸ Pause Cycle" : "▶ Resume Cycle"}
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-1">
                    {resolutionSteps.map((step, idx) => {
                      const isActive = activeStep === idx;
                      return (
                        <button
                          key={step.id}
                          onClick={() => {
                            setStepAutoplay(false);
                            setActiveStep(idx);
                          }}
                          className={`text-[8px] py-1.5 rounded-lg border font-extrabold transition-all truncate flex flex-col items-center justify-center ${
                            isActive
                              ? "bg-slate-900 border-slate-950 text-white shadow-xs scale-[1.03]"
                              : "bg-white hover:bg-slate-100 border-slate-200 text-slate-500"
                          }`}
                        >
                          <span className="block">{idx + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated legend / instruction card under the phone */}
            <div className="mt-4 max-w-[380px] text-center">
              <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                <span className="text-slate-800 font-extrabold">Interactive Sandbox:</span> {resolutionSteps[activeStep].description}
              </p>
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
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <BrandLogo size="md" />
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
