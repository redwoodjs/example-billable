import { describe, expect, it, jest } from '@jest/globals';

// Mock all problematic modules before importing routes
jest.mock('rwsdk/router', () => ({
  route: (path, handlerOrComponent) => {
    // Distinguish between async functions and other functions/components
    // Async functions have different characteristics than regular functions/components
    const isAsyncFunction = handlerOrComponent.constructor.name === 'AsyncFunction' ||
                           (handlerOrComponent.toString().includes('async ') &&
                           handlerOrComponent.toString().includes('function'));

    if (isAsyncFunction) {
      return {
        path,
        handler: handlerOrComponent
      };
    } else {
      // Assume everything else is a component
      return {
        path,
        component: handlerOrComponent
      };
    }
  },
}));

// Mock the LoginPage component BEFORE importing routes
jest.mock('./LoginPage', () => ({
  LoginPage: () => <div>Login Page</div>,
}));

// Mock the link utility function
jest.mock('@/app/shared/links', () => ({
  link: jest.fn((path: string) => path),
}));

// Mock the sessionStore module
jest.mock('@/worker', () => ({
  sessionStore: {
    remove: jest.fn(),
  },
}));

// Mock global Response object
global.Response = jest.fn((body, init) => {
  return {
    body,
    status: init?.status || 200,
    headers: init?.headers || new Headers(),
    ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    json: jest.fn(async () => Promise.resolve({})),
    text: jest.fn(async () => Promise.resolve('')),
    redirected: false,
    url: '',
    statusText: 'OK',
    type: 'default',
    clone: jest.fn(),
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    redirected: false,
  };
}) as any;

import { userRoutes } from './routes';
import { LoginPage } from './LoginPage';
import { sessionStore } from '@/worker';
import { link } from '@/app/shared/links';

describe('userRoutes', () => {
  it('should define routes array with expected length', () => {
    expect(Array.isArray(userRoutes)).toBe(true);
    expect(userRoutes.length).toBe(2);
  });


  it('should have login route at index 0', () => {
    const loginRoute = userRoutes[0];
    expect(loginRoute.path).toBe('/login');
    expect(loginRoute.component).toBeDefined();
    expect(typeof loginRoute.component).toBe('function');
  });

  it('should have logout route at index 1', () => {
    const logoutRoute = userRoutes[1];
    expect(logoutRoute.path).toBe('/logout');
    expect(typeof logoutRoute.handler).toBe('function');
  });

  describe('login route', () => {
    it('should handle GET requests to /login', () => {
      const loginRoute = userRoutes[0];
      expect(loginRoute.path).toBe('/login');
      expect(loginRoute.component).toBeDefined();
      expect(typeof loginRoute.component).toBe('function');
    });

    it('should have LoginPage component', () => {
      const loginRoute = userRoutes[0];
      expect(loginRoute.component).toBeDefined();
      expect(typeof loginRoute.component).toBe('function');
    });
  });

  describe('logout route', () => {
    it('should handle GET requests to /logout', async () => {
      const logoutRoute = userRoutes[1];
      expect(logoutRoute.path).toBe('/logout');
      expect(typeof logoutRoute.handler).toBe('function');

      // Mock request object
      const mockHeaders = new Headers();
      const mockRequest = {
        url: 'http://test.com/logout',
        headers: mockHeaders,
      };

      // Mock sessionStore.remove to resolve with headers
      (sessionStore.remove as jest.Mock).mockResolvedValue(undefined);

      // Call the handler
      const response = await logoutRoute.handler({ request: mockRequest as Request });

      // Expect redirect response with status 302
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/');
    });

    it('should call sessionStore.remove when logging out', async () => {
      const logoutRoute = userRoutes[1];
      const mockHeaders = new Headers();
      const mockRequest = {
        url: 'http://test.com/logout',
        headers: mockHeaders,
      } as Request;

      // Mock sessionStore.remove
      const removeSpy = jest.spyOn(sessionStore, 'remove').mockResolvedValue(undefined);

      await logoutRoute.handler({ request: mockRequest });

      expect(removeSpy).toHaveBeenCalledWith(mockRequest, expect.any(Headers));
    });

    it('should redirect to home page after logout', async () => {
      const logoutRoute = userRoutes[1];
      const mockRequest = {
        url: 'http://test.com/logout',
        headers: new Headers(),
      } as Request;

      // Mock sessionStore.remove
      (sessionStore.remove as jest.Mock).mockResolvedValue(undefined);
      (link as jest.Mock).mockReturnValue('/');

      const response = await logoutRoute.handler({ request: mockRequest });

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/');
    });

    it('should propagate session removal errors', async () => {
      const logoutRoute = userRoutes[1];
      const mockRequest = {
        url: 'http://test.com/logout',
        headers: new Headers(),
      } as Request;

      // Mock sessionStore.remove to reject with error
      (sessionStore.remove as jest.Mock).mockRejectedValue(new Error('Session removal failed'));

      // The handler should propagate the error rather than handle it gracefully
      await expect(logoutRoute.handler({ request: mockRequest })).rejects.toThrow('Session removal failed');
    });

    it('should set Location header correctly using link utility', async () => {
      const logoutRoute = userRoutes[1];
      const mockRequest = {
        url: 'http://test.com/logout',
        headers: new Headers(),
      } as Request;

      // Mock sessionStore.remove
      (sessionStore.remove as jest.Mock).mockResolvedValue(undefined);
      (link as jest.Mock).mockReturnValue('/custom-home');

      const response = await logoutRoute.handler({ request: mockRequest });

      expect(response.headers.get('Location')).toBe('/custom-home');
      expect(link).toHaveBeenCalledWith('/');
    });
  });

  describe('route definitions', () => {
    it('should match expected route paths', () => {
      const paths = userRoutes.map(route => route.path);
      expect(paths).toEqual(['/login', '/logout']);
    });

    it('should have correct login route configuration', () => {
      const [loginRoute] = userRoutes;
      expect(loginRoute.path).toBe('/login');
      expect(loginRoute.component).toBeDefined();
      expect(typeof loginRoute.component).toBe('function');
      // Login route should not have a handler function (uses component instead)
      expect(loginRoute.handler).toBeUndefined();
    });

    it('should have correct logout route configuration', () => {
      const [, logoutRoute] = userRoutes;
      expect(logoutRoute.path).toBe('/logout');
      expect(typeof logoutRoute.handler).toBe('function');
      // Logout route should not have a component (uses handler instead)
      expect(logoutRoute.component).toBeUndefined();
    });
  });
});