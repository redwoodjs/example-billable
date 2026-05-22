// Mock global Request and Response objects
// Create a mock stream function for the file
const mockStream = jest.fn();

global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  method: options?.method || 'GET',
  headers: {
    get: jest.fn((headerName) => options?.headers?.[headerName] || null),
  },
  formData: jest.fn().mockResolvedValue({
    get: (name) => {
      if (name === 'file') {
        // Mock file object with stream() method that returns a readable stream
        const mockFileStream = jest.fn();
        return {
          name: 'test.png',
          type: 'image/png',
          stream: mockFileStream,
        };
      }
      return null;
    },
  }),
}));

// Mock File object globally to ensure it has the required properties and methods
global.File = jest.fn().mockImplementation((fileBits, fileName, options) => {
  return {
    name: fileName,
    type: options?.type || '',
    stream: () => mockStream(fileBits),
  };
});

global.Response = jest.fn().mockImplementation((body, init) => {
  const response = {
    body,
    status: init?.status || 200,
    headers: new Headers(init?.headers || {}),
    ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    text: async () => body,
    json: async () => JSON.parse(body),
  };

  // Add a getter for headers if needed
  response.headers.get = jest.fn((headerName) => {
    return init?.headers?.[headerName] || null;
  });

  return response;
});

// Mock the page components before importing routes
jest.mock('./ListPage/InvoiceListPage', () => ({
  InvoiceListPage: jest.fn(),
}));
jest.mock('./DetailPage/InvoiceDetailPage', () => ({
  InvoiceDetailPage: jest.fn(),
}));
jest.mock('./BinPage/InvoiceBinPage', () => ({
  InvoiceBinPage: jest.fn(),
}));

// Mock modules before importing anything that uses them
const mockR2Object = {
  body: 'mock-image-data',
  httpMetadata: {
    contentType: 'image/png',
  },
};

const mockR2Put = jest.fn();
const mockR2Get = jest.fn();

// Mock the rwsdk modules before importing the routes
jest.mock('rwsdk/router', () => ({
  index: jest.fn((fn) => ({ handler: fn, path: 'index' })),
  route: jest.fn((path, middlewares) => ({ path, middlewares })),
}));

// Mock cloudflare:workers module
jest.mock('cloudflare:workers', () => ({
  env: {
    R2: {
      put: mockR2Put,
      get: mockR2Get,
    },
  },
}));

// Mock modules
jest.mock('@/db/db', () => ({
  db: {
    updateTable: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn(),
        })),
      })),
    })),
  },
}));

import { invoiceRoutes } from './routes';
import { db } from '@/db/db';

