import { migrations } from "./migrations";

// Mock the database schema operations with proper fluent API
const mockAddColumn = jest.fn().mockReturnThis();
const mockAddForeignKeyConstraint = jest.fn().mockReturnThis();
const mockAddUniqueConstraint = jest.fn().mockReturnThis();
const mockDropColumn = jest.fn().mockReturnThis();
const mockIfExists = jest.fn().mockReturnThis();
const mockExecute = jest.fn().mockResolvedValue([]);

const mockCreateTable = jest.fn(() => ({
  addColumn: mockAddColumn,
  addForeignKeyConstraint: mockAddForeignKeyConstraint,
  addUniqueConstraint: mockAddUniqueConstraint,
  execute: mockExecute,
}));

const mockAlterTable = jest.fn(() => ({
  addColumn: mockAddColumn,
  dropColumn: mockDropColumn,
  execute: mockExecute,
}));

const mockDropTable = jest.fn(() => ({
  ifExists: mockIfExists,
  execute: mockExecute,
}));

const mockSchema = {
  createTable: mockCreateTable,
  alterTable: mockAlterTable,
  dropTable: mockDropTable,
};

const mockDb = {
  schema: mockSchema,
};

describe("Migrations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("001_initial_schema", () => {
    test("up function should create User table with correct columns", async () => {
      await migrations["001_initial_schema"].up(mockDb);
      
      expect(mockCreateTable).toHaveBeenCalledWith("User");
      expect(mockAddColumn).toHaveBeenCalledTimes(6);
      // Note: Column definition functions are complex to test, so we focus on method calls
      expect(mockExecute).toHaveBeenCalled();
    });

    test("down function should drop User table", async () => {
      await migrations["001_initial_schema"].down(mockDb);
      
      expect(mockDropTable).toHaveBeenCalledWith("User");
      expect(mockIfExists).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe("002_add_credential_table", () => {
    test("up function should create Credential table with correct columns and foreign key", async () => {
      await migrations["002_add_credential_table"].up(mockDb);
      
      expect(mockCreateTable).toHaveBeenCalledWith("Credential");
      expect(mockAddColumn).toHaveBeenCalledTimes(6);
      expect(mockAddForeignKeyConstraint).toHaveBeenCalledWith(
        "Credential_userId_fkey",
        ["userId"],
        "User",
        ["id"]
      );
      expect(mockExecute).toHaveBeenCalled();
    });

    test("down function should drop Credential table", async () => {
      await migrations["002_add_credential_table"].down(mockDb);
      
      expect(mockDropTable).toHaveBeenCalledWith("Credential");
      expect(mockIfExists).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe("003_add_invoice_table", () => {
    test("up function should create Invoice table with correct columns, foreign key, and unique constraint", async () => {
      await migrations["003_add_invoice_table"].up(mockDb);
      
      expect(mockCreateTable).toHaveBeenCalledWith("Invoice");
      expect(mockAddColumn).toHaveBeenCalledTimes(18);
      expect(mockAddForeignKeyConstraint).toHaveBeenCalledWith(
        "Invoice_userId_fkey",
        ["userId"],
        "User",
        ["id"]
      );
      expect(mockAddUniqueConstraint).toHaveBeenCalledWith(
        "Invoice_userId_number_key",
        ["userId", "number"]
      );
      expect(mockExecute).toHaveBeenCalled();
    });

    test("down function should drop Invoice table", async () => {
      await migrations["003_add_invoice_table"].down(mockDb);
      
      expect(mockDropTable).toHaveBeenCalledWith("Invoice");
      expect(mockIfExists).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe("004_add_deleted_at_to_invoice", () => {
    test("up function should add deletedAt column to Invoice table", async () => {
      await migrations["004_add_deleted_at_to_invoice"].up(mockDb);
      
      expect(mockAlterTable).toHaveBeenCalledWith("Invoice");
      expect(mockAddColumn).toHaveBeenCalledWith("deletedAt", "text");
      expect(mockExecute).toHaveBeenCalled();
    });

    test("down function should remove deletedAt column from Invoice table", async () => {
      await migrations["004_add_deleted_at_to_invoice"].down(mockDb);
      
      expect(mockAlterTable).toHaveBeenCalledWith("Invoice");
      expect(mockDropColumn).toHaveBeenCalledWith("deletedAt");
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe("Migration structure validation", () => {
    test("all migrations should have both up and down functions", () => {
      Object.keys(migrations).forEach((migrationKey) => {
        const migration = migrations[migrationKey as keyof typeof migrations];
        expect(migration).toHaveProperty("up");
        expect(migration).toHaveProperty("down");
        expect(typeof migration.up).toBe("function");
        expect(typeof migration.down).toBe("function");
      });
    });


  });
});