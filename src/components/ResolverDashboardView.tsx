import React, { useState, FormEvent, useEffect } from "react";
import {
  LogOut,
  MapPin,
  Trophy,
  CheckCircle,
  Clock,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  Award,
  BookOpen,
  TrendingUp,
  X,
  Plus,
  Upload,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Issue } from "../types";
import LeaderboardView from "./LeaderboardView";

interface ResolverDashboardViewProps {
  user: User;
  issues: Issue[];
  onLogout: () => void;
  onPostComment: (issueId: string, text: string) => Promise<Issue | null>;
  onStatusUpdate: (
    issueId: string,
    status: string,
    note: string,
    proofFiles: FileList | File[] | null
  ) => Promise<Issue | null>;
  onEditProfile?: () => void;
}

export default function ResolverDashboardView({
  user,
  issues,
  onLogout,
  onPostComment,
  onStatusUpdate,
  onEditProfile
}: ResolverDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "leaderboard">("dashboard");
  const [resolverFeedTab, setResolverFeedTab] = useState<"open" | "resolved">("open");
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);
  const [showMobileProfileDrawer, setShowMobileProfileDrawer] = useState<boolean>(false);

  // Reset showMoreDetails when active issue changes
  useEffect(() => {
    setShowMoreDetails(false);
  }, [activeIssue?.id]);

  // Status transition states
  const [resolverStatus, setResolverStatus] = useState<string>("In Progress");
  const [resolverNote, setResolverNote] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Comment states
  const [commentText, setCommentText] = useState<string>("");

  // Filtered issues based on open / resolved toggle
  const filteredIssues = issues.filter((iss) => {
    if (resolverFeedTab === "open") {
      return iss.status !== "Resolved";
    } else {
      return iss.status === "Resolved";
    }
  });

  // Automatically select the first issue as active when feed tab or issues change
  useEffect(() => {
    if (filteredIssues.length > 0) {
      // Keep the current active issue if it is still in the list, otherwise select first
      const exists = filteredIssues.find((i) => i.id === activeIssue?.id);
      if (!exists) {
        setActiveIssue(filteredIssues[0]);
      } else {
        // Sync active issue from the updated issues list
        const updated = filteredIssues.find((i) => i.id === activeIssue?.id);
        if (updated) {
          setActiveIssue(updated);
        }
      }
    } else {
      setActiveIssue(null);
    }
  }, [resolverFeedTab, issues]);

  const handleCommentSubmitLocal = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeIssue || !commentText.trim()) return;
    const updated = await onPostComment(activeIssue.id, commentText.trim());
    if (updated) {
      setActiveIssue(updated);
      setCommentText("");
    }
  };

  const handleStatusUpdateLocal = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeIssue) return;
    const updated = await onStatusUpdate(
      activeIssue.id,
      resolverStatus,
      resolverNote,
      selectedFiles
    );
    if (updated) {
      setActiveIssue(updated);
      setResolverNote("");
      setSelectedFiles([]);
    }
  };

  const totalResolvedCount = issues.filter((i) => i.status === "Resolved").length;

  const renderRightPanel = (isMobileDrawer = false) => {
    const handleEditProfileClick = () => {
      if (isMobileDrawer) {
        setShowMobileProfileDrawer(false);
      }
      onEditProfile?.();
    };

    const handleLogoutClick = () => {
      if (isMobileDrawer) {
        setShowMobileProfileDrawer(false);
      }
      onLogout();
    };

    return (
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-150 rounded-[28px] overflow-hidden shadow-sm">
          {/* Dark Navy Header Band */}
          <div className="h-24 bg-slate-900 relative">
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-white/10 tracking-widest">
              Verified
            </div>
          </div>

          {/* Profile Avatar overlapping */}
          <div className="px-6 pb-6 relative flex flex-col items-center text-center">
            <div
              onClick={handleEditProfileClick}
              className="h-20 w-20 rounded-full bg-white p-1 shadow-md -mt-10 flex items-center justify-center cursor-pointer hover:scale-105 transition overflow-hidden bg-slate-50 border border-slate-200"
              title="Click to Edit Profile"
            >
              {user.photoUrl ? (
                <img src={user.photoUrl} className="h-full w-full object-cover rounded-full" alt={user.name} referrerPolicy="no-referrer" />
              ) : (
                <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-display font-black text-2xl border border-slate-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
              )}
            </div>

            {/* Details */}
            <h3
              onClick={handleEditProfileClick}
              className="font-display text-xl font-extrabold text-slate-900 tracking-tight mt-3 cursor-pointer hover:text-blue-600 transition"
              title="Click to Edit Profile"
            >
              {user.name}
            </h3>
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mt-1.5">
              ✓ Verified Resolver
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-2">
              {user.email}
            </p>

            {/* Edit Profile and Logout action links */}
            <div className="flex items-center gap-2.5 mt-4">
              <button
                onClick={handleEditProfileClick}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Edit Profile
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleLogoutClick}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Logout
              </button>
            </div>

            <div className="w-full border-t border-slate-100 my-5"></div>

            {/* Stats Row */}
            <div className="w-full grid grid-cols-2 gap-4 text-center">
              <div className="space-y-0.5 border-r border-slate-100">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Resolved</span>
                <span className="block text-2xl font-display font-black text-slate-900">{totalResolvedCount}</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Level Status</span>
                <span className="block text-sm font-bold text-slate-700 mt-1">Lead Resolver</span>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 my-5"></div>

            {/* Operational Badges */}
            <div className="w-full text-left space-y-2">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Operational Badges</span>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide">
                  <Award size={10} /> Fast Responder
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide">
                  <Award size={10} /> Seed Officer
                </span>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 my-5"></div>

            {/* Quick Action links */}
            <div className="w-full text-left space-y-2.5">
              <button
                onClick={() => {
                  if (isMobileDrawer) setShowMobileProfileDrawer(false);
                  setActiveTab("leaderboard");
                }}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-slate-50 p-2.5 rounded-xl transition cursor-pointer text-left"
              >
                <span>Resolver Leaderboard</span>
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => {
                  if (isMobileDrawer) setShowMobileProfileDrawer(false);
                  setResolverFeedTab("resolved");
                }}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-slate-50 p-2.5 rounded-xl transition cursor-pointer text-left"
              >
                <span>Resolved Concerns Log</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 sm:px-12 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Logo and Portal Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="font-display text-2xl font-black text-slate-900 tracking-tight">Lokally</span>
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 mb-1.5 self-end"></span>
            </div>
            <div className="h-6 border-r border-slate-200"></div>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-blue-100">
              Resolver Portal
            </span>
          </div>

          {/* Center: Tabs */}
          <nav className="hidden sm:flex items-center gap-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`text-sm font-bold tracking-wide transition pb-1 border-b-2 cursor-pointer ${
                activeTab === "dashboard"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`text-sm font-bold tracking-wide transition pb-1 border-b-2 cursor-pointer ${
                activeTab === "leaderboard"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Leaderboard
            </button>
          </nav>

          {/* Right: Resolver Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-sm font-bold text-slate-800">{user.name}</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                {user.email}
              </span>
            </div>
            
            <button
              onClick={() => setShowMobileProfileDrawer(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-display text-sm font-bold text-blue-600 border border-blue-100 shadow-sm select-none overflow-hidden cursor-pointer hover:scale-[1.02] hover:bg-blue-100/60 transition"
              title="Profile Overview"
              type="button"
            >
              {user.photoUrl ? (
                <img src={user.photoUrl} className="h-full w-full object-cover" alt={user.name} referrerPolicy="no-referrer" />
              ) : (
                user.name ? user.name.charAt(0).toUpperCase() : "S"
              )}
            </button>

            <button
              onClick={onLogout}
              title="Logout"
              className="hidden sm:block rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-red-500 cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE SUB-NAVBAR (sm:hidden) */}
      <div className="flex border-b border-slate-150 bg-white p-2 sm:hidden overflow-x-auto gap-1 sticky top-[72px] z-30 shadow-xs">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 text-center py-2 text-xs font-bold transition rounded-xl cursor-pointer ${
            activeTab === "dashboard"
              ? "text-blue-600 bg-blue-50/80"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 text-center py-2 text-xs font-bold transition rounded-xl cursor-pointer ${
            activeTab === "leaderboard"
              ? "text-blue-600 bg-blue-50/80"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-10 sm:px-12">
        {activeTab === "leaderboard" ? (
          /* Render Leaderboard Tab */
          <LeaderboardView currentUserRole={user.role} />
        ) : (
          /* Render Dashboard Split Screen (Matches Image 8 exactly) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Open Concerns and Active Issue details (Col-span 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* TOP CARD: "Open Concerns" (Compact layout) */}
              <div className="bg-white border border-slate-150/80 rounded-[28px] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight">Open Concerns</h2>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                      Review reported problems and log status history updates.
                    </p>
                  </div>

                  <div className="flex sm:items-center gap-6 shrink-0 flex-wrap sm:flex-nowrap">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                        Active Issues
                      </span>
                      <span className="text-3xl font-extrabold text-blue-600 mt-1 leading-none">
                        {issues.filter((i) => i.status !== "Resolved").length}
                      </span>
                    </div>

                    {/* Selector Toggle (Open Issues / Resolved) */}
                    <div className="flex gap-1 p-1 bg-slate-100/70 border border-slate-200/40 rounded-xl w-fit">
                      <button
                        onClick={() => setResolverFeedTab("open")}
                        className={`rounded-lg py-1.5 px-4 text-xs font-bold transition-all ${
                          resolverFeedTab === "open"
                            ? "bg-white text-blue-600 shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Open Issues
                      </button>
                      <button
                        onClick={() => setResolverFeedTab("resolved")}
                        className={`rounded-lg py-1.5 px-4 text-xs font-bold transition-all ${
                          resolverFeedTab === "resolved"
                            ? "bg-white text-blue-600 shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Resolved
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Scrolling Issue List */}
                {filteredIssues.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 mt-5 pt-5 border-t border-slate-100">
                    {filteredIssues.map((iss) => {
                      const isActive = activeIssue?.id === iss.id;
                      return (
                        <button
                          key={iss.id}
                          onClick={() => setActiveIssue(iss)}
                          className={`shrink-0 text-left w-64 rounded-2xl p-4 border transition-all cursor-pointer ${
                            isActive
                              ? "bg-blue-50/60 border-blue-300 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="rounded-md bg-slate-50 border border-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[100px]">
                              {iss.issueType}
                            </span>
                            <span className={`rounded-md px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${
                              iss.status === "Resolved"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}>
                              {iss.status}
                            </span>
                          </div>
                          <h4 className="font-display font-extrabold text-xs text-slate-900 truncate">
                            {iss.title}
                          </h4>
                          <p className="text-[10px] font-semibold text-slate-400 truncate mt-1">
                            {iss.address || "No address provided"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-400 italic mt-5 pt-5 border-t border-slate-100">
                    No concerns found in this tab.
                  </p>
                )}

              </div>

              {/* BOTTOM CARD: ACTIVE DETAILED SELECTED ISSUE */}
              {activeIssue ? (
                <div className="bg-white border border-slate-150/80 rounded-[28px] p-6 shadow-sm">
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: ISSUE DETAILS (dynamic width) */}
                    <div className={`${(activeIssue.status === "Resolved" && !showMoreDetails) ? "md:col-span-12" : "md:col-span-7"} space-y-4`}>
                      
                      {/* Badges and Date */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-600 tracking-wide uppercase">
                            {activeIssue.issueType}
                          </span>
                          <span className="rounded-md bg-slate-50 border border-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 tracking-wide uppercase">
                            {activeIssue.priority} Priority
                          </span>
                          <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${
                            activeIssue.status === "Resolved"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                              : activeIssue.status === "In Progress"
                              ? "bg-sky-50 border-sky-100 text-sky-600"
                              : "bg-amber-50 border-amber-100 text-amber-600"
                          }`}>
                            {activeIssue.status === "Reported" ? "PENDING" : activeIssue.status === "In Progress" ? "IN PROGRESS" : activeIssue.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 shrink-0">
                          {(() => {
                            const d = new Date(activeIssue.createdAt);
                            const day = d.getDate();
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            const month = months[d.getMonth()];
                            const hours = String(d.getHours()).padStart(2, "0");
                            const minutes = String(d.getMinutes()).padStart(2, "0");
                            return `${day} ${month}, ${hours}:${minutes}`;
                          })()}
                        </span>
                      </div>

                      {/* Title & Location details */}
                      <div className="space-y-1">
                        <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                          {activeIssue.title}
                        </h3>
                        {activeIssue.address && (
                          <p className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <span className="text-rose-500">📍</span> Address: <span className="text-slate-600 font-bold">{activeIssue.address}</span>
                          </p>
                        )}
                      </div>

                      {/* Description (Plain paragraph below, no gray box) */}
                      <div className="pt-1">
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                          {activeIssue.description}
                        </p>
                      </div>

                      {/* Media attached */}
                      {activeIssue.mediaUrls && activeIssue.mediaUrls.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-50">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Evidence Media</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {activeIssue.mediaUrls.map((url, i) => {
                              const isVid = /\.(mp4|mov|webm|avi)$/i.test(url);
                              return (
                                <div key={i} className="overflow-hidden rounded-xl border border-slate-150 shadow-xs bg-slate-50">
                                  {isVid ? (
                                    <video src={url} controls className="w-full object-cover max-h-40" />
                                  ) : (
                                    <img
                                      src={url}
                                      alt="Evidence"
                                      className="w-full object-cover max-h-40"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=600&auto=format&fit=crop";
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Status Timeline History Log */}
                      {activeIssue.statusHistory && activeIssue.statusHistory.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-slate-100">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status History Log</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {activeIssue.statusHistory.map((history, idx) => (
                              <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className={`font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                                    history.status === "Resolved"
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                      : history.status === "In Progress"
                                      ? "bg-sky-50 text-sky-600 border border-sky-100"
                                      : "bg-amber-50 text-amber-600 border border-amber-100"
                                  }`}>
                                    {history.status === "Reported" ? "PENDING" : history.status === "In Progress" ? "IN PROGRESS" : history.status.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    {(() => {
                                      const d = new Date(history.timestamp);
                                      const day = d.getDate();
                                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                      const month = months[d.getMonth()];
                                      const hours = String(d.getHours()).padStart(2, "0");
                                      const minutes = String(d.getMinutes()).padStart(2, "0");
                                      return `${day} ${month}, ${hours}:${minutes}`;
                                    })()}
                                  </span>
                                </div>
                                <p className="font-semibold text-slate-600 leading-relaxed">{history.note}</p>
                                {history.mediaUrls && history.mediaUrls.length > 0 && (
                                  <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                                    {history.mediaUrls.map((mUrl, mIdx) => (
                                      <a key={mIdx} href={mUrl} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-slate-150 hover:opacity-90 transition">
                                        {/\.(mp4|mov|webm|avi)$/i.test(mUrl) ? (
                                          <video src={mUrl} className="object-cover h-12 w-full" />
                                        ) : (
                                          <img
                                            src={mUrl}
                                            alt="Status proof"
                                            className="object-cover h-12 w-full"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                              e.currentTarget.src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=600&auto=format&fit=crop";
                                            }}
                                          />
                                        )}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: UPDATE STATUS CONTAINER (5/12 cols) */}
                    <div className="md:col-span-5">
                      <div className="bg-slate-50/40 border border-slate-150/80 rounded-2xl p-5 space-y-4">
                        
                        <div className="flex items-center gap-1.5 border-b border-slate-150/60 pb-2">
                          <CheckCircle size={14} className="text-blue-600" />
                          <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">UPDATE STATUS</h4>
                        </div>

                        <form onSubmit={handleStatusUpdateLocal} className="space-y-4">
                          
                          {/* Target Status Select */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Target Status
                            </label>
                            <div className="relative">
                              <select
                                value={resolverStatus}
                                onChange={(e) => setResolverStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer appearance-none shadow-xs focus:border-blue-500"
                              >
                                <option value="Reported">Reported</option>
                                <option value="Verified">Verified</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Interactive Drag & Drop File Upload Proof Section */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Attach Proofs (Photo/Video)
                            </label>
                            
                            <div
                              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                              onDragLeave={() => setIsDragging(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files) {
                                  const filesArray = Array.from(e.dataTransfer.files);
                                  setSelectedFiles(prev => [...prev, ...filesArray]);
                                }
                              }}
                              onClick={() => document.getElementById("proof-file-input")?.click()}
                              className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition ${
                                isDragging
                                  ? "border-blue-500 bg-blue-50/20"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
                              }`}
                            >
                              <input
                                id="proof-file-input"
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    const filesArray = Array.from(e.target.files);
                                    setSelectedFiles(prev => [...prev, ...filesArray]);
                                  }
                                }}
                                className="hidden"
                              />
                              <div className="flex flex-col items-center gap-1">
                                <Upload size={14} className="text-blue-500" />
                                <span className="text-blue-600 font-bold text-[11px]">Click to upload</span>
                                <span className="text-[9px] text-slate-400 font-medium">or drag files here</span>
                              </div>
                            </div>

                            {/* Selected files preview grid */}
                            {selectedFiles.length > 0 && (
                              <div className="grid grid-cols-4 gap-1.5 mt-2">
                                {selectedFiles.map((file, idx) => {
                                  const isImage = file.type.startsWith("image/");
                                  const objectUrl = URL.createObjectURL(file);
                                  return (
                                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                                      {isImage ? (
                                        <img src={objectUrl} alt="Preview" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                            <path d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                          </svg>
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                                        }}
                                        className="absolute top-0.5 right-0.5 bg-rose-500 text-white rounded-full p-0.5 opacity-90 hover:opacity-100 transition shadow-sm hover:bg-rose-600"
                                      >
                                        <X size={8} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Update Note text area */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Update Note
                            </label>
                            <textarea
                              required
                              value={resolverNote}
                              onChange={(e) => setResolverNote(e.target.value)}
                              placeholder="Explain the progress or resolution..."
                              rows={2}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 shadow-xs"
                            ></textarea>
                          </div>

                          <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                          >
                            Submit Update
                          </button>
                        </form>
                      </div>
                    </div>

                  </div>

                  {/* SEPARATOR LINE */}
                  <div className="border-t border-slate-100 my-4 col-span-full"></div>

                  {/* COMMENTS SECTION */}
                  <div className="col-span-full space-y-3">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={16} className="text-slate-400" />
                      <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Comments ({activeIssue.commentsList?.length || 0})
                      </h4>
                    </div>

                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {(!activeIssue.commentsList || activeIssue.commentsList.length === 0) ? (
                        <p className="text-xs font-semibold text-slate-400/80 italic py-2">No comments yet.</p>
                      ) : (
                        activeIssue.commentsList.map((cmt, idx) => (
                          <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800">{cmt.username}</span>
                                {cmt.role === "resolver" ? (
                                  <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border border-emerald-100">
                                    Resolver
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border border-slate-200">
                                    Citizen
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {(() => {
                                  const d = new Date(cmt.timestamp);
                                  const day = d.getDate();
                                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                  const month = months[d.getMonth()];
                                  const hours = String(d.getHours()).padStart(2, "0");
                                  const minutes = String(d.getMinutes()).padStart(2, "0");
                                  return `${day} ${month}, ${hours}:${minutes}`;
                                })()}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-600 leading-relaxed">{cmt.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Write a comment input form */}
                    <form onSubmit={handleCommentSubmitLocal} className="flex gap-2 items-center pt-2">
                      <input
                        type="text"
                        required
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 rounded-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 shadow-sm transition shrink-0"
                      >
                        Post
                      </button>
                    </form>
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-slate-150/80 rounded-[28px] p-12 text-center text-slate-400 font-medium">
                  Select a concern above to review its details.
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: RESOLVER PROFILE & QUICK CONTROLS (Col-span 4) */}
            <div className="hidden lg:block lg:col-span-4">
              {renderRightPanel(false)}
            </div>

          </div>
        )}
      </main>

      {/* MOBILE DRAWER: PROFILE, YOUR STATS & LEADERBOARD LINKS */}
      <AnimatePresence>
        {showMobileProfileDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileProfileDrawer(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Slider container */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-slate-50 shadow-2xl flex flex-col h-full border-l border-slate-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-150 bg-white shadow-xs">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-950">Resolver Hub</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Operational Console
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMobileProfileDrawer(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                    type="button"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {renderRightPanel(true)}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
