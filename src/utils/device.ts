import { useState, useEffect } from "react";

/**
 * Detects if the current device is a low-end or older Android device
 * experiencing rendering/GPU bugs with heavy shadows, gradients, and transforms.
 */
export function isLowEndDevice(): boolean {
  if (typeof window === "undefined" || !window.navigator) return false;

  // User-override query parameter for easy testing (?lowend=true)
  if (window.location.search.includes("lowend=true")) {
    return true;
  }
  if (window.location.search.includes("lowend=false")) {
    return false;
  }

  // Sniff Android
  const userAgent = navigator.userAgent || "";
  const isAndroid = /Android/i.test(userAgent);
  if (!isAndroid) return false; // Only target Android per instructions

  // 1. Core count check (hardware concurrency)
  const cores = navigator.hardwareConcurrency || 8;

  // 2. RAM check in GB (supported on Android Chrome/WebView)
  const ram = (navigator as any).deviceMemory || 8;

  // 3. Unmask WebGL GPU renderer string
  let gpuRenderer = "";
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
      }
    }
  } catch (e) {
    // Context creation or extension not supported
  }

  // Older or low-tier Mali & Adreno GPUs known to glitch on old/mid-range Android webviews:
  // - Mali-T series, Mali-G31, Mali-G51, Mali-G52, Mali-G57, Mali-G71, Mali-G72, Mali-G76 (found on Realme 8, etc.)
  // - Adreno (TM) 3xx, 4xx, 5xx, or 61x (like Adreno 610/612/616/618)
  const isOlderGpu = /Mali-T|Mali-G31|Mali-G51|Mali-G52|Mali-G71|Mali-G72|Mali-G76|Adreno\s*\(TM\)\s*[345]|Adreno\s*\(TM\)\s*61/i.test(gpuRenderer);

  // 4. Android OS version check (older versions like Android 11 or below are more likely to have buggy WebView GPU drivers)
  const matchAndroidVer = userAgent.match(/Android\s+([0-9\.]+)/i);
  const androidVersion = matchAndroidVer ? parseFloat(matchAndroidVer[1]) : 13;
  const isOlderAndroidVer = androidVersion <= 11;

  // Combine multiple capability signals to prevent false negatives/positives:
  // - Flag if the GPU itself is a known vulnerable/older chip (like Mali-G76, G72, Adreno 61x/5xx, etc.) on any Android device
  // - Very low specs: <= 4GB RAM or <= 4 CPU Cores.
  // - Medium-low specs + older OS: <= 6GB RAM with older OS version.
  const isLowEnd = (
    isOlderGpu ||
    ram <= 4 ||
    cores <= 4 ||
    (isOlderAndroidVer && ram <= 6)
  );

  console.log("[DeviceDetect] Sniffing capabilities:", {
    isAndroid,
    cores,
    ram,
    gpuRenderer,
    isOlderGpu,
    androidVersion,
    isOlderAndroidVer,
    isLowEnd,
    userAgent
  });

  return isLowEnd;
}

/**
 * React hook to reactively use the low-end device rendering path.
 */
export function useIsLowEnd(): boolean {
  const [isLowEnd, setIsLowEnd] = useState<boolean>(false);

  useEffect(() => {
    setIsLowEnd(isLowEndDevice());
  }, []);

  return isLowEnd;
}
