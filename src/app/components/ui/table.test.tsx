import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table";

describe("Table Components", () => {
  describe("Table", () => {
    it("renders a table element inside a div wrapper", () => {
      render(
        <Table data-testid="test-table">
          <TableBody>
            <TableRow>
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const tableWrapper = screen.getByTestId("test-table").parentElement;
      const table = screen.getByTestId("test-table");
      
      expect(tableWrapper).toBeInTheDocument();
      expect(tableWrapper).toHaveClass("relative w-full overflow-auto");
      expect(table).toBeInTheDocument();
      expect(table.tagName).toBe("TABLE");
    });

    it("applies custom className", () => {
      render(
        <Table className="custom-class" data-testid="test-table">
          <TableBody>
            <TableRow>
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByTestId("test-table");
      expect(table).toHaveClass("custom-class");
      expect(table).toHaveClass("w-full caption-bottom text-sm");
    });

    it("passes additional props to the table element", () => {
      render(
        <Table id="test-id" data-testid="test-table">
          <TableBody>
            <TableRow>
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByTestId("test-table");
      expect(table).toHaveAttribute("id", "test-id");
    });
  });

  describe("TableHeader", () => {
    it("renders a thead element", () => {
      render(
        <table>
          <TableHeader data-testid="test-header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>
      );

      const header = screen.getByTestId("test-header");
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe("THEAD");
    });

    it("applies custom className", () => {
      render(
        <table>
          <TableHeader className="custom-header-class" data-testid="test-header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>
      );

      const header = screen.getByTestId("test-header");
      expect(header).toHaveClass("custom-header-class");
      expect(header).toHaveClass("[&_tr]:border-b");
    });

    it("passes additional props to the thead element", () => {
      render(
        <table>
          <TableHeader id="header-id" data-testid="test-header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>
      );

      const header = screen.getByTestId("test-header");
      expect(header).toHaveAttribute("id", "header-id");
    });
  });

  describe("TableBody", () => {
    it("renders a tbody element", () => {
      render(
        <table>
          <TableBody data-testid="test-body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );

      const body = screen.getByTestId("test-body");
      expect(body).toBeInTheDocument();
      expect(body.tagName).toBe("TBODY");
    });

    it("applies custom className", () => {
      render(
        <table>
          <TableBody className="custom-body-class" data-testid="test-body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );

      const body = screen.getByTestId("test-body");
      expect(body).toHaveClass("custom-body-class");
      expect(body).toHaveClass("[&_tr:last-child]:border-0");
    });

    it("passes additional props to the tbody element", () => {
      render(
        <table>
          <TableBody id="body-id" data-testid="test-body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>
      );

      const body = screen.getByTestId("test-body");
      expect(body).toHaveAttribute("id", "body-id");
    });
  });

  describe("TableFooter", () => {
    it("renders a tfoot element", () => {
      render(
        <table>
          <TableFooter data-testid="test-footer">
            <TableRow>
              <TableCell>Footer Cell</TableCell>
            </TableRow>
          </TableFooter>
        </table>
      );

      const footer = screen.getByTestId("test-footer");
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe("TFOOT");
    });

    it("applies custom className", () => {
      render(
        <table>
          <TableFooter className="custom-footer-class" data-testid="test-footer">
            <TableRow>
              <TableCell>Footer Cell</TableCell>
            </TableRow>
          </TableFooter>
        </table>
      );

      const footer = screen.getByTestId("test-footer");
      expect(footer).toHaveClass("custom-footer-class");
      expect(footer).toHaveClass("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0");
    });

    it("passes additional props to the tfoot element", () => {
      render(
        <table>
          <TableFooter id="footer-id" data-testid="test-footer">
            <TableRow>
              <TableCell>Footer Cell</TableCell>
            </TableRow>
          </TableFooter>
        </table>
      );

      const footer = screen.getByTestId("test-footer");
      expect(footer).toHaveAttribute("id", "footer-id");
    });
  });

  describe("TableRow", () => {
    it("renders a tr element", () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="test-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>
      );

      const row = screen.getByTestId("test-row");
      expect(row).toBeInTheDocument();
      expect(row.tagName).toBe("TR");
    });

    it("applies custom className", () => {
      render(
        <table>
          <tbody>
            <TableRow className="custom-row-class" data-testid="test-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>
      );

      const row = screen.getByTestId("test-row");
      expect(row).toHaveClass("custom-row-class");
      expect(row).toHaveClass("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted");
    });

    it("passes additional props to the tr element", () => {
      render(
        <table>
          <tbody>
            <TableRow id="row-id" data-testid="test-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>
      );

      const row = screen.getByTestId("test-row");
      expect(row).toHaveAttribute("id", "row-id");
    });

    it("applies selected state class", () => {
      render(
        <table>
          <tbody>
            <TableRow data-state="selected" data-testid="test-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>
      );

      const row = screen.getByTestId("test-row");
      expect(row).toHaveAttribute("data-state", "selected");
    });
  });

  describe("TableHead", () => {
    it("renders a th element", () => {
      render(
        <table>
          <thead>
            <TableRow>
              <TableHead data-testid="test-head">Header</TableHead>
            </TableRow>
          </thead>
        </table>
      );

      const head = screen.getByTestId("test-head");
      expect(head).toBeInTheDocument();
      expect(head.tagName).toBe("TH");
    });

    it("applies custom className", () => {
      render(
        <table>
          <thead>
            <TableRow>
              <TableHead className="custom-head-class" data-testid="test-head">
                Header
              </TableHead>
            </TableRow>
          </thead>
        </table>
      );

      const head = screen.getByTestId("test-head");
      expect(head).toHaveClass("custom-head-class");
      expect(head).toHaveClass("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]");
    });

    it("passes additional props to the th element", () => {
      render(
        <table>
          <thead>
            <TableRow>
              <TableHead id="head-id" data-testid="test-head">
                Header
              </TableHead>
            </TableRow>
          </thead>
        </table>
      );

      const head = screen.getByTestId("test-head");
      expect(head).toHaveAttribute("id", "head-id");
    });
  });

  describe("TableCell", () => {
    it("renders a td element", () => {
      render(
        <table>
          <tbody>
            <TableRow>
              <TableCell data-testid="test-cell">Cell Content</TableCell>
            </TableRow>
          </tbody>
        </table>
      );

      const cell = screen.getByTestId("test-cell");
      expect(cell).toBeInTheDocument();
      expect(cell.tagName).toBe("TD");
    });

    it("applies custom className", () => {
      render(
        <table>
          <tbody>
            <TableRow>
              <TableCell className="custom-cell-class" data-testid="test-cell">
                Cell Content
              </TableCell>
            </TableRow>
          </tbody>
        </table>
      );

      const cell = screen.getByTestId("test-cell");
      expect(cell).toHaveClass("custom-cell-class");
      expect(cell).toHaveClass("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]");
    });

    it("passes additional props to the td element", () => {
      render(
        <table>
          <tbody>
            <TableRow>
              <TableCell id="cell-id" data-testid="test-cell">
                Cell Content
              </TableCell>
            </TableRow>
          </tbody>
        </table>
      );

      const cell = screen.getByTestId("test-cell");
      expect(cell).toHaveAttribute("id", "cell-id");
    });
  });

  describe("TableCaption", () => {
    it("renders a caption element", () => {
      render(
        <Table>
          <caption data-testid="test-caption">Table Caption</caption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const caption = screen.getByTestId("test-caption");
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe("CAPTION");
    });

    it("applies custom className", () => {
      render(
        <Table>
          <TableCaption className="custom-caption-class" data-testid="test-caption">
            Table Caption
          </TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const caption = screen.getByTestId("test-caption");
      expect(caption).toHaveClass("custom-caption-class");
      expect(caption).toHaveClass("mt-4 text-sm text-muted-foreground");
    });

    it("passes additional props to the caption element", () => {
      render(
        <Table>
          <TableCaption id="caption-id" data-testid="test-caption">
            Table Caption
          </TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const caption = screen.getByTestId("test-caption");
      expect(caption).toHaveAttribute("id", "caption-id");
    });
  });

  describe("Complete Table Structure", () => {
    it("renders a complete table with all components", () => {
      render(
        <Table>
          <TableCaption>Test Table Caption</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Item 1</TableCell>
              <TableCell>$100</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Item 2</TableCell>
              <TableCell>$200</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>$300</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText("Test Table Caption")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Value")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("$100")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("$200")).toBeInTheDocument();
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText("$300")).toBeInTheDocument();
    });
  });
});