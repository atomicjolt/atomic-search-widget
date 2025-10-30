// To use real values, the administrator is expected to place an

import { CanvasWidgetConfig } from "../global";

// atomicSearchConfig object above this code with their account and tool IDs.
export default window.atomicSearchConfig as CanvasWidgetConfig || {
  accountId: null,
  externalToolId: null,
  hasEquella: false,
};
