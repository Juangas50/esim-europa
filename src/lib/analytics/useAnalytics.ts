/**
 * useAnalytics Hook
 * React hook for components to access analytics tracking
 * Ensures analytics is initialized and provides convenient methods
 */

"use client";

import { useCallback } from "react";
import { analytics } from "./analytics";
import { getDeviceCategory } from "./helpers";
import type { EventName, EventParams } from "./types";

export interface UseAnalyticsOptions {
  autoPagePath?: boolean;
  autoLanguage?: boolean;
  autoDeviceCategory?: boolean;
}

/**
 * React hook for analytics tracking
 *
 * @example
 * ```tsx
 * const { track } = useAnalytics();
 *
 * const handlePlanClick = (plan) => {
 *   track('begin_checkout', {
 *     plan_id: plan.id,
 *     plan_name: plan.name,
 *     price_usd: plan.price,
 *   });
 * };
 * ```
 */
export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { autoPagePath = true, autoLanguage = true, autoDeviceCategory = true } = options;

  /**
   * Get automatic parameters from page context
   */
  const getAutoParams = useCallback(() => {
    const params: Partial<EventParams> = {};

    if (autoPagePath && typeof window !== "undefined") {
      params.page_path = window.location.pathname;
    }

    if (autoLanguage && typeof window !== "undefined") {
      const htmlLang = document.documentElement.lang || "es";
      params.language = htmlLang;
    }

    if (autoDeviceCategory) {
      params.device_category = getDeviceCategory();
    }

    return params;
  }, [autoPagePath, autoLanguage, autoDeviceCategory]);

  /**
   * Track an event.
   * page_path, language and device_category are auto-filled by getAutoParams()
   * above — omit them here and pass explicit values only to override.
   */
  const track = useCallback(
    (
      eventName: EventName,
      params: Omit<EventParams, "page_path" | "language" | "device_category"> &
        Partial<Pick<EventParams, "page_path" | "language" | "device_category">>
    ) => {
      const autoParams = getAutoParams();
      analytics.track(eventName, {
        ...autoParams,
        ...params,
      } as EventParams);
    },
    [getAutoParams]
  );

  /**
   * Track a page view
   */
  const trackPageView = useCallback(
    (title?: string) => {
      const autoParams = getAutoParams();
      analytics.trackPageView({
        page_title: title || document.title,
        ...autoParams,
      });
    },
    [getAutoParams]
  );

  /**
   * Track a CTA click
   */
  const trackCTAClick = useCallback(
    (section: string, elementText: string) => {
      const autoParams = getAutoParams();
      analytics.trackCTAClick(section, elementText, autoParams);
    },
    [getAutoParams]
  );

  /**
   * Track plan selection (begin_checkout)
   */
  const trackPlanSelected = useCallback(
    (planId: string, planName: string, price: number) => {
      const autoParams = getAutoParams();
      track("begin_checkout", {
        ...autoParams,
        plan_id: planId,
        plan_name: planName,
        price_usd: price,
        currency: "USD",
        value: price,
      } as EventParams);
    },
    [track, getAutoParams]
  );

  /**
   * Track search action
   */
  const trackSearch = useCallback(
    (searchType: string, query: string, resultsCount: number) => {
      const autoParams = getAutoParams();
      analytics.trackSearch(searchType, query, resultsCount, autoParams);
    },
    [getAutoParams]
  );

  /**
   * Track contact action
   */
  const trackContact = useCallback(
    (method: string, location: string) => {
      const autoParams = getAutoParams();
      analytics.trackContact(method, location, autoParams);
    },
    [getAutoParams]
  );

  /**
   * Track exception/error
   */
  const trackException = useCallback(
    (type: string, description: string, isFatal?: boolean) => {
      const autoParams = getAutoParams();
      analytics.trackException(type, description, isFatal, autoParams);
    },
    [getAutoParams]
  );

  return {
    // Core method
    track,

    // Convenience methods
    trackPageView,
    trackCTAClick,
    trackPlanSelected,
    trackSearch,
    trackContact,
    trackException,
  };
}

/**
 * Export analytics singleton for use outside of React components
 */
export { analytics };
