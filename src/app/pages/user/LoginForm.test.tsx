import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import {
  startPasskeyRegistration,
  finishPasskeyRegistration,
  startPasskeyLogin,
  finishPasskeyLogin,
  validateEmailAddress,
} from './functions';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// Mock the external dependencies
jest.mock('./functions', () => ({
  startPasskeyRegistration: jest.fn(),
  finishPasskeyRegistration: jest.fn(),
  startPasskeyLogin: jest.fn(),
  finishPasskeyLogin: jest.fn(),
  validateEmailAddress: jest.fn(),
}));

jest.mock('@simplewebauthn/browser', () => ({
  startRegistration: jest.fn(),
  startAuthentication: jest.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form with email input and buttons', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('updates email state when input changes', () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('displays result messages', () => {
    render(<LoginForm />);
    
    expect(screen.queryByText('Failed to register')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed to login')).not.toBeInTheDocument();
  });

  describe('Register functionality', () => {
    it('validates email before registration', async () => {
      const mockValidate = validateEmailAddress as jest.MockedFunction<typeof validateEmailAddress>;
      mockValidate.mockResolvedValue([true, null]);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const registerButton = screen.getByRole('button', { name: 'Register' });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(validateEmailAddress).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('shows error message when email validation fails', async () => {
      const mockValidate = validateEmailAddress as jest.MockedFunction<typeof validateEmailAddress>;
      mockValidate.mockResolvedValue([false, 'Invalid email address']);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const registerButton = screen.getByRole('button', { name: 'Register' });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('calls registration functions when email is valid and succeeds', async () => {
      const mockValidate = validateEmailAddress as jest.MockedFunction<typeof validateEmailAddress>;
      mockValidate.mockResolvedValue([true, null]);

      const mockStartRegistration = startPasskeyRegistration as jest.MockedFunction<typeof startPasskeyRegistration>;
      mockStartRegistration.mockResolvedValue({ challenge: 'test-challenge' });

      const mockStartWebAuthnRegistration = startRegistration as jest.MockedFunction<typeof startRegistration>;
      mockStartWebAuthnRegistration.mockResolvedValue({ id: 'test-id' });

      const mockFinishRegistration = finishPasskeyRegistration as jest.MockedFunction<typeof finishPasskeyRegistration>;
      mockFinishRegistration.mockResolvedValue(true);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const registerButton = screen.getByRole('button', { name: 'Register' });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(startPasskeyRegistration).toHaveBeenCalledWith('test@example.com');
        expect(startRegistration).toHaveBeenCalledWith({
          optionsJSON: { challenge: 'test-challenge' },
        });
        expect(finishPasskeyRegistration).toHaveBeenCalledWith('test@example.com', { id: 'test-id' });
      });
    });

    it('shows error when registration fails', async () => {
      const mockValidate = validateEmailAddress as jest.MockedFunction<typeof validateEmailAddress>;
      mockValidate.mockResolvedValue([true, null]);

      const mockStartRegistration = startPasskeyRegistration as jest.MockedFunction<typeof startPasskeyRegistration>;
      mockStartRegistration.mockResolvedValue({ challenge: 'test-challenge' });

      const mockStartWebAuthnRegistration = startRegistration as jest.MockedFunction<typeof startRegistration>;
      mockStartWebAuthnRegistration.mockResolvedValue({ id: 'test-id' });

      const mockFinishRegistration = finishPasskeyRegistration as jest.MockedFunction<typeof finishPasskeyRegistration>;
      mockFinishRegistration.mockResolvedValue(false);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const registerButton = screen.getByRole('button', { name: 'Register' });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to register')).toBeInTheDocument();
      });
    });
  });

  describe('Login functionality', () => {
    it('calls login functions when login button is clicked', async () => {
      const mockStartLogin = startPasskeyLogin as jest.MockedFunction<typeof startPasskeyLogin>;
      mockStartLogin.mockResolvedValue({ challenge: 'login-challenge' });

      const mockStartWebAuthnAuthentication = startAuthentication as jest.MockedFunction<typeof startAuthentication>;
      mockStartWebAuthnAuthentication.mockResolvedValue({ id: 'auth-id' });

      const mockFinishLogin = finishPasskeyLogin as jest.MockedFunction<typeof finishPasskeyLogin>;
      mockFinishLogin.mockResolvedValue(true);

      render(<LoginForm />);

      const loginButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(startPasskeyLogin).toHaveBeenCalled();
        expect(startAuthentication).toHaveBeenCalledWith({
          optionsJSON: { challenge: 'login-challenge' },
        });
        expect(finishPasskeyLogin).toHaveBeenCalledWith({ id: 'auth-id' });
      });
    });

    it('shows error when login fails', async () => {
      const mockStartLogin = startPasskeyLogin as jest.MockedFunction<typeof startPasskeyLogin>;
      mockStartLogin.mockResolvedValue({ challenge: 'login-challenge' });

      const mockStartWebAuthnAuthentication = startAuthentication as jest.MockedFunction<typeof startAuthentication>;
      mockStartWebAuthnAuthentication.mockResolvedValue({ id: 'auth-id' });

      const mockFinishLogin = finishPasskeyLogin as jest.MockedFunction<typeof finishPasskeyLogin>;
      mockFinishLogin.mockResolvedValue(false);

      render(<LoginForm />);

      const loginButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to login')).toBeInTheDocument();
      });
    });
  });
});