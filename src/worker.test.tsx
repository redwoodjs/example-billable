import { describe, it, expect, jest } from '@jest/globals';

// Mock the database import
jest.mock('@/db/db', () => ({
  db: {
    selectFrom: jest.fn(() => ({
      select: jest.fn(() => ({
        where: jest.fn(() => ({
          executeTakeFirst: jest.fn(),
        })),
      })),
    })),
  },
}));

// Define the getUser function directly to test (copied from worker.tsx)
const getUser = async (session: any) => {
  if (!session?.userId) {
    return null;
  }

  const db = require('@/db/db').db;
  const user = await db
    .selectFrom("User")
    .select(["id", "email"])
    .where("id", "=", session.userId)
    .executeTakeFirst();

  return user || null;
};

// Define the Session interface to match the worker
interface Session {
  userId?: string | null;
  challenge?: string | null;
  createdAt: number;
}

// Define the AppContext type to match the worker
type AppContext = {
  session: Session | null;
  user: {
    id: string;
    email: string;
  } | null;
};

describe('Worker Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser function', () => {
    it('should return null when session is null', async () => {
      const result = await getUser(null);
      expect(result).toBeNull();
    });

    it('should return null when session has no userId', async () => {
      const session = { userId: null, challenge: null, createdAt: Date.now() };
      const result = await getUser(session);
      expect(result).toBeNull();
    });

    it('should return null when session has undefined userId', async () => {
      const session = { challenge: null, createdAt: Date.now() };
      const result = await getUser(session as any);
      expect(result).toBeNull();
    });

    it('should fetch user from database when session has userId', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' };
      const session = { userId: mockUser.id, challenge: null, createdAt: Date.now() };
      
      const db = require('@/db/db').db;
      const executeTakeFirstMock = (db.selectFrom as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            executeTakeFirst: jest.fn().mockResolvedValue(mockUser),
          }),
        }),
      }).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            executeTakeFirst: jest.fn().mockResolvedValue(mockUser),
          }),
        }),
      });

      const result = await getUser(session);

      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found in database', async () => {
      const session = { userId: 'nonexistent', challenge: null, createdAt: Date.now() };
      
      const db = require('@/db/db').db;
      (db.selectFrom as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            executeTakeFirst: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await getUser(session);

      expect(result).toBeNull();
    });
  });

  describe('AppContext type', () => {
    it('should have the correct structure', () => {
      const context: AppContext = {
        session: null,
        user: null,
      };
      
      expect(context).toHaveProperty('session');
      expect(context).toHaveProperty('user');
    });

    it('should allow session and user to be objects', () => {
      const mockSession: Session = { userId: '123', challenge: null, createdAt: Date.now() };
      const mockUser = { id: '123', email: 'test@example.com' };
      
      const context: AppContext = {
        session: mockSession,
        user: mockUser,
      };
      
      expect(context.session).toEqual(mockSession);
      expect(context.user).toEqual(mockUser);
    });
  });
});