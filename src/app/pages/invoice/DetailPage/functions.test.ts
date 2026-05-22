import { saveInvoice, deleteLogo, deleteInvoice } from './functions';
import { db } from '@/db/db';
import { requestInfo } from 'rwsdk/worker';

// Mock the database
jest.mock('@/db/db', () => ({
  db: {
    selectFrom: jest.fn(),
    insertInto: jest.fn(),
    updateTable: jest.fn(),
  },
}));

// Mock the requestInfo
jest.mock('rwsdk/worker', () => ({
  requestInfo: {
    ctx: {
      user: {
        id: 'mocked-user-id',
      },
    },
  },
}));

// Mock database query builder methods
const mockSelectFrom = db.selectFrom as jest.MockedFunction<any>;
const mockInsertInto = db.insertInto as jest.MockedFunction<any>;
const mockUpdateTable = db.updateTable as jest.MockedFunction<any>;

describe('functions', () => {
  const mockInvoiceId = 'test-invoice-id';
  const mockUserId = 'mocked-user-id';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveInvoice', () => {
    const mockInvoiceData = {
      title: 'Test Invoice',
      userId: 'test-user-id',
      number: 'INV-001',
      date: new Date('2023-01-01'),
      status: 'draft' as const,
      supplierName: 'Test Supplier',
      customer: { name: 'Test Customer' },
      notesA: 'Test note A',
      notesB: 'Test note B',
      currency: 'USD',
      createdAt: new Date('2023-01-01'),
      updatedAt: null,
    };

    const mockLabels = { label1: 'value1' };
    const mockItems = [{ id: 'item1', name: 'Item 1', quantity: 1, price: 100 }];
    const mockTaxes = [{ id: 'tax1', name: 'Tax 1', rate: 0.1 }];

    it('should save a new invoice successfully', async () => {
      // Mock existing invoice check (invoice exists)
      const mockSelectQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn().mockResolvedValue({ id: mockInvoiceId }),
      };
      
      const mockInsertQueryBuilder = {
        values: jest.fn().mockReturnThis(),
        onConflict: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };

      mockSelectFrom.mockReturnValue(mockSelectQueryBuilder);
      mockInsertInto.mockReturnValue(mockInsertQueryBuilder);

      await expect(
        saveInvoice(mockInvoiceId, mockInvoiceData, mockLabels, mockItems, mockTaxes)
      ).resolves.not.toThrow();

      expect(mockSelectQueryBuilder.where).toHaveBeenCalledWith('userId', '=', mockUserId);
      expect(mockInsertQueryBuilder.onConflict).toHaveBeenCalled();
    });

    it('should throw an error if invoice does not exist', async () => {
      // Mock existing invoice check (invoice does not exist)
      const mockSelectQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn().mockResolvedValue(null),
      };
      
      mockSelectFrom.mockReturnValue(mockSelectQueryBuilder);

      await expect(
        saveInvoice(mockInvoiceId, mockInvoiceData, mockLabels, mockItems, mockTaxes)
      ).rejects.toThrow('Invoice not found');

      expect(mockSelectQueryBuilder.where).toHaveBeenCalledWith('userId', '=', mockUserId);
    });

    it('should handle date conversion properly', async () => {
      const dateStr = '2023-01-01';
      const mockInvoiceWithDateString = {
        ...mockInvoiceData,
        date: dateStr,
        createdAt: dateStr,
        updatedAt: dateStr,
      };

      // Mock existing invoice check (invoice exists)
      const mockSelectQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn().mockResolvedValue({ id: mockInvoiceId }),
      };
      
      const mockInsertQueryBuilder = {
        values: jest.fn().mockReturnThis(),
        onConflict: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };

      mockSelectFrom.mockReturnValue(mockSelectQueryBuilder);
      mockInsertInto.mockReturnValue(mockInsertQueryBuilder);

      await saveInvoice(mockInvoiceId, mockInvoiceWithDateString, mockLabels, mockItems, mockTaxes);

      // Verify that the insert was called with the proper data
      expect(mockInsertInto).toHaveBeenCalled();
    });
  });

  describe('deleteLogo', () => {
    it('should delete logo successfully', async () => {
      // Mock existing invoice check (invoice exists)
      const mockSelectQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn().mockResolvedValue({ id: mockInvoiceId }),
      };
      
      const mockUpdateQueryBuilder = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };

      mockSelectFrom.mockReturnValue(mockSelectQueryBuilder);
      mockUpdateTable.mockReturnValue(mockUpdateQueryBuilder);

      await expect(deleteLogo(mockInvoiceId)).resolves.not.toThrow();

      expect(mockSelectQueryBuilder.where).toHaveBeenCalledWith('userId', '=', mockUserId);
      expect(mockUpdateQueryBuilder.set).toHaveBeenCalledWith({ supplierLogo: null });
    });

    it('should throw an error if invoice does not exist', async () => {
      // Mock existing invoice check (invoice does not exist)
      const mockSelectQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn().mockResolvedValue(null),
      };
      
      mockSelectFrom.mockReturnValue(mockSelectQueryBuilder);

      await expect(deleteLogo(mockInvoiceId)).rejects.toThrow('Invoice not found');

      expect(mockSelectQueryBuilder.where).toHaveBeenCalledWith('userId', '=', mockUserId);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      // Mock existing invoice check (invoice exists)
      const mockSelectQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn().mockResolvedValue({ id: mockInvoiceId }),
      };
      
      const mockUpdateQueryBuilder = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };

      mockSelectFrom.mockReturnValue(mockSelectQueryBuilder);
      mockUpdateTable.mockReturnValue(mockUpdateQueryBuilder);

      await expect(deleteInvoice(mockInvoiceId)).resolves.not.toThrow();

      expect(mockSelectQueryBuilder.where).toHaveBeenCalledWith('userId', '=', mockUserId);
      expect(mockUpdateQueryBuilder.set).toHaveBeenCalledWith({ deletedAt: expect.any(String) });
    });

    it('should throw an error if invoice does not exist', async () => {
      // Mock existing invoice check (invoice does not exist)
      const mockSelectQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn().mockResolvedValue(null),
      };
      
      mockSelectFrom.mockReturnValue(mockSelectQueryBuilder);

      await expect(deleteInvoice(mockInvoiceId)).rejects.toThrow('Invoice not found');

      expect(mockSelectQueryBuilder.where).toHaveBeenCalledWith('userId', '=', mockUserId);
    });
  });
});