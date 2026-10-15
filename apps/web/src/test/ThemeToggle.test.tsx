import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from '../stores/ui.store.js';

const ThemeTestComponent = () => {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      aria-pressed={theme === 'dark'}
    >
      Current: {theme}
    </button>
  );
};

describe('Theme Toggle and Store', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    useUiStore.setState({ theme: 'light' });
  });

  it('initializes with light theme by default', () => {
    render(<ThemeTestComponent />);
    expect(screen.getByText('Current: light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles to dark theme, updates DOM class, and persists to localStorage', () => {
    render(<ThemeTestComponent />);
    const button = screen.getByRole('button', { name: /Toggle color theme/i });

    fireEvent.click(button);
    expect(screen.getByText('Current: dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('saathi-theme')).toBe('dark');

    fireEvent.click(button);
    expect(screen.getByText('Current: light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('saathi-theme')).toBe('light');
  });
});
