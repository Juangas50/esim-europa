/**
 * Analytics Constants
 * Event names, default values, and configurations from TRACKING_PLAN.md
 */

import type { ConversionEvent, EventName } from "./types";

// ── Event Name Constants (Prevent Typos) ─────────────────────────────────────
export const EVENT_NAMES = {
  // Navigation & Page
  PAGE_VIEW: "page_view",
  SCROLL: "scroll",
  // Item List & View
  VIEW_ITEM_LIST: "view_item_list",
  VIEW_ITEM: "view_item",
  SELECT_ITEM: "select_item",
  SELECT_PROMOTION: "select_promotion",
  // Search
  SEARCH: "search",
  VIEW_SEARCH_RESULTS: "view_search_results",
  // Cart & Checkout
  ADD_TO_CART: "add_to_cart",
  VIEW_CART: "view_cart",
  BEGIN_CHECKOUT: "begin_checkout",
  ADD_PAYMENT_INFO: "add_payment_info",
  SET_CHECKOUT_OPTION: "set_checkout_option",
  // Purchase (CRITICAL)
  PURCHASE: "purchase",
  // Contact
  CONTACT_US: "contact_us",
  // Errors
  EXCEPTION: "exception",
} as const satisfies Record<string, EventName>;

// ── Conversion Events (CRITICAL - Never Duplicate) ──────────────────────────
export const CONVERSION_EVENTS: ConversionEvent[] = [
  "purchase", // MÁXIMA PRIORIDAD
  "begin_checkout", // CRÍTICA
  "add_payment_info", // CRÍTICA
  "contact_us", // Opcional pero importante
];

// ── Critical Events (Level 1) ────────────────────────────────────────────────
export const CRITICAL_EVENTS = {
  PURCHASE: "purchase",
  BEGIN_CHECKOUT: "begin_checkout",
  PAGE_VIEW: "page_view",
} as const;

// ── High Priority Events (Level 2) ───────────────────────────────────────────
export const HIGH_PRIORITY_EVENTS = {
  ADD_PAYMENT_INFO: "add_payment_info",
  VIEW_ITEM_LIST: "view_item_list",
  VIEW_ITEM: "view_item",
  CONTACT_US: "contact_us",
} as const;

// ── Provider Configs ─────────────────────────────────────────────────────────
export const PROVIDER_CONFIG = {
  GA4: {
    name: "ga4" as const,
    enabled: true,
    measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
  },
  META: {
    name: "meta" as const,
    enabled: !!process.env.NEXT_PUBLIC_META_PIXEL_ID,
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  },
};

// ── Default Parameters ───────────────────────────────────────────────────────
export const DEFAULT_CURRENCY = "USD";
export const DEVICE_CATEGORIES = ["desktop", "tablet", "mobile"] as const;

// ── Section Names (From Audit) ───────────────────────────────────────────────
export const SECTIONS = {
  NAVBAR: "navbar",
  HERO: "hero",
  PLANS: "plans",
  HOW_IT_WORKS: "how_it_works",
  DEFINITION: "definition",
  BENEFITS: "benefits",
  TESTIMONIALS: "testimonials",
  COMPATIBILITY: "compatibility",
  FAQ: "faq",
  PAYMENT_METHODS: "payment_methods",
  TRUST_BADGES: "trust_badges",
  GUARANTEES: "guarantees",
  CONTACT: "contact",
  SOCIAL_LINKS: "social_links",
  FOOTER: "footer",
  CHECKOUT: "checkout",
} as const;

// ── Element Types ────────────────────────────────────────────────────────────
export const ELEMENT_TYPES = {
  BUTTON: "button",
  LINK: "link",
  TAB: "tab",
  ACCORDION: "accordion",
  CARD: "card",
  INPUT: "input",
  SELECT: "select",
  RADIO: "radio",
  CHECKBOX: "checkbox",
} as const;

// ── Search Types ────────────────────────────────────────────────────────────
export const SEARCH_TYPES = {
  COUNTRY: "country",
  DEVICE: "device",
  FAQ: "faq",
} as const;

// ── Contact Methods ─────────────────────────────────────────────────────────
export const CONTACT_METHODS = {
  WHATSAPP: "whatsapp",
  EMAIL: "email",
  PHONE: "phone",
  CONTACT_FORM: "contact_form",
} as const;

// ── Contact Locations ───────────────────────────────────────────────────────
export const CONTACT_LOCATIONS = {
  CONTACT_SECTION: "contact_section",
  DEVICE_FINDER: "device_finder",
  FAQ: "faq",
  HERO: "hero",
  FOOTER: "footer",
  CHECKOUT: "checkout",
} as const;

// ── Social Platforms ────────────────────────────────────────────────────────
export const SOCIAL_PLATFORMS = {
  INSTAGRAM: "instagram",
  LINKEDIN: "linkedin",
  TWITTER: "twitter",
  TIKTOK: "tiktok",
} as const;

// ── Compatibility Source ────────────────────────────────────────────────────
export const COMPATIBILITY_SOURCES = {
  MANUAL_SEARCH: "manual_search",
  AUTO_DETECTION: "auto_detection",
} as const;

// ── Checkout Options ────────────────────────────────────────────────────────
export const CHECKOUT_OPTIONS = {
  COUNTRY: "country",
  LANGUAGE: "language",
  PAYMENT_METHOD: "payment_method",
  ACTIVATION: "activation",
  QUANTITY: "quantity",
} as const;

// ── GA4 Event Mapping (Standard Events) ──────────────────────────────────────
export const GA4_EVENT_MAPPING: Record<EventName, string> = {
  page_view: "page_view",
  scroll: "scroll", // Custom
  view_item_list: "view_item_list",
  view_item: "view_item",
  select_item: "select_item",
  select_promotion: "select_promotion",
  search: "search",
  view_search_results: "view_search_results", // Custom
  add_to_cart: "add_to_cart",
  view_cart: "view_cart",
  begin_checkout: "begin_checkout",
  add_payment_info: "add_payment_info",
  set_checkout_option: "set_checkout_option", // Custom
  purchase: "purchase",
  contact_us: "contact_us", // Custom
  exception: "exception",
};

// ── Meta Pixel Event Mapping ────────────────────────────────────────────────
export const META_EVENT_MAPPING: Partial<Record<EventName, string>> = {
  page_view: "PageView",
  view_item_list: "ViewContentList",
  view_item: "ViewContent",
  search: "Search",
  view_search_results: "Search",
  add_to_cart: "AddToCart",
  view_cart: "ViewContent",
  begin_checkout: "InitiateCheckout",
  add_payment_info: "AddPaymentInfo",
  purchase: "Purchase",
  contact_us: "Contact",
  // scroll, select_item, select_promotion, set_checkout_option, exception → Not in Meta
};

// ── Cookie Names ────────────────────────────────────────────────────────────
export const COOKIE_NAMES = {
  CONSENT: "ruta34_cookie_consent",
  SESSION_ID: "ruta34_session_id",
  USER_ID: "ruta34_user_id",
  GA4_CLIENT_ID: "_ga",
};

// ── Error Types (For Exception Events) ──────────────────────────────────────
export const EXCEPTION_TYPES = {
  VALIDATION_ERROR: "validation_error",
  PAYMENT_ERROR: "payment_error",
  NETWORK_ERROR: "network_error",
  TIMEOUT_ERROR: "timeout_error",
} as const;
