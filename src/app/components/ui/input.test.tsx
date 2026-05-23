import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  test("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("passes custom class names", () => {
    const className = "custom-class";
    render(<Input className={className} />);
    
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toHaveClass(className);
  });

  test("renders with default props", () => {
    render(<Input />);
    
    const inputElement = screen.getByRole("textbox");
    
    // Check default classes
    expect(inputElement).toHaveClass("flex");
    expect(inputElement).toHaveClass("h-9");
    expect(inputElement).toHaveClass("w-full");
    expect(inputElement).toHaveClass("rounded-md");
    expect(inputElement).toHaveClass("border");
    expect(inputElement).toHaveClass("bg-transparent");
    expect(inputElement).toHaveClass("px-3");
    expect(inputElement).toHaveClass("py-1");
    expect(inputElement).toHaveClass("text-base");
    expect(inputElement).toHaveClass("shadow-sm");
  });

  test("applies correct type attribute", () => {
    render(<Input type="email" />);
    
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toHaveAttribute("type", "email");
  });

  test("handles text input type by default", () => {
    render(<Input />);

    const inputElement = screen.getByRole("textbox");
    // When no type prop is provided to the Input component,
    // it passes type={undefined} to the underlying input element
    // This results in no type attribute being set in the DOM
    expect(inputElement.getAttribute('type')).toBeNull(); // Attribute is not set, so it's null
  });

  test("can receive and display a value", () => {
    const value = "Test Value";
    render(<Input value={value} readOnly />);
    
    const inputElement = screen.getByDisplayValue(value);
    expect(inputElement).toBeInTheDocument();
  });

  test("forwards ref correctly", () => {
    const mockRef = jest.fn();
    render(<Input ref={mockRef} />);
    
    const inputElement = screen.getByRole("textbox");
    expect(mockRef).toHaveBeenCalledWith(inputElement);
  });

  test("can be disabled", () => {
    render(<Input disabled />);
    
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toBeDisabled();
    expect(inputElement).toHaveClass("disabled:cursor-not-allowed");
    expect(inputElement).toHaveClass("disabled:opacity-50");
  });

  test("handles placeholder text", () => {
    const placeholder = "Enter text here";
    render(<Input placeholder={placeholder} />);
    
    const inputElement = screen.getByPlaceholderText(placeholder);
    expect(inputElement).toBeInTheDocument();
  });

  test("triggers onChange event", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const inputElement = screen.getByRole("textbox");
    await user.type(inputElement, "test");
    
    expect(handleChange).toHaveBeenCalledTimes(4); // One for each character typed
  });

  test("respects additional props", () => {
    const name = "test-name";
    const id = "test-id";
    render(<Input name={name} id={id} />);
    
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toHaveAttribute("name", name);
    expect(inputElement).toHaveAttribute("id", id);
  });

  test("renders with empty className", () => {
    render(<Input className="" />);
    
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toBeInTheDocument();
  });
});