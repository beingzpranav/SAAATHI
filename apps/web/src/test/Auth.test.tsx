import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm.js';
import { RegisterForm } from '../features/auth/components/RegisterForm.js';
import { ProtectedRoute } from '../components/layout/ProtectedRoute.js';
import { useSessionStore } from '../stores/session.store.js';

describe('Auth Feature Components', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  describe('LoginForm', () => {
    it('renders email and password inputs and sign-in button', () => {
      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <LoginForm onSuccess={vi.fn()} />
        </BrowserRouter>,
      );

      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in to SAATHI/i })).toBeInTheDocument();
    });

    it('populates inputs when demo account button is clicked', async () => {
      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <LoginForm onSuccess={vi.fn()} />
        </BrowserRouter>,
      );

      const demoLearnerBtn = screen.getByRole('button', { name: /Learner \(Rohan\)/i });
      fireEvent.click(demoLearnerBtn);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
        expect(emailInput.value).toBe('learner@saathi.demo');
      });
    });
  });

  describe('RegisterForm', () => {
    it('renders role selectors for learner and parent', () => {
      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RegisterForm onSuccess={vi.fn()} />
        </BrowserRouter>,
      );

      expect(screen.getByText(/Learner \/ Student/i)).toBeInTheDocument();
      expect(screen.getByText(/Parent \/ Guardian/i)).toBeInTheDocument();
    });

    it('displays mandatory parent consent when minor checkbox is enabled', async () => {
      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RegisterForm onSuccess={vi.fn()} />
        </BrowserRouter>,
      );

      const minorCheckbox = screen.getByRole('checkbox', {
        name: /The learner is under 18 years of age \(minor\)/i,
      });

      expect(
        screen.queryByText(/Parent \/ Guardian Consent Acknowledged/i),
      ).not.toBeInTheDocument();

      fireEvent.click(minorCheckbox);

      expect(
        await screen.findByText(/Parent \/ Guardian Consent Acknowledged/i),
      ).toBeInTheDocument();
    });
  });

  describe('ProtectedRoute', () => {
    it('redirects to /login when user is unauthenticated', () => {
      render(
        <MemoryRouter
          initialEntries={['/dashboard']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Secret Dashboard Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page Mock</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.queryByText('Secret Dashboard Content')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page Mock')).toBeInTheDocument();
    });

    it('renders protected child component when authenticated', () => {
      useSessionStore.setState({
        user: {
          id: 'test-user-id',
          name: 'Authorized User',
          email: 'user@test.com',
          role: 'LEARNER',
          language: 'en',
          isMinor: false,
          parentConsentGiven: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter
          initialEntries={['/dashboard']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Secret Dashboard Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Secret Dashboard Content')).toBeInTheDocument();
    });
  });
});
