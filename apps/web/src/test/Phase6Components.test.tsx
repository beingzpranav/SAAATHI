import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseVideoPlayer } from '../features/trades/CourseVideoPlayer.js';
import { ConcernsCheckpointModal } from '../features/joint-room/ConcernsCheckpointModal.js';
import { LiveConsultationModal } from '../features/counselling/LiveConsultationModal.js';
import { CounsellorConsolePage } from '../pages/CounsellorConsolePage.js';
import { DecisionCardPage } from '../pages/DecisionCardPage.js';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('Phase 6 Frontend Components Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('CourseVideoPlayer', () => {
    it('renders 2 video immersion tracks and switches between them', () => {
      render(
        <CourseVideoPlayer
          tradeTitleEn="Electrician (Domestic & Industrial)"
          tradeTitleHi="इलेक्ट्रीशियन"
          tradeCode="ELECTRICIAN"
        />,
      );

      // Verify title and tabs
      expect(screen.getByText(/Video Immersion/i)).toBeInTheDocument();
      expect(screen.getByText(/1. Workshop/i)).toBeInTheDocument();
      expect(screen.getByText(/2. Real Wages/i)).toBeInTheDocument();

      // Switch to video 2
      const tab2 = screen.getByRole('button', { name: /2. Real Wages/i });
      fireEvent.click(tab2);
      expect(screen.getByText(/Industry Voices, Apprenticeships & Wage Trajectory/i)).toBeInTheDocument();
    });

    it('toggles captions and offline download caching', async () => {
      render(
        <CourseVideoPlayer
          tradeTitleEn="Electrician (Domestic & Industrial)"
          tradeTitleHi="इलेक्ट्रीशियन"
          tradeCode="ELECTRICIAN"
        />,
      );

      // Verify CC toggle button
      const ccButton = screen.getByRole('button', { name: /Toggle subtitles/i });
      expect(ccButton).toBeInTheDocument();
      fireEvent.click(ccButton);

      // Click offline download button
      const offlineButton = screen.getByRole('button', { name: /Save Offline/i });
      expect(offlineButton).toBeInTheDocument();
      fireEvent.click(offlineButton);

      // Wait for offline cached status
      await waitFor(() => {
        expect(screen.getByText(/Saved/i)).toBeInTheDocument();
      });
    });
  });

  describe('ConcernsCheckpointModal', () => {
    it('evaluates family concerns and computes dynamic readiness score', async () => {
      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ConcernsCheckpointModal isOpen={true} onClose={() => {}} />
          </BrowserRouter>
        </QueryClientProvider>,
      );

      // Check modal heading
      expect(screen.getByText(/Concerns Answered Checkpoint/i)).toBeInTheDocument();

      // Verify initial readiness score is displayed
      await waitFor(() => {
        expect(screen.getByText(/Family Alignment & Readiness Score/i)).toBeInTheDocument();
      });

      // Submit evaluations button should exist
      const submitBtn = screen.getByRole('button', { name: /Record Checkpoint/i });
      expect(submitBtn).toBeInTheDocument();
      fireEvent.click(submitBtn);

      // Once submitted, should show button to open decision card
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Open Family Decision Card/i })).toBeInTheDocument();
      });
    });
  });

  describe('LiveConsultationModal', () => {
    it('renders WebRTC live consultation and allows toggling rural 2G/3G audio fallback mode', () => {
      render(
        <LiveConsultationModal
          isOpen={true}
          onClose={() => {}}
          meetingRoomId="saathi-room-varanasi-402"
          counsellorName="Dr. Priya Varma"
          householdName="Sharma Family"
        />,
      );

      expect(screen.getByText(/Live Vocational Consultation/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Dr. Priya Varma/i).length).toBeGreaterThan(0);

      // Toggle to Low-Bandwidth Audio Mode
      const fallbackBtn = screen.getByRole('button', { name: /Low-Bandwidth Audio Mode/i });
      fireEvent.click(fallbackBtn);

      // Verify audio fallback indication
      expect(screen.getByText(/Audio Fallback \(16 kbps\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Low-bandwidth audio mode active/i)).toBeInTheDocument();
    });
  });

  describe('CounsellorConsolePage', () => {
    it('enforces strict privacy filters and displays only jointly shared concerns', async () => {
      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CounsellorConsolePage />
          </BrowserRouter>
        </QueryClientProvider>,
      );

      // Verify portal header
      expect(screen.getByText(/Certified Counsellor Console/i)).toBeInTheDocument();

      // Check strict privacy shield alert
      await waitFor(() => {
        expect(
          screen.getByText(/Strict Privacy Filter Enforced: Only Jointly Shared Concerns are Visible/i),
        ).toBeInTheDocument();
      });

      // Verify private concerns are reported as hidden
      expect(screen.getByText(/private learner\/parent concerns remain strictly confidential/i)).toBeInTheDocument();

      // Verify save notes button
      const saveNotesBtn = screen.getByRole('button', { name: /Save Notes/i });
      expect(saveNotesBtn).toBeInTheDocument();
      fireEvent.click(saveNotesBtn);
      await waitFor(() => {
        expect(screen.getByText(/Notes Saved!/i)).toBeInTheDocument();
      });
    });
  });

  describe('DecisionCardPage', () => {
    it('renders printable official decision card with SHA-256 verification hash and bilingual SMS', async () => {
      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <DecisionCardPage />
          </BrowserRouter>
        </QueryClientProvider>,
      );

      // Verify official certificate header
      await waitFor(() => {
        expect(
          screen.getByText(/OFFICIAL VOCATIONAL DECISION CERTIFICATE/i),
        ).toBeInTheDocument();
      });

      // Verify chosen trade and provider
      expect(screen.getByText(/Electrician \(Domestic & Industrial\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Government ITI Karaundi/i)).toBeInTheDocument();

      // Verify financial guarantee
      expect(screen.getByText(/100% Tuition Fee Waiver/i)).toBeInTheDocument();
      expect(screen.getByText(/NAPS Direct Benefit Transfer/i)).toBeInTheDocument();

      // Verify cryptographic SHA-256 block
      expect(screen.getByText(/IMMUTABLE CONSENT LEDGER VERIFICATION/i)).toBeInTheDocument();

      // Open SMS summary modal
      const smsBtn = screen.getByRole('button', { name: /SMS Summary/i });
      fireEvent.click(smsBtn);

      await waitFor(() => {
        expect(screen.getByText(/Offline \/ Feature Phone SMS Summary/i)).toBeInTheDocument();
        expect(screen.getByText(/English SMS/i)).toBeInTheDocument();
        expect(screen.getByText(/हिन्दी SMS/i)).toBeInTheDocument();
      });
    });
  });
});
