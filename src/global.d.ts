declare global {
  interface Window {
    atomicSearchCustomConfig?: BrightspaceCustomWidgetConfig;
    // eventually we'll have to figure out how to handle canvas config here
    atomicSearchConfig?: BrightspaceWidgetConfig;
    ATOMIC_SEARCH_ENHANCED_LOCKED?: boolean;
  }
}

export interface BrightspaceCustomWidgetConfig {
  link?: string;
  showBranding?: string;
}

export interface BrightspaceWidgetConfig {
  orgTypeId?: string;
  link?: string;
  showBranding?: string;
}

export {};