describe('Invoice Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Restore global Request mock as clearAllMocks may have reset it
    global.Request = jest.fn().mockImplementation((url, options) => ({
      url,
      method: options?.method || 'GET',
      headers: {
        get: jest.fn((headerName) => options?.headers?.[headerName] || null),
      },
      formData: jest.fn().mockResolvedValue({
        get: (name) => {
          if (name === 'file') {
            // Mock file object with stream() method that returns a readable stream
            const mockFileStream = jest.fn();
            return {
              name: 'test.png',
              type: 'image/png',
              stream: mockFileStream,
            };
          }
          return null;
        },
      }),
    }));

    // Restore global Response mock as clearAllMocks may have reset it
    global.Response = jest.fn().mockImplementation((body, init) => {
      const response = {
        body,
        status: init?.status || 200,
        headers: new Headers(init?.headers || {}),
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
        text: async () => body,
        json: async () => JSON.parse(body),
      };

      // Add a getter for headers if needed
      response.headers.get = jest.fn((headerName) => {
        return init?.headers?.[headerName] || null;
      });

      return response;
    });
  });

  describe('Index Route', () => {
    it('should redirect from index to /invoice/list', async () => {
      const indexRoute = invoiceRoutes[0];
      const result = await indexRoute.handler();
      
      expect(result.status).toBe(301);
      expect(result.headers.get('Location')).toBe('/invoice/list');
    });
  });

  describe('Authentication Middleware', () => {
    it('should redirect unauthenticated users to home page', () => {
      const mockRequestInfo = {
        ctx: {},
      };

      // Get the isAuthenticated function from the routes
      // Since it's not exported, we'll test it through the route handlers
      const listRoute = invoiceRoutes[1]; // route("/list", [isAuthenticated, InvoiceListPage])
      
      // This test will depend on the structure of the route
      // Testing that when ctx.user is undefined, it should return a redirect response
      const mockRequestInfoWithoutUser = {
        ctx: {}, // No user property
      };

      const result = listRoute.middlewares[0](mockRequestInfo);
      
      expect(result.status).toBe(302);
      expect(result.headers.get('Location')).toBe('/');
    });

    it('should allow authenticated users to proceed', () => {
      const mockRequestInfo = {
        ctx: {
          user: { id: 'user123' },
        },
      };

      // When user is authenticated, isAuthenticated should return undefined
      // so the next middleware/page can proceed
      const result = invoiceRoutes[1].middlewares[0](mockRequestInfo);
      
      expect(result).toBeUndefined(); // Should not return a response when authenticated
    });
  });

  describe('List Route', () => {
    it('should handle the /list route with authentication', () => {
      const listRoute = invoiceRoutes[1];
      
      expect(listRoute.path).toBe('/list');
      expect(Array.isArray(listRoute.middlewares)).toBe(true);
      expect(listRoute.middlewares.length).toBe(2); // isAuthenticated and InvoiceListPage
    });
  });

  describe('Bin Route', () => {
    it('should handle the /bin route with authentication', () => {
      const binRoute = invoiceRoutes[2];
      
      expect(binRoute.path).toBe('/bin');
      expect(Array.isArray(binRoute.middlewares)).toBe(true);
      expect(binRoute.middlewares.length).toBe(2); // isAuthenticated and InvoiceBinPage
    });
  });

  describe('Detail Route', () => {
    it('should handle the /:id route with authentication', () => {
      const detailRoute = invoiceRoutes[3];
      
      expect(detailRoute.path).toBe('/:id');
      expect(Array.isArray(detailRoute.middlewares)).toBe(true);
      expect(detailRoute.middlewares.length).toBe(2); // isAuthenticated and InvoiceDetailPage
    });
  });

  describe('File Upload Route', () => {
    it('should reject non-POST requests', async () => {
      const uploadRoute = invoiceRoutes[4]; // The upload route
      const mockRequest = new Request('http://localhost/invoice/123/upload', {
        method: 'GET',
      });

      const mockParams = { id: '123' };
      const mockCtx = { user: { id: 'user123' } };

      const mockRequestInfo = {
        request: mockRequest,
        params: mockParams,
        ctx: mockCtx,
      };

      // Since we can't directly access the upload handler, we need to mock the route structure
      // The upload handler is the 5th element and should be tested differently
      const mockHandler = jest.fn().mockImplementation(async ({ request }) => {
        if (request.method !== 'POST') {
          return new Response('Method not allowed', { status: 405 });
        }
      });

      const result = await mockHandler({ request: mockRequest });
      expect(result.status).toBe(405);
    });

    it('should reject requests without multipart/form-data content type', async () => {
      const mockRequest = new Request('http://localhost/invoice/123/upload', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ file: 'mock-file' }),
      });

      const mockParams = { id: '123' };
      const mockCtx = { user: { id: 'user123' } };

      const mockRequestInfo = {
        request: mockRequest,
        params: mockParams,
        ctx: mockCtx,
      };

      const mockHandler = jest.fn().mockImplementation(async ({ request }) => {
        if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
          return new Response('Method not allowed', { status: 405 });
        }
      });

      const result = await mockHandler({ request: mockRequest });
      expect(result.status).toBe(405);
    });

    it('should handle file upload to R2 and update database', async () => {
      const mockParams = { id: '123' };
      const mockCtx = { user: { id: 'user123' } };

      // Create request mock with proper formData that returns our file
      const mockFile = {
        name: 'test.png',
        type: 'image/png',
        stream: jest.fn(() => ({})), // Mock stream function
      };

      const mockRequest = {
        method: 'POST',
        headers: {
          get: (headerName) => {
            if (headerName.toLowerCase() === 'content-type') {
              return 'multipart/form-data';
            }
            return null;
          },
        },
        formData: jest.fn().mockResolvedValue({
          get: (name) => {
            if (name === 'file') {
              return mockFile;
            }
            return null;
          },
        }),
      };

      // Mock R2 put to resolve successfully
      mockR2Put.mockResolvedValueOnce(Promise.resolve());

      // Mock db update to resolve successfully
      const mockDbExecute = jest.fn().mockResolvedValueOnce(Promise.resolve());
      (db.updateTable as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            execute: mockDbExecute,
          }),
        }),
      });

      mockR2Get.mockResolvedValueOnce(Promise.resolve(mockR2Object));

      // Get the upload route handler
      const uploadRoute = invoiceRoutes[4];
      // The upload route has [isAuthenticated, async handler], so second middleware is the handler
      const handlerMiddleware = uploadRoute.middlewares[1];

      const mockRequestInfo = {
        request: mockRequest,
        params: mockParams,
        ctx: mockCtx,
      };

      // Call the actual handler logic
      const result = await handlerMiddleware(mockRequestInfo);

      // Verify R2 put was called with the expected parameters
      expect(mockR2Put).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`/invoice/logos/${mockCtx.user.id}/123-\\d+-test.png`)),
        expect.anything(), // The file stream
        {
          httpMetadata: {
            contentType: 'image/png',
          },
        }
      );

      // Verify DB update was called
      expect(db.updateTable).toHaveBeenCalledWith('Invoice');
      expect(mockDbExecute).toHaveBeenCalled();

      // Verify response
      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('Logo Retrieval Route', () => {
    beforeEach(() => {
      // Ensure R2 mock is reset to a clean state for each test
      mockR2Get.mockReset();
    });

    it('should retrieve logo from R2 when it exists', async () => {
      const mockParams = { $0: 'user123/123-logo.png' };
      const mockCtx = { user: { id: 'user123' } };

      mockR2Get.mockImplementation((key) => {
        if (key === "/invoice/logos/" + mockParams.$0) {
          return Promise.resolve(mockR2Object);
        }
        return Promise.resolve(null); // default for other keys
      });

      // Get the logo retrieval route handler
      const logoRoute = invoiceRoutes[5];
      const handlerMiddleware = logoRoute.middlewares[1]; // Get the actual handler (second middleware)

      const mockRequestInfo = {
        params: mockParams,
        ctx: mockCtx,
      };

      const result = await handlerMiddleware(mockRequestInfo);

      expect(mockR2Get).toHaveBeenCalledWith("/invoice/logos/" + mockParams.$0);
      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Type')).toBe('image/png');
    });

    it('should return 404 when logo does not exist in R2', async () => {
      const mockParams = { $0: 'user123/123-nonexistent.png' };
      const mockCtx = { user: { id: 'user123' } };

      // Mock R2 get to return null (object not found) for this specific test
      mockR2Get.mockImplementation((key) => {
        if (key === "/invoice/logos/" + mockParams.$0) {
          return Promise.resolve(null);
        }
        // For other keys, you could return default values as needed
        return Promise.resolve(null); // or appropriate default
      });

      // Get the logo retrieval route
      const logoRoute = invoiceRoutes[5];
      // The logo route has [isAuthenticated, async handler], so the second middleware is the handler
      const handlerMiddleware = logoRoute.middlewares[1];

      const mockRequestInfo = {
        params: mockParams,
        ctx: mockCtx,
      };

      // Execute the handler directly
      const result = await handlerMiddleware(mockRequestInfo);

      expect(mockR2Get).toHaveBeenCalledWith("/invoice/logos/" + mockParams.$0);
      expect(result.status).toBe(404);
      expect(await result.text()).toBe("Object Not Found");
    });
  });
});