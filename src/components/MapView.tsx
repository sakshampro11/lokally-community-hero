import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Issue } from "../types";
import { Filter, AlertTriangle, Clock, MapPin, Navigation, List, X, Info } from "lucide-react";

interface MapViewProps {
  issues: Issue[];
  onSelectIssue?: (issue: Issue) => void;
}

const CAT_COLORS: Record<string, string> = {
  Pothole: "#f97316",
  Road: "#f97316",
  Water: "#3b82f6",
  Electric: "#eab308",
  Electricity: "#eab308",
  Waste: "#22c55e",
  Sanitation: "#22c55e",
  Streetlight: "#a855f7",
  Other: "#94a3b8",
};

function getCatColor(type: string): string {
  return CAT_COLORS[type] || CAT_COLORS[type.split(" ")[0]] || "#94a3b8";
}

function makeIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <ellipse cx="16" cy="37" rx="6" ry="3" fill="rgba(0,0,0,0.18)"/>
      <path d="M16 2C9.37 2 4 7.37 4 14c0 9 12 24 12 24s12-15 12-24C28 7.37 22.63 2 16 2z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="14" r="5.5" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "custom-leaflet-marker",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  });
}

function formatTimeAgo(dateString: string) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  if (hrs < 24) return hrs === 0 ? "Just now" : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MapView({ issues, onSelectIssue }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Filter issues based on active filter
  const filtered = activeFilter === "all"
    ? issues
    : issues.filter((i) => {
        const typeLower = i.issueType.toLowerCase();
        const filterLower = activeFilter.toLowerCase();
        return typeLower === filterLower || typeLower.includes(filterLower);
      });

  // Count mapped vs total
  const hasLatLng = (issue: Issue) => {
    const loc = (issue.location || {}) as any;
    return !!(loc.lat || (issue as any).lat);
  };

  const totalFiltered = filtered.length;
  const totalMapped = filtered.filter(hasLatLng).length;
  const totalHighPriority = filtered.filter((i) => i.priority === "High").length;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Build map
    const mapInstance = L.map(mapContainerRef.current, {
      zoomControl: true,
      minZoom: 2,
    }).setView([28.6139, 77.2090], 5); // Default center (e.g. New Delhi / general India coordinates)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    mapRef.current = mapInstance;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync / Render Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    const bounds: L.LatLngBoundsExpression = [];

    filtered.forEach((issue) => {
      const loc = (issue.location || {}) as any;
      const lat = loc.lat ?? (typeof (issue as any).lat === "number" ? (issue as any).lat : null);
      const lng = loc.lng ?? (typeof (issue as any).lng === "number" ? (issue as any).lng : null);
      if (!lat || !lng) return;

      const color = getCatColor(issue.issueType);
      const marker = L.marker([lat, lng], { icon: makeIcon(color) });

      const urls = issue.mediaUrls || (issue.mediaUrl ? [issue.mediaUrl] : []);
      const thumbUrl = urls[0] || null;
      const isVideo = thumbUrl && /\.(mp4|mov|webm|avi)$/i.test(thumbUrl);

      const thumbHtml = thumbUrl
        ? isVideo
          ? `<video style="width:100%; height:110px; object-fit:cover; display:block;" src="${thumbUrl}" muted playsinline></video>`
          : `<img style="width:100%; height:110px; object-fit:cover; display:block;" src="${thumbUrl}" alt="Issue photo" />`
        : "";

      const addr = loc.address || (issue as any).address || "—";
      const priorityStyle = issue.priority === "High"
        ? "background:#fee2e2;color:#dc2626"
        : issue.priority === "Medium"
          ? "background:#fef9c3;color:#ca8a04"
          : "background:#f1f5f9;color:#64748b";

      const statusStyle = issue.status === "Resolved"
        ? "background:#dcfce7;color:#16a34a"
        : issue.status === "Verified"
          ? "background:#d1fae5;color:#065f46"
          : issue.status === "In Progress"
            ? "background:#dbeafe;color:#2563eb"
            : "background:#fef3c7;color:#d97706";

      const badgeColor = getCatColor(issue.issueType);

      const popupContent = `
        <div style="font-family:'Inter', sans-serif; overflow:hidden; width:240px;">
          ${thumbHtml}
          <div style="padding:12px;">
            <span style="display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px; background:${badgeColor}15; color:${badgeColor}; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.04em;">
              ${issue.issueType}
            </span>
            <div style="font-family:'Space Grotesk', sans-serif; font-size:14px; font-weight:800; color:#0f172a; margin-bottom:6px; line-height:1.3;">
              ${issue.title}
            </div>
            <div style="display:flex; gap:4px; align-items:center; font-size:11px; color:#64748b; font-weight:500; margin-bottom:4px;">
              <span style="font-size:12px;">📍</span>
              <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">${addr}</span>
            </div>
            <div style="display:flex; gap:4px; align-items:center; font-size:11px; color:#64748b; font-weight:500; margin-bottom:8px;">
              <span style="font-size:12px;">👤</span>
              <span>Reported by ${issue.name}</span>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
              <span style="display:inline-block; font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px; ${priorityStyle}; text-transform:uppercase;">
                ${issue.priority} Priority
              </span>
              <span style="display:inline-block; font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px; ${statusStyle}; text-transform:uppercase;">
                ${issue.status}
              </span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 260 });
      marker.on("click", () => {
        setActiveCardId(issue.id);
        if (onSelectIssue) onSelectIssue(issue);
      });

      marker.addTo(map);
      markersRef.current[issue.id] = marker;
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [filtered]);

  // Handle focusing an issue from card list click
  const focusIssue = (issue: Issue) => {
    setActiveCardId(issue.id);
    const marker = markersRef.current[issue.id];
    const map = mapRef.current;
    if (marker && map) {
      const loc = (issue.location || {}) as any;
      const lat = loc.lat ?? (issue as any).lat;
      const lng = loc.lng ?? (issue as any).lng;
      if (lat && lng) {
        map.flyTo([Number(lat), Number(lng)], 15, { duration: 0.8 });
        setTimeout(() => {
          marker.openPopup();
        }, 850);
      }
    }
    if (onSelectIssue) onSelectIssue(issue);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="relative flex h-[calc(100vh-80px)] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* SIDEBAR */}
      <aside
        className={`absolute inset-y-0 left-0 z-10 flex w-80 flex-shrink-0 flex-col border-r border-slate-100 bg-white transition-all duration-300 md:relative md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-extrabold text-slate-900 tracking-tight">
              Community Issues
            </h2>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 md:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Filter Chips inside Sidebar */}
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            <button
              onClick={() => {
                setActiveFilter("all");
                setActiveCardId(null);
              }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${
                activeFilter === "all"
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
              All
            </button>
            {Object.keys(CAT_COLORS).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveFilter(cat);
                  setActiveCardId(null);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold border transition ${
                  activeFilter.toLowerCase() === cat.toLowerCase()
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: CAT_COLORS[cat] }}
                ></span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-2 text-[10px] font-bold text-slate-500">
          <div>
            Total: <span className="text-blue-600">{totalFiltered}</span>
          </div>
          <div>
            Mapped: <span className="text-emerald-600">{totalMapped}</span>
          </div>
          <div>
            High Priority: <span className="text-rose-500">{totalHighPriority}</span>
          </div>
        </div>

        {/* Issue Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-400">
              No issues in this category.
            </div>
          ) : (
            filtered.map((issue) => {
              const hasLoc = hasLatLng(issue);
              const color = getCatColor(issue.issueType);
              const isSelected = issue.id === activeCardId;

              const urls = issue.mediaUrls || (issue.mediaUrl ? [issue.mediaUrl] : []);
              const thumbUrl = urls[0] || null;

              return (
                <div
                  key={issue.id}
                  onClick={() => focusIssue(issue)}
                  className={`group relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-3.5 transition duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/40"
                      : "border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/10"
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <div className="flex-1">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider mb-1.5"
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                        }}
                      >
                        {issue.issueType}
                      </span>
                      <h4 className="font-display text-xs font-bold text-slate-800 line-clamp-1 leading-snug">
                        {issue.title}
                      </h4>
                    </div>
                    {thumbUrl && (
                      <img
                        src={thumbUrl}
                        alt=""
                        className="h-10 w-12 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={11} className={issue.priority === "High" ? "text-rose-500" : "text-slate-300"} />
                      {issue.priority} Priority
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={11} />
                      {formatTimeAgo(issue.createdAt)}
                    </span>
                  </div>

                  {!hasLoc && (
                    <div className="text-[9px] font-bold text-slate-400 italic flex items-center gap-1 mt-1">
                      📍 No GPS location
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* MAP CANVAS CONTAINER */}
      <div className="relative flex-1 h-full w-full bg-slate-100">
        <div id="leaflet-map-canvas" className="h-full w-full z-0" ref={mapContainerRef}></div>

        {/* Category Legend (Overlay) */}
        <div className="absolute bottom-5 right-5 z-[500] hidden rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-xl backdrop-blur sm:block max-w-xs">
          <h3 className="font-display text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2.5">
            Color Legend
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f97316] shadow-sm"></span>
              Pothole / Road
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6] shadow-sm"></span>
              Water Supply
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#eab308] shadow-sm"></span>
              Electricity
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-sm"></span>
              Waste / Sanitation
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#a855f7] shadow-sm"></span>
              Streetlight
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#94a3b8] shadow-sm"></span>
              Other
            </div>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="absolute bottom-5 left-5 z-[500] flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl hover:bg-blue-700 md:hidden active:scale-[0.97] transition"
        >
          <List size={14} />
          <span>Issues Feed</span>
        </button>
      </div>
    </div>
  );
}
