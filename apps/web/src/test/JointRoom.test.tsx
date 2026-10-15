import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NsqfLadderView } from '../features/joint-room/NsqfLadderView.js';
import { SharedConcernsView } from '../features/joint-room/SharedConcernsView.js';
import { JointChatPanel } from '../features/joint-room/JointChatPanel.js';
import { AskSaathiCard } from '../features/joint-room/AskSaathiCard.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Joint Room Features', () => {
  it('renders NSQF Career Ladder with Level 4 starting step', () => {
    render(<NsqfLadderView />);
    expect(screen.getByText(/NSQF Career Progression Ladder/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Level 4/i).length).toBeGreaterThan(0);

  });

  it('renders SharedConcernsView with strict zero-leakage privacy notice', () => {
    render(
      <Wrapper>
        <SharedConcernsView />
      </Wrapper>,
    );
    expect(screen.getByText(/Shared Concerns Only/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Unshared Leakage/i)).toBeInTheDocument();
  });

  it('renders JointChatPanel with quick prompt buttons', () => {
    render(<JointChatPanel />);
    expect(screen.getByText(/Family Real-Time Chat/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type a message or ask @ai/i)).toBeInTheDocument();
    expect(screen.getByText(/What is the median salary for Electrician in our district\?/i)).toBeInTheDocument();
  });

  it('renders AskSaathiCard with consultation input and language switchers', () => {
    render(
      <Wrapper>
        <AskSaathiCard />
      </Wrapper>,
    );
    expect(screen.getByText(/Ask Saathi Grounded AI/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /हिन्दी/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask about starting salary/i)).toBeInTheDocument();
  });
});
