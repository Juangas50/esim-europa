/**
 * GA4 Provider
 * Sends events to Google Analytics 4 via GTM dataLayer
 * Never uses gtag() directly - all events go through dataLayer.push()
 */

import type { EventName, EventParams } from "../types";
import { GA4_EVENT_MAPPING, CONVERSION_EVENTS } from "../constants";
import { getGA4ClientId, isConversionEvent } from "../helpers";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export class GA4Provider {
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  private push(payload: Record<string, unknown>): void {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];

    if (this.debug) {
      console.log("[GA4] Event pushed:", payload);
    }

    window.dataLayer.push(payload);
  }

  /**
   * Send event to GA4 via dataLayer
   * Maps our event names to GA4 standard names
   */
  track(eventName: EventName, params: EventParams): void {
    // Map our event name to GA4 standard
    const ga4EventName = GA4_EVENT_MAPPING[eventName];

    if (!ga4EventName) {
      if (this.debug) {
        console.warn(`[GA4] No mapping for event: ${eventName}`);
      }
      return;
    }

    const payload: Record<string, unknown> = {
      event: ga4EventName,
      page_path: params.page_path,
      page_title: params.page_title,
      language: params.language,
      device_category: params.device_category,
    };

    // Add optional universal params
    if (params.timestamp) {
      payload.timestamp = params.timestamp;
    }

    // Add context params
    if (params.section) {
      payload.section = params.section;
    }
    if (params.element_id) {
      payload.element_id = params.element_id;
    }
    if (params.element_text) {
      payload.element_text = params.element_text;
    }
    if (params.element_type) {
      payload.element_type = params.element_type;
    }
    if (params.position_index !== undefined) {
      payload.position_index = params.position_index;
    }

    // Add attribution params
    if (params.source) {
      payload.source = params.source;
    }
    if (params.medium) {
      payload.medium = params.medium;
    }
    if (params.campaign) {
      payload.campaign = params.campaign;
    }
    if (params.content) {
      payload.content = params.content;
    }
    if (params.session_id) {
      payload.session_id = params.session_id;
    }
    if (params.user_id) {
      payload.user_id = params.user_id;
    }

    // Add plan params
    if (params.plan_id) {
      payload.plan_id = params.plan_id;
    }
    if (params.plan_name) {
      payload.plan_name = params.plan_name;
    }
    if (params.plan_slug) {
      payload.plan_slug = params.plan_slug;
    }
    if (params.data_gb !== undefined) {
      payload.data_gb = params.data_gb;
    }
    if (params.eu_data_gb !== undefined) {
      payload.eu_data_gb = params.eu_data_gb;
    }
    if (params.price_usd !== undefined) {
      payload.price_usd = params.price_usd;
    }
    if (params.price_original_usd !== undefined) {
      payload.price_original_usd = params.price_original_usd;
    }
    if (params.currency) {
      payload.currency = params.currency;
    }
    if (params.is_popular !== undefined) {
      payload.is_popular = params.is_popular;
    }
    if (params.plan_position !== undefined) {
      payload.plan_position = params.plan_position;
    }

    // Add ecommerce data (for view_item_list, view_item, begin_checkout, etc)
    if (params.items && params.items.length > 0) {
      payload.ecommerce = {
        currency: params.currency || "USD",
        value: params.value,
        items: params.items.map((item) => ({
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: item.item_category,
          price: item.price,
          quantity: item.quantity || 1,
        })),
      };
    }

    // For purchase, add transaction data
    if (eventName === "purchase" && params.transaction_id) {
      payload.transaction_id = params.transaction_id;
      payload.value = params.value;
      if (params.tax !== undefined) {
        payload.tax = params.tax;
      }
      if (params.shipping !== undefined) {
        payload.shipping = params.shipping;
      }
      if (params.coupon) {
        payload.coupon = params.coupon;
      }
    }

    // For search events
    if (params.search_type) {
      payload.search_type = params.search_type;
    }
    if (params.search_query) {
      payload.search_query = params.search_query;
    }
    if (params.search_results_count !== undefined) {
      payload.search_results_count = params.search_results_count;
    }

    // For device compatibility
    if (params.device_model) {
      payload.device_model = params.device_model;
    }
    if (params.device_manufacturer) {
      payload.device_manufacturer = params.device_manufacturer;
    }
    if (params.is_compatible !== undefined) {
      payload.is_compatible = params.is_compatible;
    }
    if (params.compatibility_source) {
      payload.compatibility_source = params.compatibility_source;
    }

    // For contact events
    if (params.contact_method) {
      payload.contact_method = params.contact_method;
    }
    if (params.contact_location) {
      payload.contact_location = params.contact_location;
    }
    if (params.destination_url) {
      payload.destination_url = params.destination_url;
    }

    // For engagement params
    if (params.scroll_percentage !== undefined) {
      payload.scroll_percentage = params.scroll_percentage;
    }
    if (params.item_list_id) {
      payload.item_list_id = params.item_list_id;
    }
    if (params.item_list_name) {
      payload.item_list_name = params.item_list_name;
    }
    if (params.promotion_id) {
      payload.promotion_id = params.promotion_id;
    }
    if (params.promotion_name) {
      payload.promotion_name = params.promotion_name;
    }
    if (params.checkout_option) {
      payload.checkout_option = params.checkout_option;
    }
    if (params.checkout_option_value) {
      payload.checkout_option_value = params.checkout_option_value;
    }
    if (params.exception_type) {
      payload.exception_type = params.exception_type;
    }
    if (params.exception_description) {
      payload.exception_description = params.exception_description;
    }
    if (params.is_fatal !== undefined) {
      payload.is_fatal = params.is_fatal;
    }
    if (params.faq_index !== undefined) {
      payload.faq_index = params.faq_index;
    }
    if (params.faq_key) {
      payload.faq_key = params.faq_key;
    }
    if (params.faq_deep_link !== undefined) {
      payload.faq_deep_link = params.faq_deep_link;
    }
    if (params.social_platform) {
      payload.social_platform = params.social_platform;
    }

    // Mark conversion events
    if (isConversionEvent(eventName)) {
      payload.is_conversion = true;
    }

    this.push(payload);
  }

  /**
   * Get GA4 client ID from _ga cookie
   */
  getClientId(): string | undefined {
    return getGA4ClientId();
  }

  /**
   * Enable debug logging
   */
  setDebug(debug: boolean): void {
    this.debug = debug;
  }
}

// Export singleton instance
export const ga4Provider = new GA4Provider(process.env.NODE_ENV === "development");
