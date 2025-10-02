const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'txj8jd',
    e2e: {
        baseUrl: 'https://thinking-tester-contact-list.herokuapp.com',
        viewportWidth: 1280,
        viewportHeight: 720,
        defaultCommandTimeout: 10000,
        requestTimeout: 10000,
        responseTimeout: 10000,
        video: true,
        screenshotOnRunFailure: true,
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/e2e.js'
    },
})