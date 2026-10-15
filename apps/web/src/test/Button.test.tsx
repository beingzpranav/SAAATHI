import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../components/ui/Button.js';

describe('Button Component', () => {
  it('renders correctly with default primary styles', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /Click me/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('rounded-[8px]');
    expect(button.className).toContain('bg-[#C4562B]');
  });

  it('renders student and parent color variants', () => {
    const { rerender } = render(<Button variant="student">Student Action</Button>);
    let button = screen.getByRole('button', { name: /Student Action/i });
    expect(button.className).toContain('bg-[#EFA531]');

    rerender(<Button variant="parent">Parent Action</Button>);
    button = screen.getByRole('button', { name: /Parent Action/i });
    expect(button.className).toContain('bg-[#2F7D5C]');
  });

  it('handles loading state with spinner and aria-busy', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('handles click events when enabled and ignores when disabled', () => {
    const handleClick = vi.fn();
    const { rerender } = render(<Button onClick={handleClick}>Active</Button>);
    fireEvent.click(screen.getByRole('button', { name: /Active/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Disabled/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
