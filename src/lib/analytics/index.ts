/**
 * Analytics Module - Central Export
 * Exports all analytics infrastructure for use throughout the app
 */

// Core modules
export { analytics, initializeAnalytics, setAnalyticsDebugMode, getAnalyticsSharedParams } from "./analytics";
export { useAnalytics } from "./useAnalytics";

// Types
export type {
  EventName,
  EventParams,
  SharedParams,
  AnalyticsEvent,
  UniversalParams,
  ContextParams,
  AttributionParams,
  PlanParams,
  SearchParams,
  DeviceParams,
  ContactParams,
  EcommerceParams,
  EngagementParams,
  ConversionEvent,
  ProviderConfig,
  AnalyticsConfig,
} from "./types";

// Constants
export {
  EVENT_NAMES,
  CONVERSION_EVENTS,
  CRITICAL_EVENTS,
  HIGH_PRIORITY_EVENTS,
  SECTIONS,
  ELEMENT_TYPES,
  SEARCH_TYPES,
  CONTACT_METHODS,
  CONTACT_LOCATIONS,
  SOCIAL_PLATFORMS,
  EXCEPTION_TYPES,
} from "./constants";

// Helpers (useful for advanced usage)
export {
  getSessionId,
  generateUUID,
  getCookie,
  setCookie,
  getDeviceCategory,
  isPIIDetected,
  sanitizeValue,
  sanitizeParams,
  validateEventParams,
  getSharedParams,
  mergeParams,
  getGA4ClientId,
  isConversionEvent,
  hasAnalyticsConsent,
} from "./helpers";

// Providers (advanced usage only - normally don't access directly)
export { ga4Provider } from "./providers/ga4";
export { metaProvider, markMetaPixelReady } from "./providers/meta";

// Event builders (optional convenience functions)
export {
  createBaseEvent,
  createPlanEvent,
  createBeginCheckoutEvent,
  createPurchaseEvent,
  createSearchEvent,
  createContactEvent,
  createDeviceCompatibilityEvent,
  createFAQEvent,
  createNavigationEvent,
  createCTAClickEvent,
  createErrorEvent,
  createScrollEvent,
  createListViewEvent,
  createPaymentInfoEvent,
} from "./events";
export type {
  BaseEventParams,
  PlanEventParams,
  BeginCheckoutEventParams,
  PurchaseEventParams,
  SearchEventParams,
  ContactEventParams,
  DeviceCompatibilityEventParams,
  FAQEventParams,
  NavigationEventParams,
  CTAClickEventParams,
  ErrorEventParams,
  ScrollEventParams,
  ListViewEventParams,
  PaymentInfoEventParams,
} from "./events";

// Re-export helpers for common GA4 operations
export { getGA4ClientId } from "./helpers";
