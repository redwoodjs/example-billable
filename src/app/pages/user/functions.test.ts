import { validateEmailAddress, startPasskeyRegistration, startPasskeyLogin, finishPasskeyRegistration, finishPasskeyLogin } from './functions';
import { db } from '@/db/db';
import { sessionStore } from '@/worker';
import { requestInfo } from 'rwsdk/worker';
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

// Mock external dependencies
jest.mock('@/db/db', () => ({
  db: {
    selectFrom: jest.fn(() => ({
      select: jest.fn(() => ({
        where: jest.fn(() => ({
          executeTakeFirst: jest.fn(),
        })),
      })),
    })),
    insertInto: jest.fn(() => ({
      values: jest.fn(() => ({
        execute: jest.fn(),
      })),
    })),
    updateTable: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn(),
        })),
      })),
    })),
  },
}));

jest.mock('@/worker', () => ({
  sessionStore: {
    load: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('rwsdk/worker', () => ({
  requestInfo: {
    request: {
      url: 'https://example.com',
    },
    response: {
      headers: new Headers(),
    },
  },
}));

jest.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: jest.fn(),
  generateAuthenticationOptions: jest.fn(),
  verifyRegistrationResponse: jest.fn(),
  verifyAuthenticationResponse: jest.fn(),
}));

// Mock process.env
const originalEnv = process.env;

describe('User Functions', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEmailAddress', () => {
    it('should return false and error message when email exists', async () => {
      (db.selectFrom as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          where: jest.fn(() => ({
            executeTakeFirst: jest.fn(() => Promise.resolve({ id: 'user-id' })),
          })),
        })),
      });

      const result = await validateEmailAddress('test@example.com');

      expect(result).toEqual([false, 'Email address already exists']);
      expect(db.selectFrom).toHaveBeenCalledWith('User');
    });

    it('should return true and empty message when email does not exist', async () => {
      (db.selectFrom as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          where: jest.fn(() => ({
            executeTakeFirst: jest.fn(() => Promise.resolve(undefined)),
          })),
        })),
      });

      const result = await validateEmailAddress('test@example.com');

      expect(result).toEqual([true, '']);
    });
  });

  describe('startPasskeyRegistration', () => {
    it('should generate registration options and save challenge in session', async () => {
      const mockOptions = {
        challenge: 'mock-challenge',
        rpName: 'Development App',
        rpID: 'localhost',
      };

      (generateRegistrationOptions as jest.Mock).mockResolvedValue(mockOptions);
      (sessionStore.save as jest.Mock).mockResolvedValue(Promise.resolve());

      const result = await startPasskeyRegistration('test-user');

      expect(generateRegistrationOptions).toHaveBeenCalledWith({
        rpName: undefined,
        rpID: 'example.com',
        userName: 'test-user',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'preferred',
        },
      });
      expect(sessionStore.save).toHaveBeenCalledWith(expect.anything(), { challenge: 'mock-challenge' });
      expect(result).toEqual(mockOptions);
    });
  });

  describe('startPasskeyLogin', () => {
    it('should generate authentication options and save challenge in session', async () => {
      const mockOptions = {
        challenge: 'mock-challenge',
        rpID: 'example.com',
      };

      (generateAuthenticationOptions as jest.Mock).mockResolvedValue(mockOptions);
      (sessionStore.save as jest.Mock).mockResolvedValue(Promise.resolve());

      const result = await startPasskeyLogin();

      expect(generateAuthenticationOptions).toHaveBeenCalledWith({
        rpID: 'example.com',
        userVerification: 'preferred',
        allowCredentials: [],
      });
      expect(sessionStore.save).toHaveBeenCalledWith(expect.anything(), { challenge: 'mock-challenge' });
      expect(result).toEqual(mockOptions);
    });
  });

  describe('finishPasskeyRegistration', () => {
    it('should register a new user with passkey successfully', async () => {
      const mockRegistration = {
        id: 'cred-id',
        rawId: 'raw-id',
        response: {
          clientDataJSON: 'client-data',
          attestationObject: 'attestation-object',
        },
        type: 'public-key',
      };

      // Mock session with challenge
      (sessionStore.load as jest.Mock).mockResolvedValue({
        challenge: 'mock-challenge',
      });

      // Mock verification success
      (verifyRegistrationResponse as jest.Mock).mockResolvedValue({
        verified: true,
        registrationInfo: {
          credential: {
            id: 'cred-id',
            publicKey: 'public-key',
            counter: 0,
          },
        },
      });

      // Mock db operations
      (db.insertInto as jest.Mock).mockReturnValue({
        values: jest.fn(() => ({
          execute: jest.fn(() => Promise.resolve()),
        })),
      });

      const result = await finishPasskeyRegistration('new@example.com', mockRegistration);

      expect(sessionStore.load).toHaveBeenCalled();
      expect(verifyRegistrationResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          response: mockRegistration,
          expectedChallenge: 'mock-challenge',
          expectedOrigin: 'https://example.com',
          expectedRPID: 'example.com',
        })
      );
      expect(db.insertInto).toHaveBeenCalledTimes(2); // User and Credential inserts
      expect(result).toBe(true);
    });

    it('should return false if no challenge in session', async () => {
      (sessionStore.load as jest.Mock).mockResolvedValue(null);

      const result = await finishPasskeyRegistration('new@example.com', {
        id: 'cred-id',
        rawId: 'raw-id',
        response: {
          clientDataJSON: 'client-data',
          attestationObject: 'attestation-object',
        },
        type: 'public-key',
      } as any);

      expect(result).toBe(false);
      expect(verifyRegistrationResponse).not.toHaveBeenCalled();
    });

    it('should return false if verification fails', async () => {
      const mockRegistration = {
        id: 'cred-id',
        rawId: 'raw-id',
        response: {
          clientDataJSON: 'client-data',
          attestationObject: 'attestation-object',
        },
        type: 'public-key',
      };

      (sessionStore.load as jest.Mock).mockResolvedValue({
        challenge: 'mock-challenge',
      });

      (verifyRegistrationResponse as jest.Mock).mockResolvedValue({
        verified: false,
      });

      const result = await finishPasskeyRegistration('new@example.com', mockRegistration);

      expect(result).toBe(false);
    });
  });

  describe('finishPasskeyLogin', () => {
    it('should log in user with valid passkey', async () => {
      const mockLogin = {
        id: 'cred-id',
        rawId: 'raw-id',
        response: {
          clientDataJSON: 'client-data',
          authenticatorData: 'auth-data',
          signature: 'signature',
          userHandle: 'user-handle',
        },
        type: 'public-key',
      };

      // Mock session with challenge
      (sessionStore.load as jest.Mock).mockResolvedValue({
        challenge: 'mock-challenge',
      });

      // Mock the first db.selectFrom call for credential lookup
      const mockSelectForCredential = jest.fn(() => ({
        selectAll: jest.fn(() => ({
          where: jest.fn(() => ({
            executeTakeFirst: jest.fn(() => Promise.resolve({
              id: 'cred-id',
              userId: 'user-id',
              credentialId: 'cred-id',
              publicKey: 'public-key',
              counter: 0,
            })),
          })),
        })),
      }));

      // Mock the second db.selectFrom call for user lookup
      const mockSelectForUser = jest.fn(() => ({
        selectAll: jest.fn(() => ({
          where: jest.fn(() => ({
            executeTakeFirst: jest.fn(() => Promise.resolve({
              id: 'user-id',
              email: 'user@example.com',
            })),
          })),
        })),
      }));

      // Mock the db.selectFrom to return different mocks for each call
      (db.selectFrom as jest.Mock)
        .mockReturnValueOnce(mockSelectForCredential()) // First call - for credential
        .mockReturnValueOnce(mockSelectForUser());      // Second call - for user

      // Mock verification success
      (verifyAuthenticationResponse as jest.Mock).mockResolvedValue({
        verified: true,
        authenticationInfo: {
          newCounter: 1,
        },
      });

      const result = await finishPasskeyLogin(mockLogin);

      expect(sessionStore.load).toHaveBeenCalled();
      expect(db.selectFrom).toHaveBeenCalledTimes(2); // Credential and User selects
      expect(verifyAuthenticationResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          response: mockLogin,
          expectedChallenge: 'mock-challenge',
          expectedOrigin: 'https://example.com',
          expectedRPID: 'example.com',
        })
      );
      expect(db.updateTable).toHaveBeenCalled(); // Counter update
      expect(sessionStore.save).toHaveBeenCalledWith(expect.anything(), {
        userId: 'user-id',
        challenge: null,
      });
      expect(result).toBe(true);
    });

    it('should return false if no challenge in session', async () => {
      (sessionStore.load as jest.Mock).mockResolvedValue(null);

      const result = await finishPasskeyLogin({
        id: 'cred-id',
        rawId: 'raw-id',
        response: {
          clientDataJSON: 'client-data',
          authenticatorData: 'auth-data',
          signature: 'signature',
          userHandle: 'user-handle',
        },
        type: 'public-key',
      } as any);

      expect(result).toBe(false);
      expect(db.selectFrom).not.toHaveBeenCalled();
    });

    it('should return false if credential not found', async () => {
      (sessionStore.load as jest.Mock).mockResolvedValue({
        challenge: 'mock-challenge',
      });

      // Mock the credential lookup to return null
      const mockSelectForCredential = jest.fn(() => ({
        selectAll: jest.fn(() => ({
          where: jest.fn(() => ({
            executeTakeFirst: jest.fn(() => Promise.resolve(null)),
          })),
        })),
      }));

      // Mock the user lookup (won't be called in this case, but just to be safe in case of changes)
      const mockSelectForUser = jest.fn(() => ({
        selectAll: jest.fn(() => ({
          where: jest.fn(() => ({
            executeTakeFirst: jest.fn(() => Promise.resolve(null)),
          })),
        })),
      }));

      (db.selectFrom as jest.Mock)
        .mockReturnValueOnce(mockSelectForCredential()) // First call - for credential
        .mockReturnValueOnce(mockSelectForUser());      // Second call - for user (won't be reached)

      const result = await finishPasskeyLogin({
        id: 'cred-id',
        rawId: 'raw-id',
        response: {
          clientDataJSON: 'client-data',
          authenticatorData: 'auth-data',
          signature: 'signature',
          userHandle: 'user-handle',
        },
        type: 'public-key',
      } as any);

      expect(result).toBe(false);
      expect(verifyAuthenticationResponse).not.toHaveBeenCalled();
    });

    it('should return false if verification fails', async () => {
      const mockLogin = {
        id: 'cred-id',
        rawId: 'raw-id',
        response: {
          clientDataJSON: 'client-data',
          authenticatorData: 'auth-data',
          signature: 'signature',
          userHandle: 'user-handle',
        },
        type: 'public-key',
      };

      (sessionStore.load as jest.Mock).mockResolvedValue({
        challenge: 'mock-challenge',
      });

      // Mock the first db.selectFrom call for credential lookup
      const mockSelectForCredential = jest.fn(() => ({
        selectAll: jest.fn(() => ({
          where: jest.fn(() => ({
            executeTakeFirst: jest.fn(() => Promise.resolve({
              id: 'cred-id',
              userId: 'user-id',
              credentialId: 'cred-id',
              publicKey: 'public-key',
              counter: 0,
            })),
          })),
        })),
      }));

      // Mock the second db.selectFrom call for user lookup
      const mockSelectForUser = jest.fn(() => ({
        selectAll: jest.fn(() => ({
          where: jest.fn(() => ({
            executeTakeFirst: jest.fn(() => Promise.resolve({
              id: 'user-id',
              email: 'user@example.com',
            })),
          })),
        })),
      }));

      (db.selectFrom as jest.Mock)
        .mockReturnValueOnce(mockSelectForCredential()) // First call - for credential
        .mockReturnValueOnce(mockSelectForUser());      // Second call - for user (won't be reached due to verification failure)

      (verifyAuthenticationResponse as jest.Mock).mockResolvedValue({
        verified: false,
      });

      const result = await finishPasskeyLogin(mockLogin);

      expect(result).toBe(false);
    });
  });
});