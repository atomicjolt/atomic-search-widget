import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      canvasUrl: 'https://atomicjolt.beta.instructure.com',
    },
    chromeWebSecurity: false
  },
});
