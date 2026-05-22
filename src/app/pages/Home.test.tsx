import { render, screen } from '@testing-library/react';
import { HomePage } from './Home';
import { InvoiceForm } from './invoice/DetailPage/InvoiceForm';
import { Layout } from './Layout';

// Mock the InvoiceForm and Layout components to test HomePage in isolation
jest.mock('./invoice/DetailPage/InvoiceForm', () => ({
  InvoiceForm: jest.fn(() => <div data-testid="invoice-form" />),
}));

jest.mock('./Layout', () => ({
  Layout: jest.fn(({ children }) => <div data-testid="layout">{children}</div>),
}));

// Create a mock context that matches RequestInfo type
const mockCtx = {
  user: {
    id: 'test-user-id',
  },
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Layout component', () => {
    render(<HomePage ctx={mockCtx} />);

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    // Check that Layout was called with ctx prop
    expect(Layout).toHaveBeenCalled();
    const callArgs = (Layout as jest.Mock).mock.calls[0][0];
    expect(callArgs.ctx).toEqual(mockCtx);
    expect(callArgs.children).toBeDefined();
  });

  it('renders InvoiceForm component', () => {
    render(<HomePage ctx={mockCtx} />);

    expect(screen.getByTestId('invoice-form')).toBeInTheDocument();
    // Check that InvoiceForm was called with both ctx and invoice props
    expect(InvoiceForm).toHaveBeenCalled();
    const callArgs = (InvoiceForm as jest.Mock).mock.calls[0][0];
    expect(callArgs.ctx).toEqual(mockCtx);
  });

  it('passes correct props to InvoiceForm', () => {
    render(<HomePage ctx={mockCtx} />);

    // Verify InvoiceForm was called with proper invoice object
    const callArgs = (InvoiceForm as jest.Mock).mock.calls[0][0];
    expect(callArgs.invoice).toBeDefined();
    expect(callArgs.invoice.id).toBe('new');
    expect(callArgs.invoice.title).toBe('INVOICE');
    expect(callArgs.invoice.number).toBe('1');
    expect(callArgs.invoice.items).toHaveLength(1);
    expect(callArgs.invoice.items[0]).toMatchObject({
      description: '',
      quantity: 1,
      price: 1,
    });
    expect(callArgs.invoice.userId).toBe('test-user-id'); // Should use ctx.user.id
    expect(callArgs.invoice.status).toBe('draft');
    expect(callArgs.invoice.currency).toBe('$');
  });

  it('handles case when user is undefined in context', () => {
    const ctxWithoutUser = {};
    render(<HomePage ctx={ctxWithoutUser as any} />);

    // Check that userId defaults to empty string when user is undefined
    const callArgs = (InvoiceForm as jest.Mock).mock.calls[0][0];
    expect(callArgs.invoice.userId).toBe('');
  });

  it('renders both Layout and InvoiceForm components together', () => {
    render(<HomePage ctx={mockCtx} />);

    const layoutElement = screen.getByTestId('layout');
    const invoiceFormElement = screen.getByTestId('invoice-form');

    expect(layoutElement).toBeInTheDocument();
    expect(invoiceFormElement).toBeInTheDocument();

    // InvoiceForm should be inside the Layout
    expect(layoutElement).toContainElement(invoiceFormElement);
  });
});