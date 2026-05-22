import { render, screen } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';
import { LoginPage } from './LoginPage';

// Mock the child components to isolate testing of LoginPage
jest.mock('./LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Mock LoginForm</div>,
}));

jest.mock('../Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

describe('LoginPage', () => {
  it('renders without crashing', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('wraps LoginForm inside Layout component', () => {
    render(<LoginPage />);

    // Check that layout exists and contains the login form
    const layout = screen.getByTestId('layout');
    const loginForm = screen.getByTestId('login-form');

    expect(layout).toContainElement(loginForm);
  });

  it('has the correct structure', () => {
    render(<LoginPage />);

    const layout = screen.getByTestId('layout');
    const loginForm = screen.getByTestId('login-form');

    // Verify that login form is a child of layout
    expect(loginForm.parentElement).toBe(layout);
  });
});