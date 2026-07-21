/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Storefront from '../src/Storefront';

// Mock Firebase
vi.mock('../src/firebase', () => ({
  auth: {},
  googleProvider: {},
  db: {}
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn()
}));

// Mock PayPal
vi.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PayPalButtons: () => <div data-testid="paypal-buttons">PayPal</div>
}));

describe('Storefront Component', () => {
  it('renders without crashing and shows the main title', () => {
    render(<Storefront />);
    
    // Check if the logo/title exists (based on common Storefront text)
    const elements = screen.getAllByText(/The Living Website/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
