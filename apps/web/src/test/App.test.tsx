import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '../app/App.js';
import '../lib/i18n.js';

describe('Web App Shell', () => {
  it('renders headline and support copy correctly', async () => {
    render(<App />);

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: /Help your whole family choose a trade you can trust/i,
    });
    expect(heading).toBeInTheDocument();

    expect(
      await screen.findByText(
        /Private chats for student and parent, local pay and placement figures, and a live counsellor if doubts remain/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders the primary call to action button', async () => {
    render(<App />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Start family intake/i });
      expect(button).toBeInTheDocument();
    });
  });

  it('renders three core pillar cards', async () => {
    render(<App />);

    expect(await screen.findByText('Dual-Window Privacy')).toBeInTheDocument();
    expect(await screen.findByText('Verified Local Data')).toBeInTheDocument();
    expect(await screen.findByText('Family Decision Card')).toBeInTheDocument();
  });
});
