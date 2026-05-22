import React from 'react';
import { render } from '@testing-library/react';
import { Toaster } from './sonner';
import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';

// Mock the next-themes module
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock the sonner module
jest.mock('sonner', () => ({
  Toaster: jest.fn(() => <div data-testid="sonner-toaster" />),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('Toaster', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with system theme by default', () => {
    mockUseTheme.mockReturnValue({ theme: undefined, setTheme: jest.fn(), systemTheme: undefined, resolvedTheme: undefined });

    render(<Toaster />);

    expect(Sonner).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'system',
        className: 'toaster group',
        toastOptions: {
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
            actionButton:
              'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            cancelButton:
              'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          },
        },
      }),
      undefined
    );
  });

  it('renders with light theme', () => {
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: jest.fn(), systemTheme: undefined, resolvedTheme: undefined });

    render(<Toaster />);

    expect(Sonner).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'light',
      }),
      undefined
    );
  });

  it('renders with dark theme', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark', setTheme: jest.fn(), systemTheme: undefined, resolvedTheme: undefined });

    render(<Toaster />);

    expect(Sonner).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'dark',
      }),
      undefined
    );
  });

  it('passes additional props to Sonner component', () => {
    mockUseTheme.mockReturnValue({ theme: 'system', setTheme: jest.fn(), systemTheme: undefined, resolvedTheme: undefined });

    const mockProps = {
      position: 'top-right',
      expand: true,
    };

    render(<Toaster {...mockProps} />);

    expect(Sonner).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'system',
        className: 'toaster group',
        position: 'top-right',
        expand: true,
        toastOptions: {
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
            actionButton:
              'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            cancelButton:
              'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          },
        },
      }),
      undefined
    );
  });

  it('uses correct class names for styling', () => {
    mockUseTheme.mockReturnValue({ theme: 'system', setTheme: jest.fn(), systemTheme: undefined, resolvedTheme: undefined });

    render(<Toaster />);

    expect(Sonner).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'toaster group',
        toastOptions: {
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
            actionButton:
              'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            cancelButton:
              'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          },
        },
      }),
      undefined
    );
  });
});