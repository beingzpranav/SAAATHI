import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

describe('Phase 7: AdminDashboardPage', () => {
  it('renders the admin dashboard header and privacy shield', async () => {
    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/SAATHI Admin Dashboard/i)).toBeInTheDocument();
    });

    // K-anonymity privacy banner must be present
    expect(screen.getAllByText(/K-Anonymity Privacy Protection Active/i).length).toBeGreaterThan(0);
  });

  it('shows all 4 navigation tabs', async () => {
    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Concerns & Sentiment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Decision Funnel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Escalations/i })).toBeInTheDocument();
  });

  it('displays overview stat cards with headline metrics', async () => {
    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Total Households/i)).toBeInTheDocument();
      expect(screen.getByText(/Decision Cards/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending Escalations/i)).toBeInTheDocument();
      expect(screen.getByText(/Joint Sessions/i)).toBeInTheDocument();
    });
  });

  it('switches to Concerns & Sentiment tab and shows suppressed buckets', async () => {
    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Concerns & Sentiment/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Concerns & Sentiment/i }));

    await waitFor(() => {
      expect(screen.getByText(/Concern Breakdown & Sentiment Shifts/i)).toBeInTheDocument();
    });

    // Should show suppressed badge
    expect(screen.getAllByText(/Suppressed/i).length).toBeGreaterThan(0);
    // Should show visible badge for non-suppressed categories
    expect(screen.getAllByText(/Visible/i).length).toBeGreaterThan(0);
  });

  it('switches to Decision Funnel tab and displays all 4 stages', async () => {
    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Decision Funnel/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Decision Funnel/i }));

    await waitFor(() => {
      expect(screen.getByText(/Family Decision Funnel/i)).toBeInTheDocument();
      expect(screen.getByText(/Household Intake Completed/i)).toBeInTheDocument();
      expect(screen.getByText(/Joint Session Started/i)).toBeInTheDocument();
      expect(screen.getByText(/Counsellor Booking Made/i)).toBeInTheDocument();
      expect(screen.getByText(/Family Decision Card Issued/i)).toBeInTheDocument();
    });

    // Overall completion rate displayed
    expect(screen.getByText(/Overall Completion Rate/i)).toBeInTheDocument();
  });

  it('switches to Escalations tab and shows pending/confirmed sections', async () => {
    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Escalations/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Escalations/i }));

    await waitFor(() => {
      expect(screen.getByText(/Pending Bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/Confirmed Bookings/i)).toBeInTheDocument();
    });
  });

  it('renders Export CSV button and type selector', async () => {
    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: '' })).toBeInTheDocument();
    });
  });

  it('renders Refresh button', async () => {
    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument();
    });
  });
});
