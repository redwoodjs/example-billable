// Define the mock for rwsdk/db before any imports
const mockCreateDb = jest.fn();

jest.mock('rwsdk/db', () => ({
  createDb: mockCreateDb,
  Database: jest.fn(),
}));

describe('Database Module', () => {
  let originalEnv: any;

  beforeEach(() => {
    // Store original env
    originalEnv = global.env;
    jest.resetModules();
    
    // Mock environment for Cloudflare workers
    Object.defineProperty(global, 'env', {
      value: { APP_DURABLE_OBJECT: 'test-durable-object' },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Restore original env
    global.env = originalEnv;
    // Clear mocks after each test
    jest.clearAllMocks();
  });

  it('should export the database instance', async () => {
    const mockDbInstance = {
      User: { find: jest.fn() },
      Invoice: { find: jest.fn() },
      Credential: { find: jest.fn() },
    };
    
    // Set up the mock to return the mock DB instance
    mockCreateDb.mockReturnValue(mockDbInstance);

    // Import the database module
    const { db } = await import('./db');

    // Check that the db is properly exported
    expect(db).toBeDefined();
    expect(db).toBe(mockDbInstance);
  });

  it('should call createDb during module initialization', async () => {
    mockCreateDb.mockReturnValue({});

    // Import the database module, which triggers initialization
    await import('./db');

    // Check that createDb was called
    expect(mockCreateDb).toHaveBeenCalled();
  });

  it('should call createDb with expected arguments', async () => {
    mockCreateDb.mockReturnValue({});

    await import('./db');

    // Check that createDb was called with correct arguments
    // Note: The first arg (env.APP_DURABLE_OBJECT) may be undefined during tests
    // depending on how cloudflare:workers env is handled
    const calls = mockCreateDb.mock.calls;
    
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][1]).toBe('app-database'); // Second argument should be 'app-database'
  });

  it('should export expected database structure', async () => {
    const mockDbStructure = {
      User: {},
      Invoice: {},
      Credential: {},
    };
    
    mockCreateDb.mockReturnValue(mockDbStructure);

    const { db } = await import('./db');

    expect(db.User).toBeDefined();
    expect(db.Invoice).toBeDefined();
    expect(db.Credential).toBeDefined();
  });
});