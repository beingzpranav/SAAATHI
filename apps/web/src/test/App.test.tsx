import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '../app/App.js';

describe('Web App Shell', () => {
  it('renders headline and support copy correctly', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Help your whole family choose a trade you can trust/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Private chats for student and parent, local pay and placement figures, and a live counsellor if doubts remain/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders the primary call to action button', () => {
    render(<App />);

    const button = screen.getByRole('button', { name: /Start family intake/i });
    expect(button).toBeInTheDocument();
  });

  it('renders three core pillar cards', () => {
    render(<App />);

    expect(screen.getByText('Dual-Window Privacy')).toBeInTheDocument();
    expect(screen.getByText('Verified Outcome Data')).toBeInTheDocument();
    expect(screen.getByText('Family Decision Card')).toBeInTheDocument();
  });
});
