'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'sparqlist',
    environment,
    rootURL: process.env.ROOT_PATH || '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    // https://github.com/simplabs/ember-simple-auth/pull/2215
    'ember-simple-auth': {
      'ember-simple-auth': {
        routeAfterAuthentication: 'sparqlets'
      }
    },

    fontawesome: {
      icons: {
        'free-solid-svg-icons': [
          'arrow-right',
          'chevron-down',
          'chevron-right',
          'clock',
          'code-branch',
          'edit',
          'plus-circle',
          'rocket',
          'save',
          'spinner',
          'trash',
        ]
      }
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
