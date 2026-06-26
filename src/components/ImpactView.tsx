import React, { useEffect, useState } from "react";
import { Issue } from "../types";
import { 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  Clock, 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  Calendar, 
  Droplet, 
  Zap, 
  Trash2, 
  Lightbulb, 
  Construction, 
  AlertCircle,
  Globe,
  Megaphone,
  Percent
} from "lucide-react";
import { motion } from "motion/react";

interface ImpactViewProps {
  issues: Issue[];
}

interface AIInsightBullet {
  text: string;
  severity: "info" | "watch" | "urgent";
  category: string;
}

interface AIInsightsData {
  summary: string;
  bullets: AIInsightBullet[];
}

// Map categories to modern visual accents
const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; iconColor: string }> = {
  Pothole: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", iconColor: "text-amber-500" },
  Water: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", iconColor: "text-blue-500" },
  Electric: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100", iconColor: "text-yellow-500" },
  Waste: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", iconColor: "text-emerald-500" },
  Streetlight: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", iconColor: "text-indigo-500" },
  Sanitation: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100", iconColor: "text-teal-500" },
  Road: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-150", iconColor: "text-slate-500" },
  Other: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", iconColor: "text-violet-500" },
};

function getCategoryIcon(type: string, size = 16) {
  switch (type) {
    case "Water": return <Droplet size={size} />;
    case "Electric": return <Zap size={size} />;
    case "Waste": return <Trash2 size={size} />;
    case "Streetlight": return <Lightbulb size={size} />;
    case "Pothole": return <Construction size={size} />;
    default: return <AlertCircle size={size} />;
  }
}

function getAreaLabel(address: string | null): string {
  if (!address) return "General Area / Citywide";
  // Clean up and extract first part of address or neighborhood
  const parts = address.split(",");
  let candidate = parts[0].trim();
  if (candidate.length < 3 && parts.length > 1) {
    candidate = (parts[0].trim() + ", " + parts[1].trim());
  }
  candidate = candidate.replace(/^(near|opposite|behind|at|beside|in front of)\s+/i, "");
  // Limit length
  if (candidate.length > 32) {
    candidate = candidate.slice(0, 32) + "...";
  }
  return candidate || "General Area";
}

