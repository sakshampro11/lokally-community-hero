import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin } from "lucide-react";

interface MapPickerProps {
  lat: number | string;
  lng: number | string;
  onChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090]; // New Delhi
const DEFAULT_ZOOM = 13;

function makePickerIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <ellipse cx="16" cy="37" rx="6" ry="3" fill="rgba(0,0,0,0.25)"/>
      <path d="M16 2C9.37 2 4 7.37 4 14c0 9 12 24 12 24s12-15 12-24C28 7.37 22.63 2 16 2z"
            fill="#ef4444" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="14" r="5.5" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "custom-leaflet-picker-marker",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialLat = typeof lat === "number" ? lat : DEFAULT_CENTER[0];
    const initialLng = typeof lng === "number" ? lng : DEFAULT_CENTER[1];

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      minZoom: 2,
      tap: true, // Native Leaflet tap handler for touch devices
    } as any).setView([initialLat, initialLng], typeof lat === "number" ? 15 : DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Create a draggable marker
    const marker = L.marker([initialLat, initialLng], {
      icon: makePickerIcon(),
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;

    // Handle marker drag event
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      onChange(position.lat, position.lng);
    });

    // Handle map click to move marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      onChange(clickLat, clickLng);
    });

    // Clean up
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position if props change externally (e.g. from GPS lock or auto fill)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (typeof lat === "number" && typeof lng === "number") {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== lat || currentPos.lng !== lng) {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng], 15);
      }
    }
  }, [lat, lng]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setGpsLoading(false);
        onChange(userLat, userLng);
      },
      (error) => {
        setGpsLoading(false);
        setGpsError("Unable to retrieve GPS coordinates. You can still drag the map or pin manually.");
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Mark Location on Map
          </span>
          <p className="text-[10px] font-medium text-slate-400">
            Tap anywhere on the map or drag the red pin to set the exact location.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={gpsLoading}
          className="flex items-center gap-1.5 self-start sm:self-center rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 px-2.5 py-1 text-[11px] font-bold text-blue-600 transition"
        >
          <Navigation size={11} className={gpsLoading ? "animate-spin" : ""} />
          <span>{gpsLoading ? "Getting GPS..." : "Find My Location"}</span>
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
        <div ref={mapContainerRef} className="h-44 w-full z-10" />
        {typeof lat === "number" && typeof lng === "number" && (
          <div className="absolute bottom-2 left-2 z-20 bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono text-white px-2 py-1 rounded shadow-xs flex items-center gap-1">
            <MapPin size={10} className="text-rose-400" />
            <span>
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          </div>
        )}
      </div>

      {gpsError && (
        <p className="text-[10px] font-semibold text-rose-500">{gpsError}</p>
      )}
    </div>
  );
}
