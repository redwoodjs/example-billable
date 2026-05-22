import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders correctly with default props", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass("flex");
    expect(textarea).toHaveClass("min-h-[60px]");
    expect(textarea).toHaveClass("w-full");
    expect(textarea).toHaveClass("rounded-md");
    expect(textarea).toHaveClass("border");
    expect(textarea).toHaveClass("border-input");
    expect(textarea).toHaveClass("bg-transparent");
    expect(textarea).toHaveClass("px-3");
    expect(textarea).toHaveClass("py-2");
    expect(textarea).toHaveClass("text-base");
    expect(textarea).toHaveClass("shadow-sm");
    expect(textarea).toHaveClass("focus-visible:outline-none");
    expect(textarea).toHaveClass("focus-visible:ring-1");
    expect(textarea).toHaveClass("focus-visible:ring-ring");
    expect(textarea).toHaveClass("disabled:cursor-not-allowed");
    expect(textarea).toHaveClass("disabled:opacity-50");
  });

  it("applies custom className when provided", () => {
    render(<Textarea className="custom-class" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("custom-class");
  });

  it("can receive and display placeholder text", () => {
    render(<Textarea placeholder="Enter text here" />);
    const textarea = screen.getByPlaceholderText("Enter text here");
    expect(textarea).toBeInTheDocument();
  });

  it("can receive and display default value", () => {
    render(<Textarea defaultValue="Default text" />);
    const textarea = screen.getByDisplayValue("Default text");
    expect(textarea).toBeInTheDocument();
  });

  it("can be controlled", async () => {
    const mockOnChange = jest.fn();
    const { rerender } = render(<Textarea value="Initial value" onChange={mockOnChange} />);
    const textarea = screen.getByRole("textbox");

    expect(textarea).toHaveValue("Initial value");

    // Try to change the value (this would be done by the parent component in a controlled scenario)
    rerender(<Textarea value="New value" onChange={mockOnChange} />);
    expect(textarea).toHaveValue("New value");

    // Textarea should be controlled, so direct input should trigger onChange
    await userEvent.type(textarea, " appended");
    // For controlled components, the value should remain as managed by the parent component
    // But onChange should have been called
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("responds to user input in uncontrolled mode", async () => {
    const user = userEvent.setup();
    render(<Textarea defaultValue="Initial" />);
    const textarea = screen.getByRole("textbox");

    expect(textarea).toHaveValue("Initial");
    await user.type(textarea, " more text");
    expect(textarea).toHaveValue("Initial more text");
  });

  it("can be disabled", () => {
    render(<Textarea disabled={true} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass("disabled:cursor-not-allowed");
    expect(textarea).toHaveClass("disabled:opacity-50");
  });

  it("applies additional props correctly", () => {
    render(<Textarea data-testid="test-textarea" aria-label="Test textarea" />);
    const textarea = screen.getByLabelText("Test textarea");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("data-testid", "test-textarea");
  });

  it("has the correct base attributes", () => {
    render(<Textarea name="test-name" id="test-id" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("name", "test-name");
    expect(textarea).toHaveAttribute("id", "test-id");
  });
});