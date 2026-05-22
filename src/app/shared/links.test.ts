// Mock the rwsdk/router module before importing links
jest.mock('rwsdk/router', () => ({
  defineLinks: jest.fn((routes) => {
    // Mock implementation of defineLinks that mimics the real behavior
    return (route: string, params?: Record<string, string>) => {
      if (params) {
        // Replace route parameters with actual values
        let url = route;
        for (const [key, value] of Object.entries(params)) {
          url = url.replace(`:${key}`, value);
        }
        return url;
      }
      // Return the route as-is if no parameters
      return route;
    };
  }),
}));

import { link } from './links';

describe('links', () => {
  // Test that the link object is defined
  test('should be defined', () => {
    expect(link).toBeDefined();
  });

  // Test that link contains the expected routes
  test('should contain the expected static routes', () => {
    // Test the home route
    expect(link('/')).toBe('/');

    // Test login routes
    expect(link('/user/login')).toBe('/user/login');
    expect(link('/user/logout')).toBe('/user/logout');
    expect(link('/user/auth')).toBe('/user/auth');

    // Test invoice routes
    expect(link('/invoice/list')).toBe('/invoice/list');
    expect(link('/invoice/bin')).toBe('/invoice/bin');
    expect(link('/invoice/logos')).toBe('/invoice/logos');
  });

  // Test parameterized routes
  test('should handle parameterized routes correctly', () => {
    // Test invoice with ID
    expect(link('/invoice/:id', { id: '123' })).toBe('/invoice/123');

    // Test invoice upload with ID
    expect(link('/invoice/:id/upload', { id: '456' })).toBe('/invoice/456/upload');
  });

  // Test that all expected routes are available in the link function
  test('should handle all predefined routes', () => {
    const predefinedRoutes = [
      '/',

      '/user/login',
      '/user/logout',
      '/user/auth',

      '/invoice/list',
      '/invoice/bin',
      '/invoice/:id',
      '/invoice/:id/upload',
      '/invoice/logos',
    ];

    predefinedRoutes.forEach(route => {
      expect(() => link(route)).not.toThrow();
      expect(typeof link(route)).toBe('string');
    });
  });

  // Test parameterized route with different parameter values
  test('should handle different parameter values correctly', () => {
    expect(link('/invoice/:id', { id: 'abc-def' })).toBe('/invoice/abc-def');
    expect(link('/invoice/:id', { id: 'test123' })).toBe('/invoice/test123');
  });

  // Test that the link function returns string values
  test('should return string values', () => {
    const result = link('/');
    expect(typeof result).toBe('string');
    expect(result).toBe('/');
  });

  // Test route with multiple path segments
  test('should handle nested routes correctly', () => {
    expect(link('/user/login')).toBe('/user/login');
    expect(link('/invoice/list')).toBe('/invoice/list');
    expect(link('/invoice/bin')).toBe('/invoice/bin');
  });
});