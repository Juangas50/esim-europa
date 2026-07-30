/**
 * Central Analytics Module
 * Single entry point for all event tracking (analytics.track())
 * Coordinates GA4 and Meta providers with automatic shared parameter injection
 */

import type { EventName, EventParams, SharedParams, AnalyticsEvent } from "./types";
import {
  validateEventParams,
  getSharedParams,
  mergeParams,
  getSessionId,
  getCurrentTimestamp,
  hasAnalyticsConsent,
  isConversionEvent,
} from "./helpers";
import { ga4Provider } from "./providers/ga4";
import { metaProvider } from "./providers/meta";
import { PROVIDER_CONFIG } from "./constants";

// ── Configuration ────────────────────────────────────────────────────────────
let globalSharedParams: Partial<SharedParams> = {};
let debugMode: boolean = process.env.NODE_ENV === "development";

/**
 * Initialize analytics with shared parameters
 * Should be called once on app startup (e.g., in layout.tsx)
 */
export function initializeAnalytics(params: Partial<SharedParams>): void {
  globalSharedParams = {
    ...getSharedParams(),
    ...params,
    session_id: getSessionId(), // Always ensure session ID
  };

  if (debugMode) {
    console.log("[Analytics] Initialized with shared params:", globalSharedParams);
  }
}

/**
 * Enable debug mode
 */
export function setAnalyticsDebugMode(enabled: boolean): void {
  debugMode = enabled;
  ga4Provider.setDebug(enabled);
  metaProvider.setDebug(enabled);
}

/**
 * Get current shared parameters
 */
export function getAnalyticsSharedParams(): Partial<SharedParams> {
  return { ...globalSharedParams };
}

/**
 * MAIN API: Track an analytics event
 * This is the ONLY way components should track events
 *
 * @param eventName - Name of the event (from EVENT_NAMES constants)
 * @param params - Event parameters (page_path, page_title required)
 *
 * @example
 * ```ts
 * analytics.track('begin_checkout', {
 *   page_path: '/es',
 *   page_title: 'RUTA34 Home',
 *   language: 'es',
 *   device_category: 'mobile',
 *   section: 'plans',
 *   plan_id: 'plan-123',
 *   plan_name: 'Europa Plus',
 *   price_usd: 29.99,
 * });
 * ```
 */
export function track(eventName: EventName, params: EventParams): void {
  // SSR safety
  if (typeof window === "undefined") {
    return;
  }

  // Merge with global shared parameters
  const mergedParams = mergeParams(params, globalSharedParams as Partial<EventParams>);

  // Ensure timestamp is always present
  if (!mergedParams.timestamp) {
    mergedParams.timestamp = getCurrentTimestamp();
  }

  // Validate required parameters
  if (!validateEventParams(mergedParams)) {
    console.error("[Analytics] Invalid event parameters:", eventName, mergedParams);
    return;
  }

  // Log in debug mode
  if (debugMode) {
    console.log("[Analytics] Track event:", eventName, mergedParams);
  }

  // Send to GA4 (always enabled unless explicitly disabled)
  if (PROVIDER_CONFIG.GA4.enabled) {
    ga4Provider.track(eventName, mergedParams);
  }

  // Send to Meta Pixel (only if enabled and consent given)
  if (PROVIDER_CONFIG.META.enabled && hasAnalyticsConsent()) {
    metaProvider.track(eventName, mergedParams);
  }

  // Future providers can be added here without modifying components
  // Example: if (PROVIDER_CONFIG.SEGMENT?.enabled) segmentProvider.track(...)
}

/**
 * Track page view
 * Convenience function for page_view events
 */
export function trackPageView(pageParams: Partial<EventParams>): void {
  track("page_view", {
    page_path: pageParams.page_path || "/",
    page_title: pageParams.page_title || "Page",
    language: pageParams.language || "es",
    device_category: pageParams.device_category || "desktop",
    ...pageParams,
  });
}

/**
 * Track a click on a CTA button
 */
export function trackCTAClick(section: string, elementText: string, params?: Partial<EventParams>): void {
  track("select_promotion", {
    page_path: params?.page_path || "/",
    page_title: params?.page_title || "Page",
    language: params?.language || "es",
    device_category: params?.device_category || "desktop",
    section,
    element_text: elementText,
    ...params,
  });
}

/**
 * Track a conversion event (purchase, begin_checkout, etc)
 * These events should NEVER be duplicated
 */
export function trackConversion(eventName: EventName, params: EventParams): void {
  if (!isConversionEvent(eventName)) {
    console.warn(`[Analytics] ${eventName} is not a conversion event`);
  }

  track(eventName, {
    ...params,
  });
}

/**
 * Track a search/filter action
 */
export function trackSearch(
  searchType: string,
  query: string,
  resultsCount: number,
  params?: Partial<EventParams>
): void {
  track("search", {
    page_path: params?.page_path || "/",
    page_title: params?.page_title || "Page",
    language: params?.language || "es",
    device_category: params?.device_category || "desktop",
    search_type: searchType,
    search_query: query,
    search_results_count: resultsCount,
    ...params,
  });
}

/**
 * Track a contact action (WhatsApp, Email, Phone)
 */
export function trackContact(
  method: string,
  location: string,
  params?: Partial<EventParams>
): void {
  track("contact_us", {
    page_path: params?.page_path || "/",
    page_title: params?.page_title || "Page",
    language: params?.language || "es",
    device_category: params?.device_category || "desktop",
    contact_method: method,
    contact_location: location,
    ...params,
  });
}

/**
 * Track an error/exception
 */
export function trackException(
  type: string,
  description: string,
  isFatal: boolean = false,
  params?: Partial<EventParams>
): void {
  track("exception", {
    page_path: params?.page_path || "/",
    page_title: params?.page_title || "Page",
    language: params?.language || "es",
    device_category: params?.device_category || "desktop",
    exception_type: type,
    exception_description: description,
    is_fatal: isFatal,
    ...params,
  });
}

/**
 * Export analytics object with all methods
 * This is the primary API for components
 */
export const analytics = {
  track,
  trackPageView,
  trackCTAClick,
  trackConversion,
  trackSearch,
  trackContact,
  trackException,
  setDebugMode: setAnalyticsDebugMode,
  initialize: initializeAnalytics,
};

export default analytics;
