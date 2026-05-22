import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./dialog";

describe("Dialog Component", () => {
  const mockTriggerText = "Open Dialog";
  const mockTitle = "Dialog Title";
  const mockDescription = "Dialog Description";
  const mockContent = "Dialog Content";

  const TestDialog = () => (
    <Dialog>
      <DialogTrigger>{mockTriggerText}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mockTitle}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{mockDescription}</DialogDescription>
        {mockContent}
        <DialogFooter>
          <button>Confirm</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  it("renders trigger button and does not show content initially", () => {
    render(<TestDialog />);
    
    // Check that the trigger is visible
    expect(screen.getByText(mockTriggerText)).toBeInTheDocument();
    
    // Check that dialog content is not initially visible
    expect(screen.queryByText(mockTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(mockDescription)).not.toBeInTheDocument();
    expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    render(<TestDialog />);
    
    // Click the trigger
    const trigger = screen.getByText(mockTriggerText);
    fireEvent.click(trigger);
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
      expect(screen.getByText(mockDescription)).toBeInTheDocument();
      expect(screen.getByText(mockContent)).toBeInTheDocument();
    });
  });

  it("closes dialog when close button is clicked", async () => {
    render(<TestDialog />);
    
    // Open the dialog
    const trigger = screen.getByText(mockTriggerText);
    fireEvent.click(trigger);
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });
    
    // Find and click the close button (X icon)
    const closeButton = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeButton);
    
    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByText(mockTitle)).not.toBeInTheDocument();
      expect(screen.queryByText(mockDescription)).not.toBeInTheDocument();
      expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
    });
  });

  it("renders header, title, description, and footer with correct structure", async () => {
    render(<TestDialog />);
    
    // Open the dialog
    fireEvent.click(screen.getByText(mockTriggerText));
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });
    
    // Check that all parts are present
    const headerElement = screen.getByText(mockTitle).closest("div");
    expect(headerElement).toHaveClass("flex", "flex-col", "space-y-1.5");
    
    expect(screen.getByText(mockDescription)).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("applies correct class names to elements", async () => {
    render(<TestDialog />);
    
    // Open the dialog
    fireEvent.click(screen.getByText(mockTriggerText));
    
    await waitFor(() => {
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });
    
    // Check that the content element has the expected classes
    const contentElement = screen.getByRole("dialog");
    expect(contentElement).toHaveClass("fixed", "grid", "shadow-lg");
    
    // Check that the title has the expected classes
    const titleElement = screen.getByText(mockTitle);
    expect(titleElement).toHaveClass("text-lg", "font-semibold");
    
    // Check that the description has the expected classes
    const descriptionElement = screen.getByText(mockDescription);
    expect(descriptionElement).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("renders with custom className when provided", async () => {
    const customClassName = "custom-dialog-content";
    
    const DialogWithCustomClass = () => (
      <Dialog>
        <DialogTrigger>{mockTriggerText}</DialogTrigger>
        <DialogContent className={customClassName}>
          <DialogTitle>{mockTitle}</DialogTitle>
          <DialogDescription>{mockDescription}</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    
    render(<DialogWithCustomClass />);
    
    // Open the dialog
    fireEvent.click(screen.getByText(mockTriggerText));
    
    await waitFor(() => {
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });
    
    // Check that custom class is applied
    const contentElement = screen.getByRole("dialog");
    expect(contentElement).toHaveClass(customClassName);
  });
});