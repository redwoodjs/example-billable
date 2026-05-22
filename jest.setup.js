const { cleanup } = require('@testing-library/react');
const { expect } = require('@jest/globals');
require('@testing-library/jest-dom');

// Mock window.location for navigation methods to prevent JSDOM errors
// Check if location property is configurable before trying to redefine
const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

if (!locationDescriptor || locationDescriptor.configurable) {
  // If it's configurable, we can redefine it
  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    },
    writable: true,
  });
} else {
  // If it's not configurable, just mock the problematic methods
  if (window.location && typeof window.location === 'object') {
    if (typeof window.location.assign === 'function') {
      window.location.assign = jest.fn();
    }
    if (typeof window.location.replace === 'function') {
      window.location.replace = jest.fn();
    }
    if (typeof window.location.reload === 'function') {
      window.location.reload = jest.fn();
    }
  }

  // For the href property, we'll try to intercept assignments by overriding it
  // This approach won't work if the property is not configurable, so as a last resort:
  // We'll make sure any attempts to set href just store the value without actually navigating
  try {
    // Try to override href
    Object.defineProperty(window.location, 'href', {
      set: function(val) {
        // Store the value but don't actually navigate
        this._href = val;
      },
      get: function() {
        return this._href || '';
      },
      configurable: true
    });
  } catch (e) {
    // If we can't even redefine href, then we'll just leave it as is
    // and hope that the navigation doesn't cause errors during tests
    console.warn('Could not mock window.location.href:', e.message);
  }
}

// Clean up the DOM after each test
afterEach(() => {
  cleanup();
});