import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      canvasUrl: 'https://atomicjolt.beta.instructure.com',
      email: 'matt.wallentiny@atomicjolt.com',
      password: 'abc123ABC!@#'
    },
    chromeWebSecurity: false
  },
});
