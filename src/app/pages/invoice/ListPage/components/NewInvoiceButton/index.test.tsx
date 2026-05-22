import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { NewInvoiceButton } from "./index";
import { newInvoice } from "./functions";

// Mock the functions module to track calls
jest.mock("./functions", () => ({
  newInvoice: jest.fn(),
}));

describe("NewInvoiceButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the button with correct text", () => {
    render(<NewInvoiceButton />);
    const button = screen.getByRole("button", { name: /New Invoice/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("New Invoice");
  });

  it("is enabled by default", () => {
    render(<NewInvoiceButton />);
    const button = screen.getByRole("button", { name: /New Invoice/i });
    expect(button).not.toBeDisabled();
  });

  it("calls newInvoice function and disables button during transition", async () => {
    const mockInvoice = { id: "test-id-123" };
    (newInvoice as jest.MockedFunction<typeof newInvoice>).mockResolvedValue(mockInvoice);

    render(<NewInvoiceButton />);
    const button = screen.getByRole("button", { name: /New Invoice/i });

    // Initially enabled
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    // Button should be disabled during the transition
    expect(button).toBeDisabled();

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(newInvoice).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });

    // Verify that newInvoice was called
    expect(newInvoice).toHaveBeenCalledTimes(1);

    // After completion, button should be re-enabled
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  it("handles errors in newInvoice function", async () => {
    const mockError = new Error("Test error");
    (newInvoice as jest.MockedFunction<typeof newInvoice>).mockRejectedValue(mockError);

    // Mock console.error to prevent the test from failing due to console errors
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<NewInvoiceButton />);
    const button = screen.getByRole("button", { name: /New Invoice/i });

    fireEvent.click(button);

    // Check that the button becomes disabled during the transition
    expect(button).toBeDisabled();

    // Wait for newInvoice to be called
    await waitFor(() => {
      expect(newInvoice).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });

    // Restore console.error
    consoleSpy.mockRestore();
  });
});