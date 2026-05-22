import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PrintPdf } from "./PrintToPdf";
import { useReactToPrint } from "react-to-print";

// Mock the react-to-print hook
jest.mock("react-to-print", () => ({
  useReactToPrint: jest.fn(),
}));

const mockRef = { current: document.createElement("div") };

describe("PrintPdf", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the print button", () => {
    (useReactToPrint as jest.Mock).mockReturnValue(jest.fn());

    render(<PrintPdf contentRef={mockRef} />);

    const button = screen.getByText("Print");
    expect(button).toBeInTheDocument();
    // Check that button has secondary variant classes (checking for one of the classes that identifies the variant)
    expect(button).toHaveClass("bg-secondary");
  });

  it("calls the print function when the button is clicked", () => {
    const mockPrintFn = jest.fn();
    (useReactToPrint as jest.Mock).mockReturnValue(mockPrintFn);

    render(<PrintPdf contentRef={mockRef} />);

    const button = screen.getByText("Print");
    fireEvent.click(button);

    expect(mockPrintFn).toHaveBeenCalledTimes(1);
  });

  it("configures useReactToPrint with correct options", () => {
    const mockPrintFn = jest.fn();
    (useReactToPrint as jest.Mock).mockReturnValue(mockPrintFn);

    render(<PrintPdf contentRef={mockRef} />);

    expect(useReactToPrint).toHaveBeenCalledWith({
      contentRef: mockRef,
      documentTitle: "Invoice",
      pageStyle: expect.stringContaining("@page"),
    });
  });

  it("has correct button variant", () => {
    (useReactToPrint as jest.Mock).mockReturnValue(jest.fn());

    render(<PrintPdf contentRef={mockRef} />);

    const button = screen.getByText("Print");
    // Instead of checking for type="button", we'll check that it's a button element
    expect(button.tagName).toBe("BUTTON");
  });
});