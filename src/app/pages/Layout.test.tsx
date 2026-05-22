import React from 'react';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';
import { requestInfo } from 'rwsdk/worker';
import { link } from '@/app/shared/links';

// Mock the dependencies
jest.mock('rwsdk/worker', () => ({
  requestInfo: {
    ctx: {
      user: null
    }
  }
}));

jest.mock('@/app/shared/links', () => ({
  link: jest.fn().mockImplementation((path) => `/mocked${path}`)
}));

// Mock the ThemeToggle component
jest.mock('@/app/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>
}));

describe('Layout', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders the layout structure correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check that the main layout div exists
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Check that the children are rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // Check that the header exists - find the header container div by going up two levels
    const headerContainer = screen.getByText('Not logged in').closest('div.text-sm.font-semibold').parentElement?.parentElement;
    expect(headerContainer).toHaveClass('px-8', 'py-4', 'flex', 'justify-between', 'items-center', 'border-b');

    // Check that the footer exists
    const footer = screen.getByText(/Crafted with/);
    expect(footer).toBeInTheDocument();
  });

  it('renders the logo in the header', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check that the SVG logo exists
    const svg = screen.getByRole('img', { hidden: true }); // Using hidden: true to find SVG elements
    expect(svg).toBeInTheDocument();
  });

  it('renders "Not logged in" link when user is not authenticated', () => {
    (requestInfo as any).ctx.user = null;

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Not logged in/ })).toBeInTheDocument();
  });

  it('renders "Logout" link when user is authenticated', () => {
    (requestInfo as any).ctx.user = { id: 1, email: 'user@example.com' };

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Logout/ })).toBeInTheDocument();
    
    // Verify that the logout link uses the correct URL
    expect(link).toHaveBeenCalledWith('/user/logout');
  });

  it('renders the theme toggle in the header', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders children content within the main container', () => {
    render(
      <Layout>
        <div data-testid="child-content">Child Content</div>
      </Layout>
    );

    const childContainer = screen.getByTestId('child-content');
    expect(childContainer).toBeInTheDocument();
    expect(childContainer).toHaveTextContent('Child Content');
  });

  it('contains the GitHub link in the footer', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const githubLink = screen.getByRole('link', { name: /Host your own\./i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/redwoodjs/example-billable');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('contains the RedwoodSDK link in the footer', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const rwsdkLink = screen.getByRole('link', { name: /Crafted with/ });
    expect(rwsdkLink).toBeInTheDocument();
    expect(rwsdkLink).toHaveAttribute('href', 'https://rwsdk.com');
    expect(rwsdkLink).toHaveAttribute('target', '_blank');
  });

  it('applies correct CSS classes to the layout', () => {
    const { container } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check the main container has the correct classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('min-h-screen');
    expect(mainContainer).toHaveClass('bg-background');
  });

  it('applies correct CSS classes to the main content area', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('min-h-screen');

    // Find the content container by looking for the element that contains the Test Content
    // and has the expected classes
    const contentDiv = screen.getByText('Test Content').parentElement;
    expect(contentDiv).toHaveClass('max-w-7xl', 'mx-auto', 'py-6', 'sm:px-6', 'lg:px-8');
  });
});