// Mock the rwsdk/auth module and its exports
jest.mock('rwsdk/auth', () => ({
  MAX_SESSION_DURATION: 86400000, // 24 hours in milliseconds, a common session duration
}));

import { MAX_SESSION_DURATION } from 'rwsdk/auth';
import { SessionDurableObject } from './durableObject';

// Mock the cloudflare:workers module
jest.mock('cloudflare:workers', () => {
  return {
    DurableObject: class DurableObject {
      state: any;
      env: any;

      constructor(state: any, env: any) {
        this.state = state;
        this.env = env;
      }
    }
  };
});

// Create a mock storage implementation
class MockStorage {
  private store: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key);
  }

  async put<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Create a mock DurableObjectState
const createMockState = () => {
  const storage = new MockStorage();
  return {
    storage,
    blockConcurrencyWhile: (fn: () => Promise<any>) => fn(),
  };
};

describe('SessionDurableObject', () => {
  let sessionDO: SessionDurableObject;
  let mockState: any;
  let mockEnv: any;

  beforeEach(() => {
    mockState = createMockState();
    mockEnv = {};
    sessionDO = new SessionDurableObject(mockState, mockEnv);
  });

  describe('constructor', () => {
    it('initializes with undefined session', () => {
      expect((sessionDO as any).session).toBeUndefined();
      expect((sessionDO as any).storage).toBeDefined();
    });
  });

  describe('saveSession', () => {
    it('creates a new session when no existing session', async () => {
      const data = {
        userId: 'user123',
        challenge: 'challenge123',
      };

      const result = await sessionDO.saveSession(data);
      
      expect(result.userId).toBe('user123');
      expect(result.challenge).toBe('challenge123');
      expect(result.createdAt).toBeDefined();
      expect(typeof result.createdAt).toBe('number');
      
      // Check that session is stored in memory
      expect((sessionDO as any).session).toEqual(result);
      
      // Check that session is stored in persistent storage
      const storedSession = await (sessionDO as any).storage.get('session');
      expect(storedSession).toEqual(result);
    });

    it('updates existing session properties without changing others', async () => {
      // First, save an initial session
      const createdAtValue = Date.now() - 1000;
      const initialData = {
        userId: 'user123',
        challenge: 'challenge123',
        createdAt: createdAtValue,
      };
      await (sessionDO as any).storage.put('session', initialData);

      // Update only userId
      const result = await sessionDO.saveSession({ userId: 'updatedUser' });

      expect(result.userId).toBe('updatedUser');
      expect(result.challenge).toBe('challenge123'); // Should remain unchanged
      expect(result.createdAt).toBe(createdAtValue); // Should remain unchanged
    });

    it('uses current session from memory if available', async () => {
      // Set up in-memory session
      const createdAtValue = Date.now() - 500;
      const inMemorySession = {
        userId: 'memoryUser',
        challenge: 'memoryChallenge',
        createdAt: createdAtValue,
      };
      (sessionDO as any).session = inMemorySession;

      // Update challenge
      const result = await sessionDO.saveSession({ challenge: 'newChallenge' });

      expect(result.userId).toBe('memoryUser'); // Should be from memory
      expect(result.challenge).toBe('newChallenge');
      expect(result.createdAt).toBe(createdAtValue);
    });

    it('prioritizes data parameter over existing session values', async () => {
      // Set up existing session
      const createdAtValue = Date.now() - 1000;
      const existingSession = {
        userId: 'existingUser',
        challenge: 'existingChallenge',
        createdAt: createdAtValue,
      };
      await (sessionDO as any).storage.put('session', existingSession);

      // Update with new values
      const result = await sessionDO.saveSession({
        userId: 'newUser',
        challenge: 'newChallenge',
      });

      expect(result.userId).toBe('newUser');
      expect(result.challenge).toBe('newChallenge');
      expect(result.createdAt).toBe(createdAtValue);
    });

    it('defaults userId and challenge to null when not provided', async () => {
      const result = await sessionDO.saveSession({});

      expect(result.userId).toBeNull();
      expect(result.challenge).toBeNull();
      expect(result.createdAt).toBeDefined();
    });
  });

  describe('getSession', () => {
    it('returns in-memory session if available', async () => {
      const inMemorySession = {
        userId: 'memoryUser',
        challenge: 'memoryChallenge',
        createdAt: Date.now(),
      };
      (sessionDO as any).session = inMemorySession;

      const result = await sessionDO.getSession();
      
      expect(result.value).toEqual(inMemorySession);
    });

    it('fetches from storage when no in-memory session', async () => {
      const storedSession = {
        userId: 'storedUser',
        challenge: 'storedChallenge',
        createdAt: Date.now(),
      };
      await (sessionDO as any).storage.put('session', storedSession);

      const result = await sessionDO.getSession();
      
      expect(result.value).toEqual(storedSession);
      expect((sessionDO as any).session).toEqual(storedSession);
    });

    it('returns empty session when no session exists', async () => {
      const result = await sessionDO.getSession();
      
      expect(result.value.userId).toBeNull();
      expect(result.value.challenge).toBeNull();
      expect(result.value.createdAt).toBeDefined();
      expect(typeof result.value.createdAt).toBe('number');
    });

    it('revokes expired session and returns empty session', async () => {
      const expiredCreatedAt = Date.now() - MAX_SESSION_DURATION - 1000; // Expired by 1 second
      const expiredSession = {
        userId: 'expiredUser',
        challenge: 'expiredChallenge',
        createdAt: expiredCreatedAt,
      };
      await (sessionDO as any).storage.put('session', expiredSession);

      const result = await sessionDO.getSession();
      
      // Session should be revoked (deleted from storage)
      const storedSession = await (sessionDO as any).storage.get('session');
      expect(storedSession).toBeUndefined();
      
      // Should return empty session
      expect(result.value.userId).toBeNull();
      expect(result.value.challenge).toBeNull();
      expect(result.value.createdAt).toBeDefined();
    });
  });

  describe('revokeSession', () => {
    it('deletes session from storage and clears in-memory cache', async () => {
      const session = {
        userId: 'user123',
        challenge: 'challenge123',
        createdAt: Date.now(),
      };
      await (sessionDO as any).storage.put('session', session);
      (sessionDO as any).session = session;

      await sessionDO.revokeSession();

      // Check that session is deleted from storage
      const storedSession = await (sessionDO as any).storage.get('session');
      expect(storedSession).toBeUndefined();

      // Check that in-memory session is cleared
      expect((sessionDO as any).session).toBeUndefined();
    });

    it('handles case when no session exists', async () => {
      // Should not throw an error
      await expect(sessionDO.revokeSession()).resolves.not.toThrow();
    });
  });
});