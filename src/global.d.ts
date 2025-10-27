declare global {
  interface Window {
    atomicSearchCustomConfig?: BrightspaceCustomWidgetConfig;
    atomicSearchConfig?: BrightspaceWidgetConfig | CanvasWidgetConfig;
    ATOMIC_SEARCH_ENHANCED_LOCKED?: boolean;
  }
}

export interface CanvasWidgetConfig {
  // This needs to have something in it to avoid TS errors, I haven't switched
  // canvas over yet
  todo: string;
}

type orgId = string | number;
export interface BrightspaceCustomWidgetConfig {
  link?: string;
  showBranding?: 'on' | 'off';
  supportedOrgs?: orgId[];
}

export interface BrightspaceWidgetConfig {
  orgTypeId?: string;
  link?: string;
  showBranding?: 'on' | 'off';
}

export {};