export default function ImpactView({ issues }: ImpactViewProps) {
  const [aiInsights, setAiInsights] = useState<AIInsightsData | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(true);
  const [aiError, setAiError] = useState<string | null>(null);

  // 1. Core Calculations
  const totalReports = issues.length;
  const resolvedAllTime = issues.filter((i) => i.status === "Resolved").length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedAllTime / totalReports) * 100) : 0;

  // Resolved this month calculation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const resolvedThisMonth = issues.filter((i) => {
    if (i.status !== "Resolved") return false;
    const resolvedEntry = i.statusHistory?.find((h) => h.status === "Resolved");
    if (resolvedEntry) {
      const d = new Date(resolvedEntry.timestamp);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }
    if (i.updatedAt) {
      const d = new Date(i.updatedAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }
    return false;
  }).length;

  // Average resolution time calculation
  let totalResolutionTimeMs = 0;
  let resolvedWithTimeCount = 0;

  issues.forEach((i) => {
    if (i.status === "Resolved") {
      const createdTime = new Date(i.createdAt).getTime();
      const resolvedEntry = i.statusHistory?.find((h) => h.status === "Resolved");
      const resolvedTime = resolvedEntry 
        ? new Date(resolvedEntry.timestamp).getTime() 
        : i.updatedAt 
          ? new Date(i.updatedAt).getTime() 
          : null;

      if (resolvedTime && createdTime && resolvedTime >= createdTime) {
        totalResolutionTimeMs += (resolvedTime - createdTime);
        resolvedWithTimeCount++;
      }
    }
  });

  const avgResolutionTimeHours = resolvedWithTimeCount > 0 
    ? (totalResolutionTimeMs / resolvedWithTimeCount) / (1000 * 60 * 60) 
    : 0;

  let avgResolutionTimeText = "N/A";
  if (resolvedWithTimeCount > 0) {
    if (avgResolutionTimeHours < 24) {
      avgResolutionTimeText = `${avgResolutionTimeHours.toFixed(1)} hrs`;
    } else {
      const days = avgResolutionTimeHours / 24;
      avgResolutionTimeText = `${days.toFixed(1)} days`;
    }
  }

  // 2. Category Breakdown calculations
  const categoryCounts: Record<string, number> = {};
  issues.forEach((i) => {
    const cat = i.issueType || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryBreakdown = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      pct: totalReports > 0 ? Math.round((count / totalReports) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Status Breakdown calculations
  const statusCounts = {
    Reported: issues.filter((i) => i.status === "Reported").length,
    Verified: issues.filter((i) => i.status === "Verified").length,
    "In Progress": issues.filter((i) => i.status === "In Progress").length,
    Resolved: issues.filter((i) => i.status === "Resolved").length,
  };

  const totalStatus = statusCounts.Reported + statusCounts.Verified + statusCounts["In Progress"] + statusCounts.Resolved;

  // 4. Hotspot extraction (areas with the most reports)
  const areaCounts: Record<string, { total: number; resolved: number; categoryDistribution: Record<string, number> }> = {};
  
  issues.forEach((i) => {
    const area = getAreaLabel(i.address || (i.location ? i.location.address : null));
    if (!areaCounts[area]) {
      areaCounts[area] = { total: 0, resolved: 0, categoryDistribution: {} };
    }
    areaCounts[area].total += 1;
    if (i.status === "Resolved") {
      areaCounts[area].resolved += 1;
    }
    const cat = i.issueType || "Other";
    areaCounts[area].categoryDistribution[cat] = (areaCounts[area].categoryDistribution[cat] || 0) + 1;
  });

  const hotspots = Object.entries(areaCounts)
    .map(([area, stats]) => {
      // Find top category in this area
      let topCategory = "Other";
      let maxCatCount = 0;
      Object.entries(stats.categoryDistribution).forEach(([cat, count]) => {
        if (count > maxCatCount) {
          maxCatCount = count;
          topCategory = cat;
        }
      });

      return {
        area,
        total: stats.total,
        resolved: stats.resolved,
        topCategory,
        pctResolved: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // top 5 hotspots

  // 5. Fetch AI Insights
  useEffect(() => {
    async function fetchInsights() {
      try {
        setAiLoading(true);
        const res = await fetch("/api/issues/ai-insights");
        if (res.ok) {
          const data = await res.json();
          setAiInsights(data);
        } else {
          throw new Error("Failed to load insights");
        }
      } catch (err: any) {
        setAiError(err.message || "Could not connect to Gemini AI");
      } finally {
        setAiLoading(false);
      }
    }
    fetchInsights();
  }, [issues]);

  const reportsThisMonth = issues.filter((i) => {
    const d = new Date(i.createdAt);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const lastUpdatedText = (() => {
    if (issues.length === 0) return "Just updated";
    const dates = issues.map(i => new Date(i.updatedAt || i.createdAt).getTime());
    const maxDate = new Date(Math.max(...dates));
    return maxDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) + ", " + maxDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  })();

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Citywide Impact Header - Styled precisely like the screenshot */}
      <div className="pt-4 pb-2">
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100/60 px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider">
          <Globe size={14} className="text-emerald-500 animate-pulse" /> Citywide Impact
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-6 max-w-4xl">
          How Our Community Is Making a Difference
        </h1>
        <p className="mt-4 text-slate-500 font-medium text-base sm:text-lg max-w-3xl leading-relaxed">
          Live aggregate statistics from every issue reported across the city. No individual data — just the collective progress we're building together.
        </p>
        <p className="mt-3 text-xs font-bold text-slate-400">
          Last updated {lastUpdatedText}
        </p>
      </div>

      {/* High-level metrics row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Reports */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-7 shadow-xs hover:shadow-sm transition-shadow duration-200 low-end-simplify-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50">
              <Megaphone size={16} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Issues Reported
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">{totalReports}</span>
            <span className="block text-xs font-bold text-slate-400">
              {reportsThisMonth} reported this month
            </span>
          </div>
        </div>

        {/* Metric 2: Resolved This Month */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-7 shadow-xs hover:shadow-sm transition-shadow duration-200 low-end-simplify-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Resolved This Month
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">{resolvedThisMonth}</span>
            <span className="block text-xs font-bold text-slate-400">
              {resolvedAllTime} total resolved all-time
            </span>
          </div>
        </div>

        {/* Metric 3: Resolution Rate */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-7 shadow-xs hover:shadow-sm transition-shadow duration-200 low-end-simplify-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100/50">
              <Percent size={16} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Resolution Rate
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">{resolutionRate}%</span>
            <span className="block text-xs font-bold text-slate-400">
              of all reported issues
            </span>
          </div>
        </div>

        {/* Metric 4: Avg Resolution Time */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-7 shadow-xs hover:shadow-sm transition-shadow duration-200 low-end-simplify-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50">
              <Clock size={16} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Avg. Resolution Time
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-4xl font-extrabold text-slate-900 tracking-tight">{avgResolutionTimeText}</span>
            <span className="block text-xs font-bold text-slate-400">
              across {resolvedWithTimeCount > 0 ? resolvedWithTimeCount : resolvedAllTime} resolved issues
            </span>
          </div>
        </div>
      </div>

      {/* AI Insights Panel (Hourly Cached) */}
      <div className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-100/50">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                AI Insights
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                Recurring patterns detected in the last 30 days
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-extrabold bg-violet-50/50 text-violet-700 px-3 py-1 rounded-full border border-violet-100 uppercase tracking-wider">
              Insights generated {lastUpdatedText}
            </span>
          </div>
        </div>

        {aiLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-slate-50 rounded-full animate-pulse w-3/4" />
            <div className="h-3 bg-slate-50 rounded-full animate-pulse w-5/6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div className="h-20 bg-slate-50/50 rounded-2xl border border-slate-100 animate-pulse" />
              <div className="h-20 bg-slate-50/50 rounded-2xl border border-slate-100 animate-pulse" />
              <div className="h-20 bg-slate-50/50 rounded-2xl border border-slate-100 animate-pulse" />
            </div>
          </div>
        ) : aiError ? (
          <p className="text-xs text-slate-500 font-semibold">{aiError}</p>
        ) : (
          <div className="space-y-6">
            {aiInsights?.summary && (
              <p className="text-sm font-semibold text-slate-700 leading-relaxed p-4 bg-slate-50/40 border border-slate-100/50 rounded-2xl">
                {aiInsights.summary}
              </p>
            )}

            {aiInsights?.bullets && aiInsights.bullets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.bullets.map((bullet, idx) => {
                  let badgeBg = "bg-blue-100 text-blue-700 border-blue-200";
                  let cardBorder = "border-blue-100 bg-blue-50/20";
                  let Icon = Info;

                  if (bullet.severity === "urgent") {
                    badgeBg = "bg-rose-100 text-rose-700 border-rose-200";
                    cardBorder = "border-rose-100 bg-rose-50/20";
                    Icon = ShieldAlert;
                  } else if (bullet.severity === "watch") {
                    badgeBg = "bg-amber-100 text-amber-700 border-amber-200";
                    cardBorder = "border-amber-100 bg-amber-50/20";
                    Icon = AlertTriangle;
                  }

                  const catStyle = CATEGORY_STYLES[bullet.category] || CATEGORY_STYLES.Other;

                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`rounded-2xl border p-5 flex flex-col justify-between ${cardBorder}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          <Icon size={16} className={bullet.severity === "urgent" ? "text-rose-500" : bullet.severity === "watch" ? "text-amber-500" : "text-blue-500"} />
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          {bullet.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 mt-4">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeBg}`}>
                          {bullet.severity}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                          {getCategoryIcon(bullet.category, 9)}
                          {bullet.category}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 text-center text-sm font-semibold text-slate-500">
                AI insights are temporarily unavailable. Please check back later.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bento Layout: Breakdown Charts and Area Hotspots */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* 1. Category Breakdown Card */}
        <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-xs lg:col-span-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-black text-slate-900 tracking-tight mb-1">
              Category Distribution
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mb-5">
              Live count and proportional impact of issues classified by operational departments.
            </p>

            <div className="space-y-4">
              {categoryBreakdown.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs font-bold text-slate-400">
                  No categories logged yet
                </div>
              ) : (
                categoryBreakdown.map((item, index) => {
                  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Other;
                  return (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${style.bg} ${style.text} ${style.border}`}>
                            {getCategoryIcon(item.category, 12)}
                          </div>
                          <span className="text-xs font-bold text-slate-800">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900">{item.count}</span>
                          <span className="text-[10px] text-slate-400 font-semibold ml-1.5">({item.pct}%)</span>
                        </div>
                      </div>
                      
                      {/* Custom styled progress bar acting as a visual bar chart */}
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05 }}
                          className={`h-full rounded-full ${index === 0 ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-slate-800"}`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 2. Status Breakdown Card */}
        <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-xs lg:col-span-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-black text-slate-900 tracking-tight mb-1">
              Operational Resolution Funnel
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mb-5">
              Citywide issue workflow states from initial community reporting to verified resolution.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Reported Card */}
              <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Reported</span>
                  <span className="text-lg font-black text-slate-800">{statusCounts.Reported}</span>
                </div>
                <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400" style={{ width: totalStatus > 0 ? `${(statusCounts.Reported / totalStatus) * 100}%` : "0%" }} />
                </div>
              </div>

              {/* Verified Card */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/20 p-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Verified</span>
                  <span className="text-lg font-black text-blue-700">{statusCounts.Verified}</span>
                </div>
                <div className="mt-2 h-1 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: totalStatus > 0 ? `${(statusCounts.Verified / totalStatus) * 100}%` : "0%" }} />
                </div>
              </div>

              {/* In Progress Card */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/20 p-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">In Progress</span>
                  <span className="text-lg font-black text-amber-700">{statusCounts["In Progress"]}</span>
                </div>
                <div className="mt-2 h-1 w-full bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: totalStatus > 0 ? `${(statusCounts["In Progress"] / totalStatus) * 100}%` : "0%" }} />
                </div>
              </div>

              {/* Resolved Card */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">Resolved</span>
                  <span className="text-lg font-black text-emerald-700">{statusCounts.Resolved}</span>
                </div>
                <div className="mt-2 h-1 w-full bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: totalStatus > 0 ? `${(statusCounts.Resolved / totalStatus) * 100}%` : "0%" }} />
                </div>
              </div>
            </div>

            {/* Circular Donut Visual using pure SVG */}
            {totalStatus > 0 && (
              <div className="flex items-center justify-center gap-8 py-2 border-t border-slate-100 pt-5">
                <svg width="100" height="100" viewBox="0 0 36 36" className="w-24 h-24 shrink-0">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  
                  {/* Status Ring calculations */}
                  {(() => {
                    let accumulatedPercent = 0;
                    return Object.entries(statusCounts).map(([status, val], idx) => {
                      if (val === 0) return null;
                      const percentage = (val / totalStatus) * 100;
                      const strokeDasharray = `${percentage} ${100 - percentage}`;
                      const strokeDashoffset = 100 - accumulatedPercent + 25; // start from top
                      accumulatedPercent += percentage;

                      let strokeColor = "#94a3b8"; // slate
                      if (status === "Verified") strokeColor = "#3b82f6"; // blue
                      if (status === "In Progress") strokeColor = "#f59e0b"; // amber
                      if (status === "Resolved") strokeColor = "#10b981"; // emerald

                      return (
                        <circle
                          key={status}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="3.2"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                    });
                  })()}
                </svg>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Reported ({Math.round((statusCounts.Reported / totalStatus) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Verified ({Math.round((statusCounts.Verified / totalStatus) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>In Progress ({Math.round((statusCounts["In Progress"] / totalStatus) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Resolved ({Math.round((statusCounts.Resolved / totalStatus) * 100)}%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Hotspot Tracking (Full Width Grid at Bottom) */}
        <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-xs lg:col-span-12">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
            <div>
              <h3 className="font-display text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin size={18} className="text-slate-500" /> Neighborhood Hotspots
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Aggregate list of local neighborhoods and reference points with the highest activity volume.
              </p>
            </div>
            <span className="text-[10px] font-extrabold bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-150 uppercase tracking-wider shrink-0">
              Top 5 Areas
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {hotspots.length === 0 ? (
              <p className="text-xs font-semibold text-slate-400 py-4 text-center">No reports with location descriptors found.</p>
            ) : (
              hotspots.map((spot, index) => {
                const catStyle = CATEGORY_STYLES[spot.topCategory] || CATEGORY_STYLES.Other;
                return (
                  <div key={spot.area} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-600 border border-slate-150 shrink-0">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{spot.area}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-slate-400">
                            {spot.total} {spot.total === 1 ? "report" : "reports"}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                            {getCategoryIcon(spot.topCategory, 9)}
                            Main: {spot.topCategory}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 sm:self-center shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="block text-xs font-black text-slate-900">
                          {spot.resolved} / {spot.total} Resolved
                        </span>
                        <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
                          {spot.pctResolved}% Completion Rate
                        </span>
                      </div>

                      {/* Spark/Gauge line */}
                      <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                        <div 
                          className={`h-full rounded-full ${spot.pctResolved >= 75 ? "bg-emerald-500" : spot.pctResolved >= 35 ? "bg-amber-500" : "bg-rose-400"}`}
                          style={{ width: `${spot.pctResolved}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
