import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo } from "./components/BrandLogo";
import {
  MapPin,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Plus,
  LogOut,
  Filter,
  Upload,
  Clock,
  User,
  Award,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  ThumbsUp,
  Navigation,
  Activity,
  Info,
  Check,
  Camera,
  Shield,
  Phone,
  CornerDownRight,
  Sparkles,
  Trophy,
  Map,
  TrendingUp,
  Bell,
  Gift,
  Mic,
  Image,
  XCircle,
  Share2
} from "lucide-react";
import { User as UserType, Issue, Comment } from "./types";
import { isLowEndDevice, useIsLowEnd } from "./utils/device";
import MapView from "./components/MapView";
import ImpactView from "./components/ImpactView";
import LeaderboardView from "./components/LeaderboardView";
import LandingPage from "./components/LandingPage";
import CitizenAuthView from "./components/CitizenAuthView";
import ResolverAuthView from "./components/ResolverAuthView";
import ResolverDashboardView from "./components/ResolverDashboardView";
import MapPicker from "./components/MapPicker";

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function App() {
  const isLowEnd = useIsLowEnd();
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem("ch_token"));
  const [user, setUser] = useState<UserType | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authMode, setAuthMode] = useState<"landing" | "login" | "register" | "resolver-login">("landing");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Parse referral query param and save to local storage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("lokally_referred_by", ref);
      // Clean query params to look elegant
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Check for SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }

    // Check if on a mobile device
    const mobileCheck = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    setIsMobileDevice(mobileCheck);

    // Check for low-end device rendering path and add CSS class
    if (isLowEndDevice()) {
      document.documentElement.classList.add("is-low-end");
    } else {
      document.documentElement.classList.remove("is-low-end");
    }
  }, []);

  // Forms state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // App state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(false);
  const [clearingIssues, setClearingIssues] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "map" | "impact" | "leaderboard">("dashboard");

  // Modals
  const [showNewIssueModal, setShowNewIssueModal] = useState<boolean>(false);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [activeIssueTab, setActiveIssueTab] = useState<"details" | "comments">("details");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // New Issue form state
  const [newIssue, setNewIssue] = useState({
    title: "",
    summary: "",
    description: "",
    issueType: "",
    priority: "Low",
    address: "",
    lat: "" as string | number,
    lng: "" as string | number
  });
  const [geoStatus, setGeoStatus] = useState<{ status: "idle" | "fetching" | "success" | "error"; message: string }>({
    status: "idle",
    message: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [mobileSkipPhoto, setMobileSkipPhoto] = useState<boolean>(false);

  // AI Auto-fill states
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Voice input states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  // Duplicate detection states
  const [duplicateIssue, setDuplicateIssue] = useState<any | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Location filtering states
  const [currentUserCoords, setCurrentUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAccessFailed, setLocationAccessFailed] = useState<boolean>(false);
  const [locationFilterMode, setLocationFilterMode] = useState<"nearby" | "all">("nearby");

  // New comment state
  const [commentText, setCommentText] = useState<string>("");

  // Status transition form (optional helper for quick testing)
  const [resolverStatus, setResolverStatus] = useState<string>("In Progress");
  const [resolverNote, setResolverNote] = useState<string>("");
  const [resolverProofFiles, setResolverProofFiles] = useState<FileList | null>(null);
  const [resolverFeedTab, setResolverFeedTab] = useState<"open" | "resolved">("open");

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset mobile camera choices when the report issue modal opens/closes
  useEffect(() => {
    if (!showNewIssueModal) {
      setMobileSkipPhoto(false);
    }
  }, [showNewIssueModal]);

  // Profile update modal states
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showMobileProfileDrawer, setShowMobileProfileDrawer] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    address: "",
    phone: "",
    photoUrl: null as string | null
  });
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [corroborateSaving, setCorroborateSaving] = useState<boolean>(false);

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!token) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      showToast("Uploading photo...");
      const res = await fetch("/api/auth/upload-photo", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setProfileForm(prev => ({ ...prev, photoUrl: data.photoUrl }));
        showToast("Photo uploaded successfully!");
      } else {
        const errData = await res.json();
        showToast(errData.message || "Failed to upload photo", "error");
      }
    } catch (err) {
      console.error("Error uploading profile photo:", err);
      showToast("An error occurred during photo upload", "error");
    }
  };

  // Notification states
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showNotificationsDropdown &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotificationsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationsDropdown]);

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ch_read_notification_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("ch_read_notification_ids", JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

  const openProfileModal = () => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        address: user.address || "",
        phone: user.phone || "",
        photoUrl: user.photoUrl || null
      });
      setShowProfileModal(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProfileSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        showToast("Profile updated successfully!");
        setShowProfileDropdown(false);
        setShowProfileModal(false);
      } else {
        const errData = await res.json();
        showToast(errData.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("An error occurred while updating profile", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  // Derive notifications list dynamically in real-time
  const getDerivedNotifications = () => {
    if (!user) return [];
    const list: any[] = [];

    issues.forEach((issue) => {
      const isMyReport = issue.reporterId === user.id;

      // 1. Status changes on my reports
      if (isMyReport && issue.statusHistory) {
        issue.statusHistory.forEach((history) => {
          if (history.status !== "Reported") {
            list.push({
              id: `status-${issue.id}-${history.status}-${history.timestamp}`,
              title: `Report Status: ${history.status}`,
              message: `Your reported issue "${issue.title}" is now ${history.status}. Note: "${history.note}"`,
              time: history.timestamp,
              type: "status",
              issueId: issue.id,
            });
          }
        });
      }

      // 2. Comments on my reports
      if (isMyReport && issue.commentsList) {
        issue.commentsList.forEach((comment) => {
          if (comment.username !== user.name) {
            list.push({
              id: `comment-${issue.id}-${comment.username}-${comment.timestamp}`,
              title: `New Comment on Your Report`,
              message: `${comment.username} commented: "${comment.text}"`,
              time: comment.timestamp,
              type: "comment",
              issueId: issue.id,
            });
          }
        });
      }

      // 3. Confirmations on my reports
      if (isMyReport && issue.confirmations > 0) {
        list.push({
          id: `confirm-${issue.id}-${issue.confirmations}`,
          title: `Community Verification Support`,
          message: `${issue.confirmations} neighbors have verified your report "${issue.title}".`,
          time: issue.updatedAt || issue.createdAt,
          type: "confirm",
          issueId: issue.id,
        });
      }

      // 4. Citywide broadcast: New issues reported recently (last 48 hours)
      const reportedTime = new Date(issue.createdAt).getTime();
      const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
      if (reportedTime > fortyEightHoursAgo) {
        list.push({
          id: `new-issue-${issue.id}`,
          title: `New Issue Reported`,
          message: `A new "${issue.issueType}" issue was reported nearby: "${issue.title}".`,
          time: issue.createdAt,
          type: "report",
          issueId: issue.id,
        });
      }

      // 5. Citywide broadcast: Successfully resolved issues
      if (issue.status === "Resolved") {
        list.push({
          id: `resolved-issue-${issue.id}`,
          title: `Community Victory: Issue Resolved! 🎉`,
          message: `The issue "${issue.title}" has been successfully resolved!`,
          time: issue.updatedAt || issue.createdAt,
          type: "resolved",
          issueId: issue.id,
        });
      }
    });

    // Sort by timestamp descending
    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  };

  const notifications = getDerivedNotifications();
  const unreadNotifications = notifications.filter((n) => !readNotificationIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const handleMarkAllNotificationsAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(allIds);
  };

  const handleNotificationClick = (n: any) => {
    if (!readNotificationIds.includes(n.id)) {
      setReadNotificationIds((prev) => [...prev, n.id]);
    }
    const targetIssue = issues.find((i) => i.id === n.issueId);
    if (targetIssue) {
      setActiveIssue(targetIssue);
    }
    setShowNotificationsDropdown(false);
  };

  // Load user profile if token exists
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setUser(null);
    }
  }, [token]);

  // Load issues list with background polling for real-time notifications
  useEffect(() => {
    fetchIssues();
    const interval = setInterval(() => {
      fetchIssues(true);
    }, 8000); // poll every 8 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch current user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Could not acquire user location:", error);
          setLocationAccessFailed(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setLocationAccessFailed(true);
    }
  }, []);

  // Support deep linking to a specific issue via ?issueId=xyz query parameter
  useEffect(() => {
    if (issues.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const issueId = params.get("issueId");
      if (issueId) {
        const found = issues.find((i) => i.id === issueId);
        if (found) {
          setActiveIssue(found);
        }
      }
    }
  }, [issues]);

  const handleCloseActiveIssue = () => {
    setActiveIssue(null);
    const params = new URLSearchParams(window.location.search);
    if (params.get("issueId")) {
      params.delete("issueId");
      const newQuery = params.toString();
      const newUrl = window.location.origin + window.location.pathname + (newQuery ? `?${newQuery}` : "");
      window.history.replaceState({}, document.title, newUrl);
    }
  };

  const handleShareIssue = async () => {
    if (!activeIssue) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?issueId=${activeIssue.id}`;
    const shareData = {
      title: `Lokally: ${activeIssue.title}`,
      text: `Urgent community report in our neighborhood: "${activeIssue.title}". Tap to view real-time resolver status, photos and updates on Lokally!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("Shared successfully!", "success");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          copyShareLinkToClipboard(shareUrl);
        }
      }
    } else {
      copyShareLinkToClipboard(shareUrl);
    }
  };

  const copyShareLinkToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => {
        showToast("Shareable link copied to clipboard!", "success");
      },
      () => {
        showToast("Failed to copy link.", "error");
      }
    );
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token expired
        handleLogout(true);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const fetchIssues = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleLogout = (force?: any) => {
    if (force === true) {
      performLogout();
    } else {
      setShowLogoutConfirm(true);
    }
  };

  const performLogout = () => {
    localStorage.removeItem("ch_token");
    setToken(null);
    setUser(null);
    setShowLogoutConfirm(false);
  };

  // Auth Submit Handlers
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("ch_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setLoginForm({ email: "", password: "" });
      } else {
        setAuthError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setAuthError("Server communication failed.");
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!agreeTerms) {
      setAuthError("You must agree to the Terms and Privacy Policy");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    const fullName = `${registerForm.firstName} ${registerForm.lastName}`.trim();

    const referredBy = localStorage.getItem("lokally_referred_by") || undefined;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: registerForm.email,
          phone: registerForm.phone,
          address: registerForm.address,
          password: registerForm.password,
          referredBy
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("lokally_referred_by");
        setAuthSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          localStorage.setItem("ch_token", data.token);
          setToken(data.token);
          setUser(data.user);
          setRegisterForm({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            password: "",
            confirmPassword: ""
          });
          setAgreeTerms(false);
        }, 1200);
      } else {
        setAuthError(data.message || "Registration failed");
      }
    } catch (err) {
      setAuthError("Server communication failed.");
    }
  };

  // Get current GPS coordinates
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus({ status: "error", message: "Geolocation is not supported by your browser." });
      return;
    }

    setGeoStatus({ status: "fetching", message: "Acquiring GPS fix..." });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewIssue((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
        setCurrentUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationAccessFailed(false);
        setGeoStatus({
          status: "success",
          message: `Location locked: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        });
      },
      (error) => {
        setGeoStatus({
          status: "error",
          message: "Unable to retrieve location. Please specify address below."
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle Map Picker change and reverse-geocode
  const handleMapPickerChange = async (lat: number, lng: number) => {
    setNewIssue((prev) => ({
      ...prev,
      lat,
      lng
    }));

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: {
          "Accept-Language": "en"
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setNewIssue((prev) => ({
            ...prev,
            address: data.display_name
          }));
        }
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  // File selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 5));
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAutoFillWithAI = async () => {
    if (!newIssue.description.trim()) {
      setAiError("Please type a description of the issue first.");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    const formData = new FormData();
    formData.append("description", newIssue.description);

    // Attach the first image file if available
    if (selectedFiles.length > 0) {
      const firstImage = selectedFiles.find(f => f.type.startsWith("image/"));
      if (firstImage) {
        formData.append("media", firstImage);
      }
    }

    try {
      const res = await fetch("/api/issues/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to analyze with AI");
      }

      const data = await res.json();

      // Normalize the category output to match frontend select values
      let mappedCategory = data.category || "";
      const lowerCat = mappedCategory.toLowerCase();
      if (lowerCat.includes("water")) mappedCategory = "Water";
      else if (lowerCat.includes("electric")) mappedCategory = "Electricity";
      else if (lowerCat.includes("road")) mappedCategory = "Road";
      else if (lowerCat.includes("sanitat")) mappedCategory = "Sanitation";
      else if (lowerCat.includes("waste")) mappedCategory = "Waste";
      else if (lowerCat.includes("pothole")) mappedCategory = "Pothole";
      else if (lowerCat.includes("streetlight")) mappedCategory = "Streetlight";
      else if (lowerCat.includes("other")) mappedCategory = "Other";

      setNewIssue((prev) => ({
        ...prev,
        title: data.title || prev.title,
        summary: data.summary || prev.summary,
        issueType: mappedCategory || prev.issueType,
        priority: ["Low", "Medium", "High"].includes(data.priority) ? data.priority : prev.priority,
      }));

    } catch (err: any) {
      console.error("AI analysis failed, falling back to manual input:", err);
      setAiError("AI analysis failed. Please select category & priority manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser.", "error");
      return;
    }

    if (isListening) {
      if ((window as any).recognitionInstance) {
        (window as any).recognitionInstance.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        showToast("Listening... Speak now", "info");
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          showToast("Microphone access denied. Please enable microphone permission in your browser settings.", "error");
        } else if (event.error === "no-speech") {
          showToast("No speech detected. Please try again.", "info");
        } else {
          showToast(`Speech recognition error: ${event.error}`, "error");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setNewIssue((prev) => ({
            ...prev,
            description: prev.description ? `${prev.description} ${transcript}` : transcript
          }));
          showToast("Speech transcribed!", "success");
        }
      };

      (window as any).recognitionInstance = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      showToast("Could not start speech recognition.", "error");
    }
  };

  // Submit reported issue
  const handleIssueSubmit = async (e: any, bypassCheck: boolean = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newIssue.address.trim() && (!newIssue.lat || !newIssue.lng)) {
      showToast("Please provide either a physical address or mark the location on the map.", "error");
      return;
    }
    const formData = new FormData();
    formData.append("title", newIssue.title);
    formData.append("summary", newIssue.summary || newIssue.description.slice(0, 80));
    formData.append("description", newIssue.description);
    formData.append("issueType", newIssue.issueType);
    formData.append("priority", newIssue.priority);
    formData.append("address", newIssue.address);
    if (newIssue.lat) formData.append("lat", String(newIssue.lat));
    if (newIssue.lng) formData.append("lng", String(newIssue.lng));

    if (user) {
      formData.append("reporterId", user.id);
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", user.phone || "");
    }

    selectedFiles.forEach((file) => {
      formData.append("media", file);
    });

    // Check for duplicates first, unless bypassed
    if (!bypassCheck) {
      setCheckingDuplicate(true);
      try {
        console.log("[Duplicate Check] Starting check-duplicate...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.warn("[Duplicate Check] Timed out on client-side after 35s. Aborting fetch...");
          controller.abort();
        }, 35000);

        const checkRes = await fetch("/api/issues/check-duplicate", {
          method: "POST",
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        console.log("[Duplicate Check] Response received:", checkRes.status);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          console.log("[Duplicate Check] Decoded response data:", checkData);
          if (checkData.duplicate) {
            setDuplicateIssue(checkData.duplicate);
            setShowDuplicateModal(true);
            setCheckingDuplicate(false);
            return; // EXIT here to show duplicate warning modal instead of auto-submitting
          } else {
            console.log("[Duplicate Check] No duplicate detected by AI.");
          }
        } else {
          console.warn("[Duplicate Check] Server returned non-2xx status code:", checkRes.status);
          showToast("Couldn't check for duplicates, filing your report normally.", "info");
        }
      } catch (err: any) {
        console.error("[Duplicate Check] Error or timeout checking duplicates:", err);
        const isAbort = err.name === "AbortError" || err.message?.includes("abort");
        const msg = isAbort 
          ? "Duplicate check took too long; filing your report normally." 
          : "Couldn't check for duplicates, filing your report normally.";
        showToast(msg, "info");
      } finally {
        setCheckingDuplicate(false);
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setShowNewIssueModal(false);
        setNewIssue({
          title: "",
          summary: "",
          description: "",
          issueType: "",
          priority: "Low",
          address: "",
          lat: "",
          lng: ""
        });
        setSelectedFiles([]);
        setGeoStatus({ status: "idle", message: "" });
        setAiError(null);
        setAiLoading(false);
        fetchIssues();
        fetchUserProfile();
        showToast("Issue reported successfully!", "success");
      } else {
        showToast("Failed to submit issue.", "error");
      }
    } catch (err) {
      console.error("Failed to submit issue:", err);
      showToast("Error submitting issue.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateCorroborate = async () => {
    console.log("[Corroborate Clicked] Starting corroborate handler...", {
      duplicateIssueId: duplicateIssue?.id,
      duplicateIssueTitle: duplicateIssue?.title,
      hasToken: !!token,
      hasUser: !!user,
      userId: user?.id,
      corroborateSaving
    });

    if (!duplicateIssue) {
      console.warn("[Corroborate Error] No duplicateIssue found in state!");
      return;
    }
    if (!token) {
      console.warn("[Corroborate Error] No token found in state! Cannot authenticate request.");
      showToast("Please sign in or register to corroborate this issue.", "info");
      return;
    }
    setCorroborateSaving(true);
    try {
      const url = `/api/issues/${duplicateIssue.id}/confirm`;
      console.log(`[Corroborate Fetch] Making POST request to: ${url}`);
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`[Corroborate Response] Status: ${res.status} ${res.statusText}`);

      if (res.ok) {
        const updated = await res.json();
        console.log("[Corroborate Success] Parsed updated issue:", updated);
        setIssues((prev) => prev.map((iss) => (iss.id === duplicateIssue.id ? { ...iss, ...updated } : iss)));
        showToast("You have successfully corroborated this issue! Thank you.", "success");
        setShowDuplicateModal(false);
        setShowNewIssueModal(false);
        setDuplicateIssue(null);
        setNewIssue({
          title: "",
          summary: "",
          description: "",
          issueType: "",
          priority: "Low",
          address: "",
          lat: "",
          lng: ""
        });
        setSelectedFiles([]);
        setGeoStatus({ status: "idle", message: "" });
        setAiError(null);
        setAiLoading(false);
        fetchUserProfile();
      } else {
        let errMsg = "Corroboration failed";
        try {
          const errData = await res.json();
          console.error("[Corroborate Error Response JSON]", errData);
          errMsg = errData.message || errMsg;
        } catch (_) {
          console.error("[Corroborate Error Response Text] Response is not JSON.");
        }

        const isAlreadyHandled = errMsg.includes("own issue") || errMsg.includes("already confirmed");

        if (isAlreadyHandled) {
          showToast(errMsg, "info");
          // Close modals and reset form since they don't need to file a new report
          setShowDuplicateModal(false);
          setShowNewIssueModal(false);
          setDuplicateIssue(null);
          setNewIssue({
            title: "",
            summary: "",
            description: "",
            issueType: "",
            priority: "Low",
            address: "",
            lat: "",
            lng: ""
          });
          setSelectedFiles([]);
          setGeoStatus({ status: "idle", message: "" });
          setAiError(null);
          setAiLoading(false);
          fetchUserProfile();
        } else {
          showToast(errMsg, "error");
        }
      }
    } catch (err: any) {
      console.error("[Corroborate Request Exception] Failed to corroborate issue:", err);
      showToast(`Network error corroborating issue: ${err.message || err}`, "error");
    } finally {
      setCorroborateSaving(false);
      console.log("[Corroborate Ended] setCorroborateSaving(false) executed.");
    }
  };

  const handleDuplicateCancel = (e: any) => {
    setShowDuplicateModal(false);
    handleIssueSubmit(e, true);
  };

  // Upvote locally/instantly
  const handleUpvote = (issueId: string) => {
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id === issueId) {
          return { ...iss, upvotes: (iss.upvotes || 0) + 1 };
        }
        return iss;
      })
    );
  };

  // Community confirmation
  const handleConfirm = async (issueId: string) => {
    if (!token) {
      showToast("Please sign in or register to verify community issues.", "info");
      return;
    }
    try {
      const res = await fetch(`/api/issues/${issueId}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setIssues((prev) => prev.map((iss) => (iss.id === issueId ? updated : iss)));
        if (activeIssue?.id === issueId) {
          setActiveIssue(updated);
        }
        showToast("Issue verification confirmed! Thank you.", "success");
        fetchUserProfile();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Confirmation failed", "error");
      }
    } catch (err) {
      console.error("Failed to confirm issue:", err);
      showToast("Network error confirming issue.", "error");
    }
  };

  // Post comment
  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeIssue) return;

    try {
      const res = await fetch(`/api/issues/${activeIssue.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveIssue(updated);
        setIssues((prev) => prev.map((iss) => (iss.id === updated.id ? updated : iss)));
        setCommentText("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  // Resolver: update status
  const handleStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeIssue) return;

    try {
      const formData = new FormData();
      formData.append("status", resolverStatus);
      formData.append("note", resolverNote);
      if (resolverProofFiles) {
        for (let i = 0; i < resolverProofFiles.length; i++) {
          formData.append("media", resolverProofFiles[i]);
        }
      }

      const res = await fetch(`/api/issues/${activeIssue.id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const updated = await res.json();
        setActiveIssue(updated);
        setIssues((prev) => prev.map((iss) => (iss.id === updated.id ? updated : iss)));
        setResolverNote("");
        setResolverProofFiles(null);
        showToast("Issue status updated successfully!", "success");
        fetchUserProfile();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Failed to update status.", "error");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Network error updating status.", "error");
    }
  };

  // Resolver Dashboard Action Handlers
  const handlePostCommentFromResolver = async (issueId: string, text: string): Promise<Issue | null> => {
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const updated = await res.json();
        setIssues((prev) => prev.map((iss) => (iss.id === updated.id ? updated : iss)));
        return updated;
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
    return null;
  };

  const handleStatusUpdateFromResolver = async (
    issueId: string,
    status: string,
    note: string,
    proofFiles: FileList | File[] | null
  ): Promise<Issue | null> => {
    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("note", note);
      if (proofFiles) {
        for (let i = 0; i < proofFiles.length; i++) {
          formData.append("media", proofFiles[i]);
        }
      }

      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const updated = await res.json();
        setIssues((prev) => prev.map((iss) => (iss.id === updated.id ? updated : iss)));
        showToast("Issue status updated successfully!", "success");
        fetchUserProfile();
        return updated;
      } else {
        const errData = await res.json();
        showToast(errData.message || "Failed to update status.", "error");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Network error updating status.", "error");
    }
    return null;
  };

  // Filters logic
  const filteredIssues = issues.filter((iss) => {
    const matchesCategory = categoryFilter === "All" || iss.issueType === categoryFilter;
    const matchesPriority = priorityFilter === "All" || iss.priority === priorityFilter;

    let matchesLocation = true;
    if (locationFilterMode === "nearby" && currentUserCoords) {
      const itemLat = iss.location?.lat;
      const itemLng = iss.location?.lng;
      if (itemLat != null && itemLng != null) {
        const distance = getDistanceInMeters(currentUserCoords.lat, currentUserCoords.lng, itemLat, itemLng);
        matchesLocation = distance <= 3000; // 3km
      }
    }

    if (user && user.role === "resolver") {
      if (resolverFeedTab === "open") {
        return matchesCategory && matchesPriority && matchesLocation && iss.status !== "Resolved";
      } else {
        return matchesCategory && matchesPriority && matchesLocation && iss.status === "Resolved";
      }
    }

    return matchesCategory && matchesPriority && matchesLocation;
  }).sort((a, b) => {
    const aTime = new Date(a.lastActivityAt || a.updatedAt || a.createdAt).getTime();
    const bTime = new Date(b.lastActivityAt || b.updatedAt || b.createdAt).getTime();
    return bTime - aTime;
  });

  const myReports = user ? issues.filter((iss) => iss.reporterId === user.id) : [];
  const nearbyHighPriority = issues.filter((iss) => iss.priority === "High");

  const renderIssueCard = (issue: Issue) => {
    if (!user) return null;
    return (
      <div
        key={issue.id}
        className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 duration-300 low-end-simplify-card"
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div className="flex-1">
            {/* reporter + date */}
            <div className="mb-3.5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 font-display text-xs font-bold text-blue-600 border border-blue-100">
                {getInitials(issue.name)}
              </div>
              <span className="text-xs font-bold text-slate-700">{issue.name}</span>
              <span className="text-xs text-slate-300">&bull;</span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <Clock size={12} />
                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="font-display text-xl font-extrabold tracking-tight text-slate-950 mb-1.5 leading-snug">
              {issue.title}
            </h3>
            <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed mb-4">
              {issue.description}
            </p>

            {/* Address Location */}
            {(() => {
              let distanceStr = "";
              if (currentUserCoords) {
                const itemLat = issue.location?.lat;
                const itemLng = issue.location?.lng;
                if (itemLat != null && itemLng != null) {
                  const meters = getDistanceInMeters(currentUserCoords.lat, currentUserCoords.lng, itemLat, itemLng);
                  const km = meters / 1000;
                  distanceStr = `${km.toFixed(1)} km away`;
                }
              }

              if (!issue.address && !distanceStr) return null;

              return (
                <div className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-bold text-slate-400">
                  {issue.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-300" />
                      <span>{issue.address}</span>
                    </div>
                  )}
                  {issue.address && distanceStr && <span className="text-slate-300">&bull;</span>}
                  {distanceStr && (
                    <span className="text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase border border-blue-100/40">
                      {distanceStr}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Badges / statuses */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold text-blue-600 tracking-wide uppercase">
                {issue.issueType}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${
                  issue.priority === "High"
                    ? "bg-rose-50 border-rose-100 text-rose-600"
                    : issue.priority === "Medium"
                    ? "bg-amber-50 border-amber-100 text-amber-600"
                    : "bg-slate-50 border-slate-100 text-slate-500"
                }`}
              >
                {issue.priority} Priority
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1 ${
                  issue.status === "Resolved"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : issue.status === "In Progress"
                    ? "bg-sky-50 border-sky-100 text-sky-600"
                    : issue.status === "Verified"
                    ? "bg-purple-50 border-purple-100 text-purple-600"
                    : "bg-amber-50 border-amber-100 text-amber-600"
                }`}
              >
                {issue.status === "Resolved" && <CheckCircle size={12} />}
                {issue.status}
              </span>

              {(issue.confirmations || 0) >= 3 && (
                <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-[11px] font-extrabold text-indigo-600 tracking-wide uppercase flex items-center gap-1">
                  <Award size={12} />
                  Community Verified
                </span>
              )}

              <span className="rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-[11px] font-bold text-violet-600 tracking-wide uppercase flex items-center gap-1">
                👥 {issue.confirmations || 0} {(issue.confirmations || 0) === 1 ? "corroborator" : "corroborators"}
              </span>

              {user && issue.confirmedBy?.includes(user.id) && (
                <span className="rounded-full bg-teal-50 border border-teal-100 px-3 py-1 text-[11px] font-bold text-teal-600 tracking-wide uppercase flex items-center gap-1 animate-pulse">
                  ✓ Corroborated
                </span>
              )}
            </div>
          </div>

          {/* Right Thumbnail (if media attached) */}
          {issue.mediaUrl && (
            <div className="flex h-24 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 shadow-sm sm:h-20 sm:w-28">
              {/\.(mp4|mov|webm|avi)$/i.test(issue.mediaUrl) ? (
                <video
                  src={issue.mediaUrl}
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={issue.mediaUrl}
                  alt="Issue Thumbnail"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=600&auto=format&fit=crop";
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Actions - Placed outside columns to span full card width */}
        <div className="flex flex-wrap gap-2.5 items-center justify-between w-full mt-4 pt-4 border-t border-slate-100/60">
          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              onClick={() => handleUpvote(issue.id)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50 hover:border-amber-100 hover:text-amber-600 px-4 py-2 text-xs font-bold text-slate-600 transition"
            >
              <ThumbsUp size={13} />
              <span>Upvote ({issue.upvotes || 0})</span>
            </button>

            <button
              onClick={() => {
                setActiveIssue(issue);
                setActiveIssueTab("comments");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 px-4 py-2 text-xs font-bold text-slate-600 transition"
            >
              <MessageSquare size={13} />
              <span>Comments ({issue.comments || 0})</span>
            </button>

            {/* Confirm exists */}
            <button
              onClick={() => {
                if (user.id === issue.reporterId) {
                  showToast("You cannot confirm your own report.", "info");
                  return;
                }
                handleConfirm(issue.id);
              }}
              disabled={issue.confirmedBy?.includes(user.id) || user.id === issue.reporterId}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                issue.confirmedBy?.includes(user.id)
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600 cursor-default"
                  : user.id === issue.reporterId
                  ? "border-slate-200 bg-slate-50/50 text-slate-400 cursor-not-allowed opacity-60"
                  : "border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-100 hover:text-purple-600 text-slate-600"
              }`}
            >
              <Check size={13} />
              <span>
                {issue.confirmedBy?.includes(user.id)
                  ? "Confirmed Verified"
                  : user.id === issue.reporterId
                  ? "My Report"
                  : "Confirm still happening"}{" "}
                ({issue.confirmations || 0})
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              setActiveIssue(issue);
              setActiveIssueTab("details");
            }}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition py-2 ml-auto text-right"
          >
            <span>View details</span>
            <ChevronRight size={14} className="mt-0.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderRightPanel = (isMobileDrawer = false) => {
    if (!user) return null;

    const handleEditProfileClick = () => {
      if (isMobileDrawer) {
        setShowMobileProfileDrawer(false);
      }
      openProfileModal();
    };

    const handleIssueClick = (iss: any) => {
      if (isMobileDrawer) {
        setShowMobileProfileDrawer(false);
      }
      setActiveIssue(iss);
      setActiveIssueTab("details");
    };

    return (
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-150 bg-white shadow-sm low-end-simplify-card">
          <div className={`h-20 px-6 py-4 ${isLowEnd ? "bg-blue-600" : "bg-gradient-to-r from-blue-600 to-indigo-600"}`}></div>
          <div className="px-6 pb-6 pt-3 relative">
            <div
              onClick={handleEditProfileClick}
              className="absolute -top-10 left-6 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-blue-50 font-display text-xl font-bold text-blue-600 shadow-md cursor-pointer hover:border-blue-100 hover:scale-105 transition overflow-hidden low-end-simplify-card"
              title="Click to Edit Profile"
            >
              {user.photoUrl ? (
                <img src={user.photoUrl} className="h-full w-full object-cover" alt={user.name} referrerPolicy="no-referrer" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="h-6"></div>
            <div className="flex items-center justify-between gap-2">
              <h3
                onClick={handleEditProfileClick}
                className="font-display text-xl font-extrabold tracking-tight text-slate-900 leading-snug cursor-pointer hover:text-blue-600 transition truncate max-w-[150px] xs:max-w-[200px]"
                title="Click to Edit Profile"
              >
                {user.name}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleEditProfileClick}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Edit Profile
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => {
                    if (isMobileDrawer) {
                      setShowMobileProfileDrawer(false);
                    }
                    handleLogout();
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <Shield size={13} className="text-slate-300" />
              <span>
                {user.role === "resolver" ? "Verified Service Resolver" : "Verified Civic Citizen"}
              </span>
            </div>

            {/* Gamer stats */}
            {user.role !== "resolver" && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Your Points
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    <Award size={12} />
                    {user.points} XP
                  </span>
                </div>

                {/* Earned Badges */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Earned Badges
                  </span>
                  {!user.badges || user.badges.length === 0 ? (
                    <p className="mt-1.5 text-xs font-medium text-slate-400">
                      No badges yet. Start reporting and verifying issues to earn awards!
                    </p>
                  ) : (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {user.badges.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50/50 px-2 py-0.5 text-[10px] font-bold text-indigo-700"
                        >
                          <Award size={10} />
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resolver stats */}
            {user.role === "resolver" && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Resolved
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <CheckCircle size={12} />
                    {user.resolverIssuesResolved || 0} Resolved
                  </span>
                </div>

                {/* Resolver Badges */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Operational Badges
                  </span>
                  {!user.badges || user.badges.length === 0 ? (
                    <p className="mt-1.5 text-xs font-medium text-slate-400">
                      No operational badges yet. Keep resolving community issues!
                    </p>
                  ) : (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {user.badges.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50/50 px-2 py-0.5 text-[10px] font-bold text-indigo-700"
                        >
                          <Award size={10} />
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Your Reports / Issues list */}
        {user.role !== "resolver" && (
          <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm">
            <h4 className="font-display text-lg font-extrabold text-slate-950 mb-4 flex items-center gap-1.5">
              <FileText size={18} className="text-blue-500" />
              <span>Your Reports ({myReports.length})</span>
            </h4>
            {myReports.length === 0 ? (
              <p className="text-xs font-medium text-slate-400">
                You haven't reported any civic issues yet.
              </p>
            ) : (
              <div className="space-y-3">
                {myReports.slice(0, 3).map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => handleIssueClick(iss)}
                    className="group flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-3 hover:bg-slate-50 hover:border-slate-150 cursor-pointer transition duration-200"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                        {iss.title}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        {iss.status}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Urgent Issues nearby */}
        <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm">
          <h4 className="font-display text-lg font-extrabold text-slate-950 mb-4 flex items-center gap-1.5">
            <AlertTriangle size={18} className="text-rose-500" />
            <span>Urgent Concerns ({nearbyHighPriority.length})</span>
          </h4>
          {nearbyHighPriority.length === 0 ? (
            <p className="text-xs font-medium text-slate-400">
              No urgent concerns reported in the community.
            </p>
          ) : (
            <div className="space-y-3">
              {nearbyHighPriority.slice(0, 3).map((iss) => (
                <div
                  key={iss.id}
                  onClick={() => handleIssueClick(iss)}
                  className="group flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-3 hover:bg-slate-50 hover:border-slate-150 cursor-pointer transition duration-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 group-hover:text-rose-600 transition">
                      {iss.title}
                    </p>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                      {iss.issueType}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-rose-500 transition" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refer Neighbors Card */}
        {user.role !== "resolver" && (
          <div className="rounded-3xl border border-blue-100 bg-blue-50/30 p-6 shadow-sm">
            <h4 className="font-display text-base font-extrabold text-blue-950 mb-2 flex items-center gap-1.5">
              <Gift size={18} className="text-blue-600 animate-pulse" />
              <span>Refer & Earn XP 🎁</span>
            </h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">
              Invite neighbors to Lokally! They get <span className="font-bold text-blue-600">5 XP</span> and you earn <span className="font-bold text-blue-600">10 XP</span> when they join.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/?ref=${user.email}`}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  const link = `${window.location.origin}/?ref=${encodeURIComponent(user?.email || "")}`;
                  navigator.clipboard.writeText(link);
                  setCopiedReferral(true);
                  showToast("Referral link copied to clipboard!", "success");
                  setTimeout(() => setCopiedReferral(false), 2000);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition ${
                  copiedReferral ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {copiedReferral ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Banner notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 shadow-lg border text-sm font-bold ${
              toastMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : toastMessage.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!user ? (
        /* GUEST VIEWS */
        authMode === "landing" ? (
          <LandingPage onNavigate={setAuthMode} />
        ) : authMode === "resolver-login" ? (
          <ResolverAuthView
            onBackToLanding={() => setAuthMode("landing")}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            authError={authError}
            authSuccess={authSuccess}
            onLoginSubmit={handleLoginSubmit}
            prefillResolver={(email, pass) => {
              setLoginForm({ email, password: pass });
            }}
          />
        ) : (
          <CitizenAuthView
            authTab={authMode === "register" ? "register" : "login"}
            setAuthTab={(tab) => setAuthMode(tab)}
            onBackToLanding={() => setAuthMode("landing")}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            agreeTerms={agreeTerms}
            setAgreeTerms={setAgreeTerms}
            authError={authError}
            authSuccess={authSuccess}
            onLoginSubmit={handleLoginSubmit}
            onRegisterSubmit={handleRegisterSubmit}
          />
        )
      ) : user.role === "resolver" ? (
        /* RESOLVER PORTAL */
        <ResolverDashboardView
          user={user}
          issues={issues}
          onLogout={handleLogout}
          onPostComment={handlePostCommentFromResolver}
          onStatusUpdate={handleStatusUpdateFromResolver}
          onEditProfile={openProfileModal}
        />
      ) : (
        <>
          {/* CITIZEN PORTAL */}
          {/* HEADER NAV */}
          <nav className="sticky top-0 z-30 border-b border-slate-150/80 bg-white px-6 py-4 sm:px-12">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-center md:grid-cols-3">
              {/* Left Logo */}
              <div className="flex items-center justify-start">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setActiveTab("dashboard")}>
                  <BrandLogo size="md" />
                </div>
              </div>

              {/* Center aligned tabs */}
              <div className="hidden items-center justify-center gap-1.5 md:flex">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition rounded-xl ${
                    activeTab === "dashboard"
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                  }`}
                >
                  <Activity size={14} />
                  <span>Feed</span>
                </button>
                <button
                  onClick={() => setActiveTab("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition rounded-xl ${
                    activeTab === "map"
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                  }`}
                >
                  <Map size={14} />
                  <span>Map View</span>
                </button>
                <button
                  onClick={() => setActiveTab("impact")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition rounded-xl ${
                    activeTab === "impact"
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                  }`}
                >
                  <TrendingUp size={14} />
                  <span>Impact</span>
                </button>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition rounded-xl ${
                    activeTab === "leaderboard"
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                  }`}
                >
                  <Trophy size={14} />
                  <span>Leaderboard</span>
                </button>
              </div>

              {/* Right: Notifications & Profile Dropdown */}
              <div className="flex items-center justify-end gap-5">
                {/* Real-time Notifications Bell & Dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                    className="relative text-slate-500 transition hover:text-blue-600 focus:outline-none cursor-pointer p-1.5"
                    title="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotificationsDropdown && (
                    <div className="absolute right-[-12px] sm:right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-slate-150 bg-white shadow-xl z-50 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                        <span className="font-display text-xs font-bold text-slate-800">Real-time Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllNotificationsAsRead}
                            className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 uppercase tracking-wider cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs font-medium text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => {
                            const isUnread = !readNotificationIds.includes(n.id);
                            return (
                              <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`px-4 py-3 cursor-pointer transition hover:bg-slate-50 flex items-start gap-2.5 ${
                                  isUnread ? "bg-blue-50/30" : ""
                                }`}
                              >
                                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${isUnread ? "bg-blue-600" : "bg-transparent"}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-extrabold text-slate-800 leading-tight">
                                    {n.title}
                                  </p>
                                  <p className="text-[10px] font-medium text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                    {n.message}
                                  </p>
                                  <span className="text-[9px] font-semibold text-slate-400 mt-1 block">
                                    {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Controls (Desktop & Mobile Adaptive) */}
                <div className="flex items-center gap-3">
                  {/* Clickable Profile Settings & Dropdown (Desktop/Tablet) */}
                  <div className="hidden sm:block relative">
                    <div
                      onClick={() => {
                        if (showProfileDropdown) {
                          setShowProfileDropdown(false);
                        } else {
                          setProfileForm({
                            name: user.name || "",
                            address: user.address || "",
                            phone: user.phone || "",
                            photoUrl: user.photoUrl || null
                          });
                          setShowProfileDropdown(true);
                        }
                      }}
                      className="flex items-center gap-3 cursor-pointer group hover:opacity-85 transition"
                      title="Click to View Profile"
                    >
                      <div className="flex flex-col text-right">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">{user.name}</span>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {user.role === "resolver" ? "Verified Resolver" : "Verified Citizen"}
                        </span>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-display text-sm font-bold text-blue-600 border border-blue-100 shadow-sm group-hover:border-blue-300 transition select-none overflow-hidden">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} className="h-full w-full object-cover" alt={user.name} referrerPolicy="no-referrer" />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                    </div>

                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-150 bg-white p-5 shadow-2xl z-50">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
                          <div>
                            <h4 className="font-display text-sm font-extrabold text-slate-900">My Profile Settings</h4>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              {user.role === "resolver" ? "Verified Resolver" : "Verified Citizen"}
                            </span>
                          </div>
                          <button
                            onClick={() => setShowProfileDropdown(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-pointer"
                            type="button"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-3">
                          {/* Profile Photo Upload/Remove */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              Profile Photo
                            </label>
                            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                              <div className="relative h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {profileForm.photoUrl ? (
                                  <img
                                    src={profileForm.photoUrl}
                                    className="h-full w-full object-cover"
                                    alt="Preview"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <span className="text-base font-bold text-slate-400">
                                    {getInitials(profileForm.name)}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="flex gap-1.5">
                                  <label className="cursor-pointer rounded-lg bg-white hover:bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700 transition">
                                    Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleProfilePhotoUpload}
                                    />
                                  </label>
                                  {profileForm.photoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setProfileForm({ ...profileForm, photoUrl: null })}
                                      className="rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2 py-1 text-[10px] font-bold text-rose-600 transition"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <span className="text-[8px] text-slate-400 font-medium">JPEG or PNG (not compulsory)</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              required
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none"
                              placeholder="Enter your full name"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Physical Address
                            </label>
                            <input
                              type="text"
                              value={profileForm.address}
                              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none"
                              placeholder="E.g., Sector 4, Block C, Apt 12"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none"
                              placeholder="E.g., +1 (555) 019-2834"
                            />
                          </div>

                          <div className="pt-3.5 flex items-center justify-between gap-3 border-t border-slate-100 mt-4">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-600 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                            >
                              <LogOut size={13} />
                              <span>Logout</span>
                            </button>

                            <button
                              type="submit"
                              disabled={profileSaving}
                              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              {profileSaving ? "Saving..." : "Save Settings"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Clickable Profile Button (Mobile Drawer Trigger) */}
                  <button
                    onClick={() => {
                      setProfileForm({
                        name: user.name || "",
                        address: user.address || "",
                        phone: user.phone || "",
                        photoUrl: user.photoUrl || null
                      });
                      setShowMobileProfileDrawer(true);
                    }}
                    className="block sm:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-display text-sm font-bold text-blue-600 border border-blue-100 shadow-sm select-none overflow-hidden cursor-pointer"
                    title="Open Profile Drawer"
                    type="button"
                  >
                    {user.photoUrl ? (
                      <img src={user.photoUrl} className="h-full w-full object-cover" alt={user.name} referrerPolicy="no-referrer" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* MOBILE SUB-NAVBAR */}
          <div className="flex border-b border-slate-150 bg-white p-2 md:hidden overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 min-w-[80px] text-center py-2 text-[11px] font-bold transition rounded-lg ${
                activeTab === "dashboard"
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`flex-1 min-w-[80px] text-center py-2 text-[11px] font-bold transition rounded-lg ${
                activeTab === "map"
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setActiveTab("impact")}
              className={`flex-1 min-w-[80px] text-center py-2 text-[11px] font-bold transition rounded-lg ${
                activeTab === "impact"
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Impact
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex-1 min-w-[80px] text-center py-2 text-[11px] font-bold transition rounded-lg ${
                activeTab === "leaderboard"
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Leaderboard
            </button>
          </div>

          {/* MAIN DASHBOARD */}
          <div className="mx-auto max-w-7xl px-6 py-12 sm:px-12">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* LEFT FEED COLUMN (8 Cols) - RENDERED AS A STUNNING UNIFIED WHITE PANEL */}
            <div className="lg:col-span-8 rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-3xl sm:border sm:border-slate-150 sm:bg-white sm:p-8 sm:shadow-sm space-y-6">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center pb-2">
                <div>
                  <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
                    Community Feed
                  </h2>
                  {user && user.role === "resolver" && (
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mt-3">
                      <button
                        onClick={() => setResolverFeedTab("open")}
                        className={`rounded-lg py-1.5 px-4 text-xs font-bold transition-all ${
                          resolverFeedTab === "open"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Open Issues
                      </button>
                      <button
                        onClick={() => setResolverFeedTab("resolved")}
                        className={`rounded-lg py-1.5 px-4 text-xs font-bold transition-all ${
                          resolverFeedTab === "resolved"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Resolved Issues
                      </button>
                    </div>
                  )}
                </div>

                {/* FILTERS PANEL */}
                <div className="flex flex-col gap-2 w-full sm:w-80 sm:items-stretch">
                  {/* Coverage Selector Toggle - Aligned to the right */}
                  <div className="flex justify-end">
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                      <button
                        disabled={!currentUserCoords}
                        onClick={() => setLocationFilterMode("nearby")}
                        className={`rounded-lg py-1 px-2.5 text-center text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          !currentUserCoords
                            ? "opacity-45 cursor-not-allowed text-slate-400"
                            : locationFilterMode === "nearby"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                        title={!currentUserCoords ? "Location access unavailable" : "Show issues within 3km"}
                      >
                        <Navigation size={11} className={locationFilterMode === "nearby" && currentUserCoords ? "text-blue-500 fill-blue-500/20" : ""} />
                        <span>Nearby</span>
                      </button>
                      <button
                        onClick={() => setLocationFilterMode("all")}
                        className={`rounded-lg py-1 px-2.5 text-center text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          locationFilterMode === "all" || !currentUserCoords
                            ? "bg-white text-slate-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>Show All</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-2 rounded-xl shadow-xs transition hover:border-slate-300 w-full">
                      <Filter size={13} className="text-slate-400 shrink-0" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="appearance-none bg-transparent text-[11px] font-extrabold text-slate-700 outline-none cursor-pointer pr-4 focus:outline-none flex-1 min-w-0"
                      >
                        <option value="All">All Categories</option>
                        <option value="Water">Water Supply</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Road">Road Condition</option>
                        <option value="Sanitation">Sanitation</option>
                        <option value="Pothole">Potholes</option>
                        <option value="Streetlight">Streetlights</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown size={11} className="text-slate-400 pointer-events-none shrink-0" />
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-2 rounded-xl shadow-xs transition hover:border-slate-300 w-full">
                      <AlertTriangle size={13} className="text-slate-400 shrink-0" />
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="appearance-none bg-transparent text-[11px] font-extrabold text-slate-700 outline-none cursor-pointer pr-4 focus:outline-none flex-1 min-w-0"
                      >
                        <option value="All">All Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <ChevronDown size={11} className="text-slate-400 pointer-events-none shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

                            {/* LIST FEED OF ISSUES IN GROUPS */}
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <span className="text-sm font-semibold text-slate-400">Loading civic operations...</span>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <Info className="text-slate-300 mb-4" size={48} />
                  <p className="font-display text-lg font-bold text-slate-600">No issues reported</p>
                  <p className="mt-1 text-sm text-slate-400 max-w-sm">
                    Be the community hero. Use the button in the bottom right corner to report a civic issue.
                  </p>
                </div>
              ) : (() => {
                  const activeIssues = filteredIssues.filter((iss) => iss.status !== "Resolved");
                  const resolvedIssues = filteredIssues.filter((iss) => iss.status === "Resolved");

                  return (
                    <div className="space-y-8 w-full">
                      {/* Active Sub-group */}
                      {activeIssues.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                              Active & Ongoing Reports ({activeIssues.length})
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {activeIssues.map((issue) => renderIssueCard(issue))}
                          </div>
                        </div>
                      )}

                      {/* Resolved Sub-group */}
                      {resolvedIssues.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                              Successfully Resolved ({resolvedIssues.length})
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {resolvedIssues.map((issue) => renderIssueCard(issue))}
                          </div>
                        </div>
                      )}

                      {activeIssues.length === 0 && resolvedIssues.length === 0 && (
                        <div className="px-4 py-8 text-center text-xs font-medium text-slate-400">
                          No matching issues found for the current filters.
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>

            {/* SIDEBAR COLUMNS (4 Cols) - Desktop only (hidden on mobile) */}
            <div className="hidden lg:block lg:col-span-4">
              {renderRightPanel()}
            </div>
          </div>
        )}

          {activeTab === "map" && (
            <MapView
              issues={issues}
              onSelectIssue={(issue) => {
                setActiveIssue(issue);
              }}
              currentUserCoords={currentUserCoords}
              locationFilterMode={locationFilterMode}
              setLocationFilterMode={setLocationFilterMode}
              currentUser={user}
            />
          )}

          {activeTab === "impact" && (
            <ImpactView issues={issues} />
          )}

          {activeTab === "leaderboard" && (
            <LeaderboardView currentUserRole={user?.role} />
          )}
        </div>

      {/* FLOATING ACTION ADD BUTTON */}
      {user && (
        <button
          onClick={() => setShowNewIssueModal(true)}
          className={`fixed bottom-8 right-8 z-40 flex h-14 items-center gap-2 rounded-full px-6 font-display text-sm font-bold text-white transition active:scale-95 ${
            isLowEnd
              ? "bg-blue-600 border border-blue-700 shadow-none"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700"
          }`}
        >
          <Plus size={20} />
          <span>Report Issue</span>
        </button>
      )}

      {/* MODAL: REPORT NEW ISSUE */}
      <AnimatePresence>
        {showNewIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto sm:p-8"
            >
              <button
                onClick={() => setShowNewIssueModal(false)}
                className="absolute top-6 right-6 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <h3 className="font-display text-2xl font-extrabold text-slate-900">
                  {isMobileDevice 
                    ? (selectedFiles.length === 0 && !mobileSkipPhoto ? "Step 1: Add Photo of Issue" : "Step 2: Enter Issue Details")
                    : "Report Civic Issue"}
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  {isMobileDevice
                    ? (selectedFiles.length === 0 && !mobileSkipPhoto
                      ? "Choose to take a live photo, select from your gallery, or skip to file the report directly."
                      : "Review your photo choice and fill in the fields below to complete your civic report.")
                    : "Provide details about the civic issue. You can optionally upload a photo as evidence."}
                </p>
              </div>

              {(selectedFiles.length === 0 && isMobileDevice && !mobileSkipPhoto) ? (
                <div className="flex flex-col py-6">
                  <div className="flex flex-col items-center justify-center text-center mb-8">
                    <div className="mb-4 rounded-full bg-blue-50 p-5 text-blue-600">
                      <Camera size={36} className="text-blue-600 animate-pulse" />
                    </div>
                    <h4 className="font-display text-base font-extrabold text-slate-950">
                      Evidence Photo Choice
                    </h4>
                    <p className="mt-2 max-w-sm text-xs font-semibold text-slate-400 leading-relaxed px-4">
                      Uploading an image helps municipal teams resolve issues faster. However, you can skip if there is a power issue, or if a photo is not required.
                    </p>
                  </div>

                  <div className="space-y-3 px-1">
                    {/* Option 1: Take Live Photo */}
                    <button
                      type="button"
                      onClick={() => {
                        cameraInputRef.current?.click();
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-150 bg-white hover:bg-slate-50 active:bg-slate-100 transition shadow-xs text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
                          <Camera size={20} />
                        </div>
                        <div>
                          <span className="block text-sm font-extrabold text-slate-900">Take Live Photo</span>
                          <span className="block text-[11px] font-medium text-slate-400 mt-0.5">Use your device's camera to snap a photo</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-450 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Option 2: Select from Gallery */}
                    <button
                      type="button"
                      onClick={() => {
                        galleryInputRef.current?.click();
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-150 bg-white hover:bg-slate-50 active:bg-slate-100 transition shadow-xs text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition">
                          <Image size={20} />
                        </div>
                        <div>
                          <span className="block text-sm font-extrabold text-slate-900">Choose from Gallery</span>
                          <span className="block text-[11px] font-medium text-slate-400 mt-0.5">Upload an existing photo from your library</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-450 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Option 3: Skip Adding Photo */}
                    <button
                      type="button"
                      onClick={() => setMobileSkipPhoto(true)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-dashed border-slate-250 bg-slate-50/50 hover:bg-slate-100/30 active:bg-slate-100/55 transition text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-200 text-slate-600 group-hover:bg-slate-300 transition">
                          <XCircle size={20} />
                        </div>
                        <div>
                          <span className="block text-sm font-extrabold text-slate-900">Skip Adding Photo</span>
                          <span className="block text-[11px] font-medium text-slate-400 mt-0.5">File this civic issue without any image attachment</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-455 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNewIssueModal(false)}
                    className="mt-8 text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                  >
                    Cancel Report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleIssueSubmit} className="space-y-6">
                  {/* Photo Preview / Upload Card */}
                  {selectedFiles.length > 0 ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={URL.createObjectURL(selectedFiles[0])}
                          alt="Captured issue"
                          className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm"
                        />
                        <div className="min-w-0">
                          <span className="block text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Photo Selected</span>
                          <span className="block text-xs text-slate-700 font-extrabold truncate">{selectedFiles[0].name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles([]);
                            if (isMobileDevice) {
                              setMobileSkipPhoto(false);
                            } else {
                              setTimeout(() => fileInputRef.current?.click(), 150);
                            }
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition cursor-pointer shadow-xs"
                        >
                          <Camera size={13} />
                          <span>{isMobileDevice ? "Retake / Change" : "Change Photo"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles([]);
                            if (isMobileDevice) {
                              setMobileSkipPhoto(false);
                            }
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition cursor-pointer"
                        >
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        if (isMobileDevice) {
                          setMobileSkipPhoto(false);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100/50 hover:border-blue-400 transition cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
                    >
                      <Camera size={24} className="text-slate-400" />
                      <div>
                        <span className="block text-xs font-bold text-slate-700">Add Photo / Evidence (Optional)</span>
                        <span className="block text-[10px] text-slate-400">
                          {isMobileDevice ? "Tap to select photo or use camera" : "Click to upload an image of the civic issue"}
                        </span>
                      </div>
                    </div>
                  )}


                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Issue Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newIssue.title}
                        onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                        placeholder="e.g. Broken water pipeline"
                        className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Category
                      </label>
                      <select
                        required
                        value={newIssue.issueType}
                        onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value })}
                        className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        <option value="Water">Water Supply</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Road">Road Condition</option>
                        <option value="Sanitation">Sanitation</option>
                        <option value="Waste">Waste & Garbage</option>
                        <option value="Pothole">Potholes</option>
                        <option value="Streetlight">Streetlights</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5 flex-wrap gap-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Description
                      </label>
                      <div className="flex items-center gap-2">
                        {speechSupported && (
                          <button
                            type="button"
                            onClick={handleVoiceInput}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              isListening
                                ? "bg-red-500 text-white animate-pulse"
                                : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                            }`}
                          >
                            <Mic size={12} className={isListening ? "animate-bounce" : ""} />
                            <span>{isListening ? "Listening..." : "Speak"}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAutoFillWithAI}
                          disabled={aiLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 rounded-lg transition"
                        >
                          <Sparkles size={12} className={aiLoading ? "animate-spin" : ""} />
                          <span>{aiLoading ? "Auto-filling..." : "Auto-fill with AI"}</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={newIssue.description}
                      onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                      placeholder="Provide a detailed description of the problem..."
                      className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white resize-none"
                    />
                    {aiError && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-1">{aiError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Priority Severity
                    </label>
                    <div className="flex gap-4">
                      {["Low", "Medium", "High"].map((p) => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priority"
                            value={p}
                            checked={newIssue.priority === p}
                            onChange={() => setNewIssue({ ...newIssue, priority: p })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-bold text-slate-600">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* INTERACTIVE MAP PICKER */}
                  <MapPicker
                    lat={newIssue.lat}
                    lng={newIssue.lng}
                    onChange={handleMapPickerChange}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Physical Address / Locality Reference
                    </label>
                    <input
                      type="text"
                      value={newIssue.address}
                      onChange={(e) => setNewIssue({ ...newIssue, address: e.target.value })}
                      placeholder="e.g. Sector 4, MG Road, near City Library"
                      className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      You can drop a pin on the map, write an address, or do both. At least one is required.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowNewIssueModal(false)}
                      className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={checkingDuplicate || isSubmitting}
                      className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {checkingDuplicate ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>AI Scanning Duplicates...</span>
                        </>
                      ) : isSubmitting ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Filing Report...</span>
                        </>
                      ) : (
                        <span>Report Issue</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* HIDDEN FILE INPUTS */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="file"
                ref={galleryInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DUPLICATE DETECTION WARNING */}
      <AnimatePresence>
        {showDuplicateModal && duplicateIssue && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-2xl max-h-[90vh] overflow-y-auto sm:p-8"
            >
              <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Possible Duplicate Detected
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Our civic AI detected an active report nearby describing the same issue.
                    </p>
                  </div>
                </div>

                {/* Existing Issue Card */}
                <div className="rounded-2xl border border-slate-150 bg-slate-50 p-4 mb-4">
                  <div className="flex gap-4">
                    {duplicateIssue.mediaUrl && (
                      <img
                        src={duplicateIssue.mediaUrl}
                        alt="Existing duplicate candidate"
                        className="h-20 w-20 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=600&auto=format&fit=crop";
                        }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                        Existing Active Report
                      </span>
                      {(duplicateIssue.confirmations || 0) > 0 && (
                        <span className="ml-1.5 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700 uppercase tracking-wide">
                          👥 {duplicateIssue.confirmations} {duplicateIssue.confirmations === 1 ? "corroborator" : "corroborators"}
                        </span>
                      )}
                      <h4 className="font-display text-sm font-extrabold text-slate-900 mt-1 truncate">
                        {duplicateIssue.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1 leading-relaxed">
                        {duplicateIssue.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gemini AI Reason */}
                {duplicateIssue.reason && (
                  <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-4 mb-6">
                    <span className="block text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mb-1">
                      AI Duplicate Analysis
                    </span>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">
                      "{duplicateIssue.reason}"
                    </p>
                  </div>
                )}

                {/* Buttons and Action Flow */}
                <div className="space-y-3">
                  {token ? (
                    <button
                      type="button"
                      disabled={corroborateSaving}
                      onClick={handleDuplicateCorroborate}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 font-display text-xs font-bold text-white shadow-lg shadow-amber-500/10 hover:bg-amber-600 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {corroborateSaving ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Corroborating...</span>
                        </>
                      ) : (
                        <span>✨ Yes, same problem (Corroborate issue)</span>
                      )}
                    </button>
                  ) : (
                    <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <p className="text-xs font-bold text-slate-500 mb-2">
                        You must be signed in to corroborate this report.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          showToast("Please use the Sign In or Register buttons in the header to authenticate first.", "info");
                        }}
                        className="text-xs font-extrabold text-blue-600 hover:underline"
                      >
                        How to sign in?
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleDuplicateCancel}
                    className="w-full rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-6 py-3.5 font-display text-xs font-bold text-slate-600 transition active:scale-95 cursor-pointer"
                  >
                    No, this is a different problem
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-[10px] font-bold text-slate-400">
                    {token 
                      ? "Corroborating increments the community verification signal, helping prioritize this issue faster without cluttering the city feed."
                      : "If you are sure this is a different issue, click the 'No' button above to submit normally."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DETAIL DIALOG WITH TIMELINE & COMMENTS */}
      <AnimatePresence>
        {activeIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto sm:p-8"
            >
              <div className="absolute top-6 right-6 flex items-center gap-1.5">
                <button
                  onClick={handleShareIssue}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                  title="Share Report"
                >
                  <Share2 size={14} />
                  <span className="hidden sm:inline">Share Report</span>
                </button>
                <button
                  onClick={handleCloseActiveIssue}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Title / Header */}
              <div className="mb-4">
                <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[10px] font-bold text-blue-600 tracking-wide uppercase">
                  {activeIssue.issueType}
                </span>
                <h3 className="font-display text-2xl font-extrabold tracking-tight text-slate-950 mt-2">
                  {activeIssue.title}
                </h3>
              </div>

              {/* Tabs Inside Modal */}
              <div className="flex gap-2 border-b border-slate-100 pb-3 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveIssueTab("details")}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                    activeIssueTab === "details"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  Full Details & Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIssueTab("comments")}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                    activeIssueTab === "comments"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  Comments ({activeIssue.commentsList?.length || 0})
                </button>
              </div>

              {activeIssueTab === "details" ? (
                <>
                  {/* Fields Grid */}
                  <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-xs font-bold text-slate-500 mb-6">
                    <div>
                      <span className="text-slate-400 block mb-0.5">PRIORITY</span>
                      <span className="text-slate-800 font-bold">{activeIssue.priority}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">STATUS</span>
                      <span className="text-slate-800 font-bold">{activeIssue.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">REPORTER</span>
                      <span className="text-slate-800 font-bold">{activeIssue.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">LOCATION</span>
                      <span className="text-slate-800 font-bold">{activeIssue.address || "N/A"}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Description
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-slate-600">
                      {activeIssue.description}
                    </p>
                  </div>

                  {/* Media gallery */}
                  {activeIssue.mediaUrls && activeIssue.mediaUrls.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Attached Evidence Media
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {activeIssue.mediaUrls.map((url, index) => {
                          const isVid = /\.(mp4|mov|webm|avi)$/i.test(url);
                          return (
                            <div key={index} className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                              {isVid ? (
                                <video src={url} controls className="w-full object-cover max-h-48" />
                              ) : (
                                <img
                                  src={url}
                                  alt="Attached Evidence"
                                  className="w-full object-cover max-h-48"
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

                  {/* Timeline status track */}
                  <div className="mb-6 border-t border-slate-100 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                      Status History Timeline
                    </h4>
                    <div className="relative pl-6 border-l border-slate-200 space-y-5">
                      {activeIssue.statusHistory && activeIssue.statusHistory.length > 0 ? (
                        activeIssue.statusHistory.map((history, i) => (
                          <div key={i} className="relative">
                            <div className="absolute -left-[27.5px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-blue-500"></div>
                            <p className="text-xs font-bold text-slate-800">
                              Status changed to <span className="text-blue-600">{history.status}</span>
                            </p>
                            <span className="text-[10px] font-medium text-slate-400">
                              {new Date(history.timestamp).toLocaleString()}
                            </span>
                            {history.note && (
                              <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
                                <CornerDownRight size={12} className="text-slate-300 mt-0.5" />
                                <span>{history.note}</span>
                              </div>
                            )}
                            {/* Status Proof Media */}
                            {history.mediaUrls && history.mediaUrls.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {history.mediaUrls.map((url, idx) => {
                                  const isVid = /\.(mp4|mov|webm|avi)$/i.test(url);
                                  return (
                                    <div key={idx} className="h-16 w-24 overflow-hidden rounded-xl border border-slate-200 shadow-sm shrink-0">
                                      {isVid ? (
                                        <video src={url} className="h-full w-full object-cover" controls />
                                      ) : (
                                        <img
                                          src={url}
                                          alt="Proof"
                                          className="h-full w-full object-cover cursor-pointer hover:opacity-90"
                                          onClick={() => window.open(url, "_blank")}
                                          onError={(e) => {
                                            e.currentTarget.src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=600&auto=format&fit=crop";
                                          }}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="relative">
                          <div className="absolute -left-[27.5px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-blue-500"></div>
                          <p className="text-xs font-bold text-slate-800">Reported</p>
                          <span className="text-[10px] font-medium text-slate-400">
                            {new Date(activeIssue.createdAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RESOLVER STATUS TRANSITION FORM (Shown to Resolvers) */}
                  {user.role === "resolver" && (
                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Progress Civic Action
                      </h4>

                      <form onSubmit={handleStatusUpdate} className="space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <select
                            value={resolverStatus}
                            onChange={(e) => setResolverStatus(e.target.value)}
                            className="rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                          >
                            <option value="Reported">Mark Reported</option>
                            <option value="Verified">Mark Verified</option>
                            <option value="In Progress">Mark In Progress</option>
                            <option value="Resolved">Mark Resolved</option>
                          </select>

                          <input
                            type="text"
                            required
                            value={resolverNote}
                            onChange={(e) => setResolverNote(e.target.value)}
                            placeholder="Provide status notes or action notes..."
                            className="flex-1 rounded-xl border border-slate-250 bg-slate-50/50 px-4 py-2 text-xs font-medium outline-none"
                          />
                        </div>

                        {/* Proof file upload row */}
                        {resolverStatus === "Resolved" && (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Upload Resolution Proof (Images/Videos)
                            </label>
                            <input
                              type="file"
                              multiple
                              accept="image/*,video/*"
                              onChange={(e) => setResolverProofFiles(e.target.files)}
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {resolverProofFiles && resolverProofFiles.length > 0 && (
                              <p className="text-[10px] font-semibold text-emerald-600 mt-1">
                                ✓ {resolverProofFiles.length} file(s) selected
                              </p>
                            )}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                          Update Civic Action Status
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                /* Comments Section Only */
                <div className="space-y-4">
                  <div className="max-h-[50vh] overflow-y-auto space-y-3.5 pr-2 mb-4">
                    {(!activeIssue.commentsList || activeIssue.commentsList.length === 0) ? (
                      <p className="text-xs font-medium text-slate-400 italic py-4 text-center">
                        No comments yet. Be the first to start the conversation!
                      </p>
                    ) : (
                      activeIssue.commentsList.map((comment, index) => (
                        <div key={index} className="rounded-2xl border border-slate-50 bg-slate-50/50 p-3.5 text-xs">
                          <div className="mb-1.5 flex items-center justify-between flex-wrap gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">{comment.username}</span>
                              {comment.role === "resolver" ? (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider">
                                  Verified Resolver
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  Citizen
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <p className="font-medium text-slate-600">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Post comment form */}
                  <form onSubmit={handlePostComment} className="flex gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      required
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                    >
                      Post
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Legacy profile modal replaced by dropdown */}
        </>
      )}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-950/60"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-slate-100 text-center z-10"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                <LogOut size={20} className="ml-0.5" />
              </div>
              <h3 className="font-display text-lg font-extrabold text-slate-900 tracking-tight">
                Confirm Logout
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                Are you sure you want to log out of your session? You can sign back in at any time.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={performLogout}
                  className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-sm shadow-rose-600/10"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-slate-950/55"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h4 className="font-display text-base font-extrabold text-slate-900">My Profile Settings</h4>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {user?.role === "resolver" ? "Verified Service Resolver" : "Verified Civic Citizen"}
                  </span>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-pointer"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Profile Photo */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <div className="relative h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {profileForm.photoUrl ? (
                        <img
                          src={profileForm.photoUrl}
                          className="h-full w-full object-cover"
                          alt="Preview"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-base font-bold text-slate-400">
                          {getInitials(profileForm.name)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1.5">
                        <label className="cursor-pointer rounded-lg bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700 transition">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfilePhotoUpload}
                          />
                        </label>
                        {profileForm.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, photoUrl: null })}
                            className="rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-600 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span className="text-[8px] text-slate-400 font-semibold">JPEG or PNG (not compulsory)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none"
                    placeholder="E.g., Sector 4, Block C, Apt 12"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none"
                    placeholder="E.g., +1 (555) 019-2834"
                  />
                </div>

                <div className="pt-3.5 flex items-center justify-between gap-3 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileModal(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-600 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Logout</span>
                  </button>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {profileSaving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE DRAWER: PROFILE, YOUR REPORTS & URGENT CONCERNS */}
      <AnimatePresence>
        {showMobileProfileDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileProfileDrawer(false)}
              className="absolute inset-0 bg-slate-900/75"
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
                    <h3 className="font-display text-lg font-extrabold text-slate-950">My Profile & Reports</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Quick overview
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

      {/* Low-End Device Status Indicator (Debug only) */}
      {isLowEnd && (
        <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-md border border-amber-400">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span>Low-End GPU Mode Active</span>
        </div>
      )}
    </div>
  );
}
