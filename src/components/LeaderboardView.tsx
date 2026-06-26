import React, { useEffect, useState } from "react";
import { User } from "../types";
import { Trophy, Award, Medal, ShieldCheck, UserCheck, Star, Sparkles, HelpCircle, X, Info } from "lucide-react";

interface LeaderboardViewProps {
  currentUserRole?: "citizen" | "resolver";
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function LeaderboardView({ currentUserRole = "citizen" }: LeaderboardViewProps) {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("ch_token");
      const res = await fetch("/api/auth/leaderboard", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      } else {
        throw new Error("Could not load leaderboard data");
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to update leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Banner */}
      <div className={`rounded-3xl p-8 text-white shadow-lg relative overflow-hidden bg-linear-to-r ${
        currentUserRole === "resolver"
          ? "from-blue-600 via-indigo-600 to-violet-600"
          : "from-amber-500 via-orange-500 to-rose-500"
      }`}>
        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Trophy size={12} /> {currentUserRole === "resolver" ? "Resolvers Honor Roll" : "Citizens Honor Roll"}
          </span>
          <div className="flex items-center gap-2.5 mt-4">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {currentUserRole === "resolver" ? "Municipal Resolvers" : "Locality Leaderboard"}
            </h1>
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition shadow-xs cursor-pointer"
              title="How the Leaderboard and Badges Work"
            >
              <HelpCircle size={16} />
            </button>
          </div>
          <p className="mt-2 text-sm font-medium text-white/90 leading-relaxed">
            {currentUserRole === "resolver"
              ? "Meet the municipal departments and verified resolvers working to fix our city's infrastructure. Keep up the great work resolving community concerns!"
              : "Meet the active community heroes working hard to monitor, report, and verify local improvements. Earn points and unlock custom badges by reporting issues or submitting verifications!"}
          </p>
        </div>
        {/* Abstract design element */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-2 right-12 text-white/10 select-none pointer-events-none">
          <Trophy size={160} strokeWidth={1} />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="text-sm font-semibold text-slate-400">Loading leaderboard stats...</span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          No users registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Top 3 Podium Cards */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-display text-lg font-extrabold text-slate-900 tracking-tight">
              Podium Heroes
            </h3>

            <div className="space-y-4">
              {leaderboard.slice(0, 3).map((user, idx) => {
                const colors = [
                  { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: <Trophy size={20} className="text-amber-500" /> },
                  { bg: "bg-slate-100 border-slate-300", text: "text-slate-700", icon: <Medal size={20} className="text-slate-400" /> },
                  { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", icon: <Medal size={20} className="text-orange-600" /> },
                ][idx] || { bg: "bg-slate-50 border-slate-200", text: "text-slate-600", icon: null };

                return (
                  <div
                    key={user.id}
                    className={`rounded-2xl border p-5 shadow-xs flex items-center gap-4 relative overflow-hidden ${colors.bg}`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs shrink-0">
                      {colors.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-base font-black text-slate-800 truncate">
                          {user.name}
                        </span>
                        {user.role === "resolver" ? (
                          <ShieldCheck size={14} className="text-blue-500 shrink-0" title="Resolver" />
                        ) : (
                          <UserCheck size={14} className="text-emerald-500 shrink-0" title="Citizen" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">
                        {user.role === "resolver" ? "Verified Resolver" : "Verified Citizen"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {currentUserRole === "resolver" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[9px] font-extrabold text-blue-600 uppercase tracking-wide">
                            {user.resolverIssuesResolved || 0} Resolved
                          </span>
                        ) : (
                          user.badges && user.badges.slice(0, 2).map((badge) => (
                            <span
                              key={badge}
                              className="inline-flex items-center gap-0.5 rounded-full bg-white border border-slate-200/60 px-2 py-0.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-wide"
                            >
                              <Star size={8} className="text-amber-500 fill-amber-500" />
                              {badge}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-display text-xl font-black text-slate-900">
                        {user.points}
                      </span>
                      <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Table List */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-150 bg-white p-6 shadow-xs">
            <h3 className="font-display text-lg font-extrabold text-slate-900 tracking-tight mb-4">
              All Ranked Members
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">{currentUserRole === "resolver" ? "Department" : "Member"}</th>
                    <th className="py-3 px-4">Role</th>
                    {currentUserRole === "resolver" ? (
                      <th className="py-3 px-4 text-center">Issues Resolved</th>
                    ) : (
                      <>
                        <th className="py-3 px-4 text-center">Reports</th>
                        <th className="py-3 px-4 text-center">Verifications</th>
                      </>
                    )}
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-600">
                  {leaderboard.map((user, idx) => {
                    const isTop3 = idx < 3;
                    const rankBadge = isTop3
                      ? ["🥇", "🥈", "🥉"][idx]
                      : `#${idx + 1}`;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-display text-sm font-extrabold text-slate-800">
                          {rankBadge}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 font-display text-xs font-bold text-blue-600 border border-blue-100 uppercase">
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <span className="block text-slate-800 truncate max-w-[140px]">{user.name}</span>
                              <span className="block text-[10px] font-medium text-slate-400">
                                {currentUserRole === "resolver"
                                  ? `${user.resolverIssuesResolved || 0} resolutions logged`
                                  : user.badges && user.badges.length > 0
                                    ? `${user.badges.length} badges unlocked`
                                    : "No badges unlocked"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 capitalize text-slate-500">
                          {user.role === "resolver" ? "Official Resolver" : "Civic Citizen"}
                        </td>
                        {currentUserRole === "resolver" ? (
                          <td className="py-3.5 px-4 text-center text-slate-700">
                            {user.resolverIssuesResolved || 0}
                          </td>
                        ) : (
                          <>
                            <td className="py-3.5 px-4 text-center text-slate-700">
                              {user.reportsCount || 0}
                            </td>
                            <td className="py-3.5 px-4 text-center text-slate-700">
                              {user.verificationsCount || 0}
                            </td>
                          </>
                        )}
                        <td className="py-3.5 px-4 text-right font-display text-sm font-extrabold text-slate-900">
                          {user.points || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Rules & Badges Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto sm:p-8">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-6 right-6 rounded-xl border border-slate-100 bg-white p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 border border-amber-100">
                <Trophy size={20} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                  How Leaderboard Works
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Earn points, complete milestones, and unlock official civic badges!
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Section 1: Points Rules */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-3">
                  XP / Points System
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-slate-100 p-3.5 text-center">
                    <span className="block text-xl font-black text-blue-600">+5 XP</span>
                    <span className="block text-[11px] font-bold text-slate-700 mt-1">Report an Issue</span>
                    <span className="block text-[10px] font-medium text-slate-400 mt-0.5">Submit any civic complaint</span>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-3.5 text-center">
                    <span className="block text-xl font-black text-purple-600">+2 XP</span>
                    <span className="block text-[11px] font-bold text-slate-700 mt-1">Verify an Issue</span>
                    <span className="block text-[10px] font-medium text-slate-400 mt-0.5">Confirm reports from others</span>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-3.5 text-center">
                    <span className="block text-xl font-black text-emerald-600">+10 XP</span>
                    <span className="block text-[11px] font-bold text-slate-700 mt-1">Issue Resolved</span>
                    <span className="block text-[10px] font-medium text-slate-400 mt-0.5">When your report is resolved</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Citizens Badges */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-3 px-1">
                  Citizen Badges
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl border border-blue-100 shrink-0 select-none">
                      🥇
                    </div>
                    <div>
                      <span className="block text-sm font-extrabold text-slate-800">First Report</span>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Awarded automatically to civic citizens upon submitting their first community issue report.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl border border-purple-100 shrink-0 select-none">
                      👁️
                    </div>
                    <div>
                      <span className="block text-sm font-extrabold text-slate-800">Community Watcher</span>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Awarded to citizens after performing 5 or more on-the-ground verifications of neighbors' reports.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl border border-emerald-100 shrink-0 select-none">
                      🛠️
                    </div>
                    <div>
                      <span className="block text-sm font-extrabold text-slate-800">Problem Solver</span>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Awarded to citizens once at least one of their reported issues has been fully resolved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Resolver Badges */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-3 px-1">
                  Resolver Milestones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-white p-4 flex flex-col items-center text-center shadow-2xs">
                    <span className="text-2xl mb-1 select-none">⚡</span>
                    <span className="block text-xs font-extrabold text-slate-800">5 Issues Resolved</span>
                    <span className="block text-[10px] font-medium text-slate-400 mt-1">Milestone 1 for official resolvers</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-4 flex flex-col items-center text-center shadow-2xs">
                    <span className="text-2xl mb-1 select-none">🔥</span>
                    <span className="block text-xs font-extrabold text-slate-800">10 Issues Resolved</span>
                    <span className="block text-[10px] font-medium text-slate-400 mt-1">Milestone 2 for official resolvers</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-4 flex flex-col items-center text-center shadow-2xs">
                    <span className="text-2xl mb-1 select-none">🏆</span>
                    <span className="block text-xs font-extrabold text-slate-800">25 Issues Resolved</span>
                    <span className="block text-[10px] font-medium text-slate-400 mt-1">Elite milestone for resolver departments</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
