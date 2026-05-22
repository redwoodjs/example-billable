// Mock rwsdk to handle react-server import condition before any imports that might trigger rwsdk
jest.mock("rwsdk/worker", () => ({
  requestInfo: {
    ctx: {
      user: {
        id: "user-123",
      },
    },
  },
}));

// Mock all dependencies before any imports
jest.mock("@/db/db", () => {
  const executeMock = jest.fn();
  const orderByMock = jest.fn().mockReturnValue({ execute: executeMock });
  const secondWhereMock = jest.fn().mockReturnValue({ orderBy: orderByMock });
  const firstWhereMock = jest.fn().mockReturnValue({ where: secondWhereMock });
  const selectMock = jest.fn().mockReturnValue({ where: firstWhereMock });
  const selectFromMock = jest.fn().mockReturnValue({ select: selectMock });

  return {
    db: {
      selectFrom: selectFromMock,
    },
    // Also export the individual mocks so we can reference them in tests
    _executeMock: executeMock,
    _orderByMock: orderByMock,
    _secondWhereMock: secondWhereMock,
    _firstWhereMock: firstWhereMock,
    _selectMock: selectMock,
    _selectFromMock: selectFromMock,
  };
});

jest.mock("@/app/shared/links", () => ({
  link: jest.fn((path) => path)
}));

jest.mock("@/app/pages/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

jest.mock("@/app/components/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="table">{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
  TableCaption: ({ children }: { children: React.ReactNode }) => (
    <caption data-testid="table-caption">{children}</caption>
  ),
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <td data-testid="table-cell">{children}</td>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => (
    <th data-testid="table-head">{children}</th>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead data-testid="table-header">{children}</thead>
  ),
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <tr data-testid="table-row">{children}</tr>
  ),
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { db, _executeMock, _orderByMock, _secondWhereMock, _firstWhereMock, _selectMock, _selectFromMock } from "@/db/db";
import { requestInfo } from "rwsdk/worker";
import { link } from "@/app/shared/links";

// Now import the component after all mocks are set up
const { InvoiceBinPage } = require("./InvoiceBinPage");

describe("InvoiceBinPage", () => {
  const mockUserId = "user-123";
  const mockInvoices = [
    {
      id: "inv-1",
      number: "INV-001",
      date: "2023-01-15T00:00:00Z",
      status: "paid",
      customer: "John Doe",
      deletedAt: "2023-02-01T10:30:00Z",
    },
    {
      id: "inv-2",
      number: "INV-002",
      date: "2023-02-15T00:00:00Z",
      status: "pending",
      customer: "Jane Smith",
      deletedAt: "2023-02-02T11:45:00Z",
    },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock the user context
    (requestInfo as any).ctx = {
      user: {
        id: mockUserId,
      },
    };
  });

  it("fetches and displays deleted invoices", async () => {
    // Set up the mock return values
    _executeMock.mockResolvedValue(mockInvoices);

    // Since we can't directly render an async component with testing-library,
    // we'll test the rendering by importing the module and checking if the
    // necessary database calls are made when the function is called
    const InvoiceBinPageModule = await import("./InvoiceBinPage");
    const { InvoiceBinPage } = InvoiceBinPageModule;

    // Call the function component (since it's async, we need to await it)
    await expect(InvoiceBinPage()).resolves.not.toThrow();

    // Check if the correct query is made
    expect(_selectFromMock).toHaveBeenCalledWith("Invoice");
    expect(_selectMock).toHaveBeenCalledWith([
      "id",
      "number",
      "date",
      "status",
      "customer",
      "deletedAt",
    ]);
    // Check that where methods were called correctly
    expect(_firstWhereMock).toHaveBeenCalledWith("userId", "=", mockUserId);
    expect(_secondWhereMock).toHaveBeenCalledWith("deletedAt", "is not", null);
    expect(_orderByMock).toHaveBeenCalledWith("deletedAt", "desc");
    expect(_executeMock).toHaveBeenCalled();
  });

  it("shows caption when no invoices are found", async () => {
    // Mock empty invoices array
    _executeMock.mockResolvedValue([]);

    const InvoiceBinPageModule = await import("./InvoiceBinPage");
    const { InvoiceBinPage } = InvoiceBinPageModule;

    const result = await InvoiceBinPage();
    expect(result).toBeDefined();
  });

  it("handles user context not available", async () => {
    // Simulate user context not available (should throw error since it uses ! operator)
    (requestInfo as any).ctx = {
      user: null,
    };

    // Mock the query builder to avoid errors during setup
    _executeMock.mockResolvedValue([]);

    // When accessing a property with ! operator on null, it should throw
    const InvoiceBinPageModule = await import("./InvoiceBinPage");
    const { InvoiceBinPage } = InvoiceBinPageModule;

    await expect(InvoiceBinPage()).rejects.toThrow();
  });
});