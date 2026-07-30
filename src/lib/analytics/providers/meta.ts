/**
 * Meta Pixel Provider
 * Sends events to Meta Pixel via fbq()
 * Coordinates with existing Meta Pixel implementation in /meta/pixel.ts
 */

import type { EventName, EventParams } from "../types";
import { META_EVENT_MAPPING } from "../constants";
import { hasAnalyticsConsent, getSessionId } from "../helpers";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export interface MetaEventData {
  [key: string]: unknown;
}

export class MetaProvider {
  private debug: boolean;
  private pixelReady: boolean = false;
  private pendingEvents: Array<() => void> = [];

  constructor(debug: boolean = false) {
    this.debug = debug;
    this.checkPixelReady();
  }

  /**
   * Check if Meta Pixel is ready
   * The Meta Pixel script sets window.fbq, which starts as a stub that queues calls
   */
  private checkPixelReady(): void {
    if (typeof window === "undefined") return;

    if (typeof window.fbq === "function") {
      this.pixelReady = true;
    }
  }

  /**
   * Mark that the Meta Pixel is ready
   * Called from MetaPixelScript when fbevents.js finishes loading
   */
  markReady(): void {
    this.pixelReady = true;
    this.flushPending();
  }

  /**
   * Queue an event to be sent once Pixel is ready
   */
  private queueEvent(send: () => void): void {
    if (this.pixelReady) {
      send();
    } else {
      this.pendingEvents.push(send);
    }
  }

  /**
   * Flush all pending events
   */
  private flushPending(): void {
    const events = this.pendingEvents.splice(0, this.pendingEvents.length);
    events.forEach((event) => event());
  }

  /**
   * Send event to Meta Pixel via fbq()
   * Only sends events that Meta supports
   */
  track(eventName: EventName, params: EventParams): void {
    // Check consent
    if (!hasAnalyticsConsent()) {
      if (this.debug) {
        console.log("[Meta] Consent not given, skipping event:", eventName);
      }
      return;
    }

    // Map our event name to Meta event name
    const metaEventName = META_EVENT_MAPPING[eventName];

    if (!metaEventName) {
      if (this.debug) {
        console.log("[Meta] No mapping for event:", eventName);
      }
      return;
    }

    // Build Meta event data
    const metaData = this.buildMetaEventData(eventName, params);

    // Queue or send immediately
    this.queueEvent(() => {
      if (typeof window === "undefined" || typeof window.fbq !== "function") {
        if (this.debug) {
          console.warn("[Meta] fbq not available");
        }
        return;
      }

      if (this.debug) {
        console.log("[Meta] Event tracked:", metaEventName, metaData);
      }

      // Use eventID for deduplication if available
      if (params.session_id) {
        window.fbq("track", metaEventName, metaData, { eventID: params.session_id });
      } else {
        window.fbq("track", metaEventName, metaData);
      }
    });
  }

  /**
   * Build Meta-compatible event data
   * Meta has a specific format for custom data
   */
  private buildMetaEventData(eventName: EventName, params: EventParams): MetaEventData {
    const data: MetaEventData = {};

    // Content data
    if (params.items && params.items.length > 0) {
      data.content_ids = params.items.map((item) => item.item_id);
      data.content_type = params.items.length === 1 ? "product" : "product_group";
      data.content_name = params.items[0].item_name;
      data.contents = params.items.map((item) => ({
        id: item.item_id,
        quantity: item.quantity || 1,
        item_price: item.price,
      }));
    } else if (params.plan_id) {
      data.content_ids = [params.plan_id];
      data.content_type = "product";
      data.content_name = params.plan_name || "Plan";
    }

    // Value and currency
    if (params.value !== undefined) {
      data.value = params.value;
    }
    if (params.currency) {
      data.currency = params.currency;
    }

    // Search data
    if (params.search_query) {
      data.search_string = params.search_query;
    }

    // Transaction ID (for purchase)
    if (params.transaction_id) {
      data.transaction_id = params.transaction_id;
    }

    // Number of items
    if (params.items && params.items.length > 0) {
      data.num_items = params.items.length;
    }

    // Status (for some events)
    if (params.is_compatible !== undefined) {
      data.status = params.is_compatible ? "compatible" : "not_compatible";
    }

    // Add custom parameters that Meta accepts
    if (params.section) {
      data.section = params.section;
    }

    // For contact events, include method
    if (params.contact_method) {
      data.contact_method = params.contact_method;
    }

    if (params.device_model) {
      data.device_model = params.device_model;
    }

    return data;
  }

  /**
   * Check if Pixel is loaded and ready
   */
  isReady(): boolean {
    return this.pixelReady;
  }

  /**
   * Enable debug logging
   */
  setDebug(debug: boolean): void {
    this.debug = debug;
  }
}

// Export singleton instance
export const metaProvider = new MetaProvider(process.env.NODE_ENV === "development");

/**
 * Exported function to mark Meta Pixel as ready
 * Called from MetaPixelScript component
 */
export function markMetaPixelReady(): void {
  metaProvider.markReady();
}
