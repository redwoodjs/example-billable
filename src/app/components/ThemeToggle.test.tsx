import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  let localStorageMock;
  let classListToggleSpy;

  beforeEach(() => {
    localStorageMock = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(() => {}),
      removeItem: jest.fn(() => {}),
      clear: jest.fn(() => {}),
    };

    // Properly mock localStorage on the window
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false, // Default to light theme preference
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    // Mock document element classList
    classListToggleSpy = jest.fn();
    Object.defineProperty(document.documentElement, 'classList', {
      value: {
        toggle: classListToggleSpy
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial button with correct ARIA label", async () => {
    render(<ThemeToggle />);
    
    // Wait for component to mount and effect to run
    await waitFor(() => {
      const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
    expect(themeButton).toHaveAttribute('aria-label', 'Toggle theme');
  });

  it("renders with light theme by default (shows Moon icon)", async () => {
    render(<ThemeToggle />);
    
    // Wait for component to mount and effect to run
    await waitFor(() => {
      const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    // When theme is light, it should show Moon icon - using querySelector for testing
    const moonIcon = document.querySelector('svg.lucide-moon');
    expect(moonIcon).toBeInTheDocument();
  });

  it("renders with dark theme when initial theme is dark", async () => {
    localStorageMock.getItem.mockReturnValue("dark");
    
    render(<ThemeToggle />);
    
    await waitFor(() => {
      const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    // Should show Sun icon when theme is dark
    const sunIcon = document.querySelector('svg.lucide-sun');
    expect(sunIcon).toBeInTheDocument();
  });

  it("toggles theme from light to dark", async () => {
    render(<ThemeToggle />);
    
    // Wait for component to mount
    await waitFor(() => {
      const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
    fireEvent.click(themeButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
    });

    expect(classListToggleSpy).toHaveBeenCalledWith("dark", true);
  });

  it("toggles theme from dark to light", async () => {
    localStorageMock.getItem.mockReturnValue("dark");
    
    render(<ThemeToggle />);
    
    await waitFor(() => {
      const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
    fireEvent.click(themeButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "light");
    });

    expect(classListToggleSpy).toHaveBeenCalledWith("dark", false);
  });

  it("uses system preference when no stored theme", async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: true, // Simulate user prefers dark theme
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    render(<ThemeToggle />);
    
    await waitFor(() => {
      const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    // Should render with dark theme based on system preference, showing Sun icon
    const sunIcon = document.querySelector('svg.lucide-sun');
    expect(sunIcon).toBeInTheDocument();
  });

  it("updates document class when toggling theme", async () => {
    render(<ThemeToggle />);
    
    await waitFor(() => {
      const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
    fireEvent.click(themeButton);

    await waitFor(() => {
      expect(classListToggleSpy).toHaveBeenCalledWith("dark", true);
    });
  });

  it("sets correct initial class on document element", async () => {
    localStorageMock.getItem.mockReturnValue("dark");
    
    render(<ThemeToggle />);
    
    await waitFor(() => {
      const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    expect(classListToggleSpy).toHaveBeenCalledWith("dark", true);
  });

  it("stores theme in localStorage when toggled", async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });

    // Initially, localStorage.setItem should not have been called (only getItem in useEffect)
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    const themeButton = screen.getByRole('button', { name: /Toggle theme/i });
    fireEvent.click(themeButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
    });
  });
});