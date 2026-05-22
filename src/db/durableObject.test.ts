import { AppDurableObject } from './durableObject';
import { migrations } from '@/db/migrations';

// Create a mock environment for testing
const mockEnv = {
  DB: {
    prepare: jest.fn(),
    dump: jest.fn(),
  },
  ASSETS: {
    fetch: jest.fn(),
  },
};

// Mock the rwsdk/db module to provide a proper SqliteDurableObject base class
jest.mock('rwsdk/db', () => {
  class MockSqliteDurableObject {
    constructor(state: DurableObjectState, ctx: ExecutionContext, env: any) {
      // Constructor implementation if needed
    }
  }
  return {
    SqliteDurableObject: MockSqliteDurableObject,
  };
});

describe('AppDurableObject', () => {
  let appDurableObject: AppDurableObject;
  let mockState: DurableObjectState;
  let mockCtx: ExecutionContext;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock state and context
    mockState = {
      id: 'test-id',
      storage: {
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        list: jest.fn(),
        transaction: jest.fn(),
        getAlarm: jest.fn(),
        setAlarm: jest.fn(),
        deleteAlarm: jest.fn(),
      },
      blockConcurrencyWhile: jest.fn(),
    } as unknown as DurableObjectState;

    mockCtx = {
      waitUntil: jest.fn(),
      passThroughOnException: jest.fn(),
    } as unknown as ExecutionContext;

    // Create new instance
    appDurableObject = new AppDurableObject(mockState, mockCtx, mockEnv);
  });

  describe('constructor', () => {
    it('should create an instance of AppDurableObject', () => {
      expect(appDurableObject).toBeInstanceOf(AppDurableObject);
    });

    it('should accept the required parameters without error', () => {
      expect(() => {
        new AppDurableObject(mockState, mockCtx, mockEnv);
      }).not.toThrow();
    });
  });

  describe('migrations property', () => {
    it('should have migrations property set to migrations from db/migrations', () => {
      expect(appDurableObject.migrations).toBe(migrations);
    });

    it('should have migrations as an object with expected keys', () => {
      expect(typeof appDurableObject.migrations).toBe('object');
      expect(Object.keys(appDurableObject.migrations)).toContain('001_initial_schema');
      expect(Object.keys(appDurableObject.migrations)).toContain('002_add_credential_table');
      expect(Object.keys(appDurableObject.migrations)).toContain('003_add_invoice_table');
      expect(Object.keys(appDurableObject.migrations)).toContain('004_add_deleted_at_to_invoice');
    });
  });

  describe('instance properties', () => {
    it('should have correct constructor name', () => {
      expect(appDurableObject.constructor.name).toBe('AppDurableObject');
    });

    it('should not modify the original migrations array', () => {
      // Create a new instance and verify migrations are unchanged
      const anotherInstance = new AppDurableObject(mockState, mockCtx, mockEnv);
      expect(anotherInstance.migrations).toBe(migrations);
      expect(anotherInstance.migrations).toEqual(appDurableObject.migrations);
    });
  });

  describe('integration with environment', () => {
    it('should accept the environment parameter without errors', () => {
      expect(() => {
        new AppDurableObject(mockState, mockCtx, mockEnv);
      }).not.toThrow();
    });

    it('should accept execution context parameter without errors', () => {
      expect(() => {
        new AppDurableObject(mockState, mockCtx, mockEnv);
      }).not.toThrow();
    });
  });
});