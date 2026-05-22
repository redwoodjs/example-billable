import React from 'react';
import { renderToString } from 'react-dom/server';

// Import the component without rendering it normally to avoid React errors
import { Document } from './Document';

// Mock the CSS module import
jest.mock('./style.css?url', () => ({
  default: '/src/app/style.css'
}));

describe('Document Component', () => {
  const defaultProps = {
    children: <div>Test Content</div>,
  };

  // Mock window methods used in the component
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Set up window.matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    // Restore original window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('renders the full HTML structure', () => {
    const html = renderToString(<Document {...defaultProps} />);

    // Basic checks to ensure the structure is correct
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<meta charSet="utf-8"');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('<title>Billable: Billing Made Simple. Period.</title>');
    expect(html).toContain('rel="stylesheet"');
    expect(html).toContain('href="/src/app/style.css"');
    expect(html).toContain('rel="modulepreload"');
    expect(html).toContain('href="/src/client.tsx"');
    expect(html).toContain('<div id="root">');
    expect(html).toContain('Test Content');
    expect(html).toContain('import("/src/client.tsx")');
  });

  it('has the correct lang attribute', () => {
    const html = renderToString(<Document {...defaultProps} />);
    expect(html).toContain('<html lang="en">');
  });

  it('includes all required head elements', () => {
    const html = renderToString(<Document {...defaultProps} />);

    expect(html).toContain('<meta charSet="utf-8"');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('content="width=device-width, initial-scale=1"');
  });

  it('includes the correct title', () => {
    const html = renderToString(<Document {...defaultProps} />);
    expect(html).toContain('<title>Billable: Billing Made Simple. Period.</title>');
  });

  it('includes the stylesheet link', () => {
    const html = renderToString(<Document {...defaultProps} />);
    expect(html).toContain('rel="stylesheet"');
    expect(html).toContain('href="/src/app/style.css"');
  });

  it('includes the modulepreload link', () => {
    const html = renderToString(<Document {...defaultProps} />);
    expect(html).toContain('rel="modulepreload"');
    expect(html).toContain('href="/src/client.tsx"');
    expect(html).toContain('as="script"');
  });

  it('includes the theme detection script', () => {
    const html = renderToString(<Document {...defaultProps} />);
    expect(html).toContain('localStorage.getItem(\'theme\')');
    expect(html).toContain('prefers-color-scheme: dark');
    expect(html).toContain('document.documentElement.classList.add(\'dark\')');
  });

  it('includes the root div with correct id', () => {
    const html = renderToString(<Document {...defaultProps} />);
    expect(html).toContain('<div id="root">');
  });

  it('renders children inside the root div', () => {
    const html = renderToString(<Document {...defaultProps} />);
    expect(html).toContain('<div id="root"><div>Test Content</div>');
  });
});