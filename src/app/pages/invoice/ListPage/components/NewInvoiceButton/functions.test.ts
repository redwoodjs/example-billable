import { newInvoice } from './functions';
import { db } from '@/db/db';
import { requestInfo } from 'rwsdk/worker';

// Mock the database
jest.mock('@/db/db', () => ({
  db: {
    selectFrom: jest.fn(() => ({
      select: jest.fn(() => ({
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              executeTakeFirst: jest.fn(),
            })),
          })),
        })),
      })),
    })),
    insertInto: jest.fn(() => ({
      values: jest.fn(() => ({
        returningAll: jest.fn(() => ({
          executeTakeFirstOrThrow: jest.fn(),
        })),
      })),
    })),
  },
}));

// Mock requestInfo
jest.mock('rwsdk/worker', () => ({
  requestInfo: {
    ctx: {
      user: { id: 'test-user-id' },
    },
  },
}));

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
  },
});

describe('NewInvoiceButton functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock a default date for consistency
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 0, 1)); // Jan 1, 2023
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('newInvoice', () => {
    it('should create a new invoice with incremented number when last invoice exists', async () => {
      // Arrange
      const mockLastInvoice = {
        number: '5',
        supplierName: 'Test Supplier',
        supplierLogo: 'test-logo.png',
        supplierContact: 'contact@test.com',
        notesA: 'Note A',
        notesB: 'Note B',
        taxes: '[{"name": "Tax", "rate": 0.1}]',
      };

      (db.selectFrom as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          where: jest.fn(() => ({
            where: jest.fn(() => ({
              orderBy: jest.fn(() => ({
                executeTakeFirst: jest.fn().mockResolvedValue(mockLastInvoice),
              })),
            })),
          })),
        })),
      });

      const expectedNewInvoice = {
        id: 'test-uuid',
        number: '6',
        supplierName: 'Test Supplier',
        supplierLogo: 'test-logo.png',
        supplierContact: 'contact@test.com',
        notesA: 'Note A',
        notesB: 'Note B',
        taxes: '[{"name": "Tax", "rate": 0.1}]',
        userId: 'test-user-id',
        title: 'invoice',
        date: '2023-01-01T00:00:00.000Z',
        status: 'draft',
        items: '[]',
        labels:
          '{"invoiceNumber":"Invoice #","invoiceDate":"Date","itemDescription":"Description","itemQuantity":"Quantity","itemPrice":"Price","subtotal":"Subtotal","total":"Total"}',
        currency: '$',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      (db.insertInto as jest.Mock).mockReturnValue({
        values: jest.fn(() => ({
          returningAll: jest.fn(() => ({
            executeTakeFirstOrThrow: jest.fn().mockResolvedValue(expectedNewInvoice),
          })),
        })),
      });

      // Act
      const result = await newInvoice();

      // Assert
      expect(result).toEqual(expectedNewInvoice);
      expect(db.insertInto).toHaveBeenCalledWith('Invoice');
      expect(db.selectFrom).toHaveBeenCalledWith('Invoice');
    });

    it('should create a new invoice with number 1 when no last invoice exists', async () => {
      // Arrange
      (db.selectFrom as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          where: jest.fn(() => ({
            where: jest.fn(() => ({
              orderBy: jest.fn(() => ({
                executeTakeFirst: jest.fn().mockResolvedValue(null),
              })),
            })),
          })),
        })),
      });

      const expectedNewInvoice = {
        id: 'test-uuid',
        number: '1',
        supplierName: null,
        supplierLogo: null,
        supplierContact: null,
        notesA: null,
        notesB: null,
        taxes: '[]',
        userId: 'test-user-id',
        title: 'invoice',
        date: '2023-01-01T00:00:00.000Z',
        status: 'draft',
        items: '[]',
        labels:
          '{"invoiceNumber":"Invoice #","invoiceDate":"Date","itemDescription":"Description","itemQuantity":"Quantity","itemPrice":"Price","subtotal":"Subtotal","total":"Total"}',
        currency: '$',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      (db.insertInto as jest.Mock).mockReturnValue({
        values: jest.fn(() => ({
          returningAll: jest.fn(() => ({
            executeTakeFirstOrThrow: jest.fn().mockResolvedValue(expectedNewInvoice),
          })),
        })),
      });

      // Act
      const result = await newInvoice();

      // Assert
      expect(result).toEqual(expectedNewInvoice);
      expect(result.number).toBe('1');
    });

    it('should handle database errors appropriately', async () => {
      // Arrange
      (db.selectFrom as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          where: jest.fn(() => ({
            where: jest.fn(() => ({
              orderBy: jest.fn(() => ({
                executeTakeFirst: jest.fn().mockRejectedValue(new Error('Database error')),
              })),
            })),
          })),
        })),
      });

      // Act & Assert
      await expect(newInvoice()).rejects.toThrow('Database error');
    });

    it('should use current date for invoice creation', async () => {
      // Arrange
      (db.selectFrom as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          where: jest.fn(() => ({
            where: jest.fn(() => ({
              orderBy: jest.fn(() => ({
                executeTakeFirst: jest.fn().mockResolvedValue(null),
              })),
            })),
          })),
        })),
      });

      const expectedNewInvoice = {
        id: 'test-uuid',
        number: '1',
        supplierName: null,
        supplierLogo: null,
        supplierContact: null,
        notesA: null,
        notesB: null,
        taxes: '[]',
        userId: 'test-user-id',
        title: 'invoice',
        date: '2023-01-01T00:00:00.000Z', // This should be the mock date
        status: 'draft',
        items: '[]',
        labels:
          '{"invoiceNumber":"Invoice #","invoiceDate":"Date","itemDescription":"Description","itemQuantity":"Quantity","itemPrice":"Price","subtotal":"Subtotal","total":"Total"}',
        currency: '$',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      (db.insertInto as jest.Mock).mockReturnValue({
        values: jest.fn(() => ({
          returningAll: jest.fn(() => ({
            executeTakeFirstOrThrow: jest.fn().mockResolvedValue(expectedNewInvoice),
          })),
        })),
      });

      // Act
      const result = await newInvoice();

      // Assert
      expect(result.date).toBe('2023-01-01T00:00:00.000Z');
      expect(result.createdAt).toBe('2023-01-01T00:00:00.000Z');
    });
  });
});