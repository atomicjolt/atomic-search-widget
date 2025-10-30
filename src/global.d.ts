declare global {
  interface Window {
    atomicSearchCustomConfig?: BrightspaceCustomWidgetConfig;
    atomicSearchConfig?: BrightspaceWidgetConfig | CanvasWidgetConfig;
    ATOMIC_SEARCH_ENHANCED_LOCKED?: boolean;
    ATOMIC_SEARCH_LOCKED?: boolean;
    ENV: { current_user_id: string | number };
  }
}

export interface CanvasWidgetConfig {
  // This needs to have something in it to avoid TS errors, I haven't switched
  // canvas over yet
  todo: string;
  accountId?: string | number;
  externalToolId?: string | number;
  hasEquella?: boolean;
}

export interface BrightspaceCustomWidgetConfig {
  link?: string;
  showBranding?: 'on' | 'off';
}

export interface BrightspaceWidgetConfig {
  orgTypeId?: string;
  link?: string;
  showBranding?: 'on' | 'off';
}

export {};
