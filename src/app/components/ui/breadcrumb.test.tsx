import * as React from "react";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";

describe("Breadcrumb Components", () => {
  describe("Breadcrumb", () => {
    it("renders a nav element with correct attributes", () => {
      render(
        <Breadcrumb data-testid="breadcrumb">
          <BreadcrumbList>Content</BreadcrumbList>
        </Breadcrumb>
      );

      const nav = screen.getByTestId("breadcrumb");
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe("NAV");
      expect(nav).toHaveAttribute("aria-label", "breadcrumb");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLElement>();
      render(
        <Breadcrumb ref={ref} data-testid="breadcrumb">
          <BreadcrumbList>Content</BreadcrumbList>
        </Breadcrumb>
      );

      expect(ref.current).toBeInTheDocument();
    });

    it("accepts and applies className", () => {
      render(
        <Breadcrumb className="custom-class" data-testid="breadcrumb">
          <BreadcrumbList>Content</BreadcrumbList>
        </Breadcrumb>
      );

      const nav = screen.getByTestId("breadcrumb");
      expect(nav).toHaveClass("custom-class");
    });

    it("accepts additional props", () => {
      render(
        <Breadcrumb id="test-breadcrumb" data-testid="breadcrumb">
          <BreadcrumbList>Content</BreadcrumbList>
        </Breadcrumb>
      );

      const nav = screen.getByTestId("breadcrumb");
      expect(nav).toHaveAttribute("id", "test-breadcrumb");
    });
  });

  describe("BreadcrumbList", () => {
    it("renders an ol element with correct classes", () => {
      render(<BreadcrumbList data-testid="breadcrumb-list" />);

      const ol = screen.getByTestId("breadcrumb-list");
      expect(ol).toBeInTheDocument();
      expect(ol.tagName).toBe("OL");
      expect(ol).toHaveClass("flex", "flex-wrap", "items-center", "gap-1.5", "break-words", "text-sm", "text-muted-foreground");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLOListElement>();
      render(<BreadcrumbList ref={ref} data-testid="breadcrumb-list" />);

      expect(ref.current).toBeInTheDocument();
    });

    it("accepts and applies className", () => {
      render(
        <BreadcrumbList className="custom-class" data-testid="breadcrumb-list" />
      );

      const ol = screen.getByTestId("breadcrumb-list");
      expect(ol).toHaveClass("custom-class");
      expect(ol).toHaveClass("flex"); // Original classes should still be present
    });

    it("accepts additional props", () => {
      render(
        <BreadcrumbList id="test-list" data-testid="breadcrumb-list" />
      );

      const ol = screen.getByTestId("breadcrumb-list");
      expect(ol).toHaveAttribute("id", "test-list");
    });
  });

  describe("BreadcrumbItem", () => {
    it("renders a li element with correct classes", () => {
      render(<BreadcrumbItem data-testid="breadcrumb-item" />);

      const li = screen.getByTestId("breadcrumb-item");
      expect(li).toBeInTheDocument();
      expect(li.tagName).toBe("LI");
      expect(li).toHaveClass("inline-flex", "items-center", "gap-1.5");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLLIElement>();
      render(<BreadcrumbItem ref={ref} data-testid="breadcrumb-item" />);

      expect(ref.current).toBeInTheDocument();
    });

    it("accepts and applies className", () => {
      render(
        <BreadcrumbItem className="custom-class" data-testid="breadcrumb-item" />
      );

      const li = screen.getByTestId("breadcrumb-item");
      expect(li).toHaveClass("custom-class");
      expect(li).toHaveClass("inline-flex"); // Original classes should still be present
    });

    it("accepts additional props", () => {
      render(
        <BreadcrumbItem id="test-item" data-testid="breadcrumb-item" />
      );

      const li = screen.getByTestId("breadcrumb-item");
      expect(li).toHaveAttribute("id", "test-item");
    });
  });

  describe("BreadcrumbLink", () => {
    it("renders an a element with correct classes by default", () => {
      render(<BreadcrumbLink data-testid="breadcrumb-link">Link</BreadcrumbLink>);

      const a = screen.getByTestId("breadcrumb-link");
      expect(a).toBeInTheDocument();
      expect(a.tagName).toBe("A");
      expect(a).toHaveClass("transition-colors", "hover:text-foreground");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(<BreadcrumbLink ref={ref} data-testid="breadcrumb-link">Link</BreadcrumbLink>);

      expect(ref.current).toBeInTheDocument();
    });

    it("accepts and applies className", () => {
      render(
        <BreadcrumbLink className="custom-class" data-testid="breadcrumb-link">
          Link
        </BreadcrumbLink>
      );

      const a = screen.getByTestId("breadcrumb-link");
      expect(a).toHaveClass("custom-class");
      expect(a).toHaveClass("transition-colors"); // Original classes should still be present
    });

    it("accepts additional props", () => {
      render(
        <BreadcrumbLink href="/test" id="test-link" data-testid="breadcrumb-link">
          Link
        </BreadcrumbLink>
      );

      const a = screen.getByTestId("breadcrumb-link");
      expect(a).toHaveAttribute("href", "/test");
      expect(a).toHaveAttribute("id", "test-link");
    });

    it("renders as child component when asChild is true", () => {
      render(
        <BreadcrumbLink asChild data-testid="breadcrumb-link">
          <button type="button">Button Link</button>
        </BreadcrumbLink>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Button Link");
      expect(button).toHaveClass("transition-colors", "hover:text-foreground");
    });
  });

  describe("BreadcrumbPage", () => {
    it("renders a span element with correct attributes and classes", () => {
      render(<BreadcrumbPage data-testid="breadcrumb-page">Page</BreadcrumbPage>);

      const span = screen.getByTestId("breadcrumb-page");
      expect(span).toBeInTheDocument();
      expect(span.tagName).toBe("SPAN");
      expect(span).toHaveAttribute("role", "link");
      expect(span).toHaveAttribute("aria-disabled", "true");
      expect(span).toHaveAttribute("aria-current", "page");
      expect(span).toHaveClass("font-normal", "text-foreground");
    });

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<BreadcrumbPage ref={ref} data-testid="breadcrumb-page">Page</BreadcrumbPage>);

      expect(ref.current).toBeInTheDocument();
    });

    it("accepts and applies className", () => {
      render(
        <BreadcrumbPage className="custom-class" data-testid="breadcrumb-page">
          Page
        </BreadcrumbPage>
      );

      const span = screen.getByTestId("breadcrumb-page");
      expect(span).toHaveClass("custom-class");
      expect(span).toHaveClass("font-normal"); // Original classes should still be present
    });

    it("accepts additional props", () => {
      render(
        <BreadcrumbPage id="test-page" data-testid="breadcrumb-page">
          Page
        </BreadcrumbPage>
      );

      const span = screen.getByTestId("breadcrumb-page");
      expect(span).toHaveAttribute("id", "test-page");
    });
  });

  describe("BreadcrumbSeparator", () => {
    it("renders a li element with correct attributes and content", () => {
      render(<BreadcrumbSeparator data-testid="breadcrumb-separator" />);

      const li = screen.getByTestId("breadcrumb-separator");
      expect(li).toBeInTheDocument();
      expect(li.tagName).toBe("LI");
      expect(li).toHaveAttribute("role", "presentation");
      expect(li).toHaveAttribute("aria-hidden", "true");
      expect(li).toHaveTextContent("/");
    });

    it("accepts and applies className", () => {
      render(
        <BreadcrumbSeparator className="custom-class" data-testid="breadcrumb-separator" />
      );

      const li = screen.getByTestId("breadcrumb-separator");
      expect(li).toHaveClass("custom-class");
      expect(li).toHaveClass("[&>svg]:w-3.5", "[&>svg]:h-3.5"); // Original classes should still be present
    });

    it("accepts additional props and defaults to '/' separator", () => {
      render(
        <BreadcrumbSeparator id="test-separator" data-testid="breadcrumb-separator">
          &gt;
        </BreadcrumbSeparator>
      );

      const li = screen.getByTestId("breadcrumb-separator");
      expect(li).toHaveAttribute("id", "test-separator");
      expect(li).toHaveTextContent("/"); // The component defaults to '/' regardless of children
    });
  });

  describe("BreadcrumbEllipsis", () => {
    it("renders a span element with correct attributes and content", () => {
      render(<BreadcrumbEllipsis data-testid="breadcrumb-ellipsis" />);

      const span = screen.getByTestId("breadcrumb-ellipsis");
      expect(span).toBeInTheDocument();
      expect(span.tagName).toBe("SPAN");
      expect(span).toHaveAttribute("role", "presentation");
      expect(span).toHaveAttribute("aria-hidden", "true");
    });

    it("contains a screen reader only element with 'More' text", () => {
      render(<BreadcrumbEllipsis data-testid="breadcrumb-ellipsis" />);

      const srOnly = screen.getByText("More");
      expect(srOnly).toBeInTheDocument();
      expect(srOnly).toHaveClass("sr-only");
    });

    it("accepts and applies className", () => {
      render(
        <BreadcrumbEllipsis className="custom-class" data-testid="breadcrumb-ellipsis" />
      );

      const span = screen.getByTestId("breadcrumb-ellipsis");
      expect(span).toHaveClass("custom-class");
      expect(span).toHaveClass("flex", "h-9", "w-9", "items-center", "justify-center"); // Original classes should still be present
    });

    it("accepts additional props", () => {
      render(
        <BreadcrumbEllipsis id="test-ellipsis" data-testid="breadcrumb-ellipsis" />
      );

      const span = screen.getByTestId("breadcrumb-ellipsis");
      expect(span).toHaveAttribute("id", "test-ellipsis");
    });
  });

  describe("Complete Breadcrumb Example", () => {
    it("renders a complete breadcrumb structure", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      // Check that all elements are present
      expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);

      // Check links and page
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Components")).toBeInTheDocument(); // Looking for the text "Components", not "/components"
      expect(screen.getByText("Breadcrumb")).toBeInTheDocument();

      // Check separators
      const separators = screen.getAllByText("/");
      expect(separators).toHaveLength(2);
    });
  });
});