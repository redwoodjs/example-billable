import React from "react";
import { render, screen } from "@testing-library/react";
import { Button, buttonVariants } from "./button";
import { describe, expect, it } from "@jest/globals";

describe("Button", () => {
  it("renders correctly with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("inline-flex");
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("h-9");
  });

  it("renders with custom className", () => {
    render(<Button className="custom-class">Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("custom-class");
  });

  it("applies correct variant classes", () => {
    render(<Button variant="destructive">Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("bg-destructive");
    expect(button).toHaveClass("text-destructive-foreground");
  });

  it("applies correct size classes", () => {
    render(<Button size="lg">Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("h-10");
    expect(button).toHaveClass("px-8");
  });

  it("forwards ref correctly", () => {
    const refCallback = jest.fn();
    render(<Button ref={refCallback}>Click me</Button>);
    expect(refCallback).toHaveBeenCalled();
  });

  it("handles disabled state", () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none");
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("forwards additional props", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} type="submit" data-testid="test-button">
        Click me
      </Button>,
    );
    const button = screen.getByTestId("test-button");
    expect(button).toHaveAttribute("type", "submit");
    
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: /link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveClass("inline-flex"); // inherits button classes
  });
});

describe("buttonVariants", () => {
  it("generates correct CSS classes for default variant", () => {
    const classes = buttonVariants();
    expect(classes).toContain("inline-flex");
    expect(classes).toContain("bg-primary");
    expect(classes).toContain("h-9");
  });

  it("generates correct CSS classes for variant combinations", () => {
    const classes = buttonVariants({ variant: "outline", size: "sm" });
    expect(classes).toContain("border");
    expect(classes).toContain("h-8");
    expect(classes).toContain("text-xs");
  });

  it("generates correct CSS classes with className override", () => {
    const classes = buttonVariants({ className: "custom-class" });
    expect(classes).toContain("custom-class");
  });
});