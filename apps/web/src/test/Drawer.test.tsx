import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Drawer } from '../components/ui/Drawer.js';

describe('Drawer Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()} title="Test Drawer">
        <div>Drawer Content</div>
      </Drawer>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal dialog and title when isOpen is true', () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Navigation Menu">
        <div>Navigation Links</div>
      </Drawer>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Navigation Menu')).toBeInTheDocument();
    expect(screen.getByText('Navigation Links')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={handleClose} title="Navigation Menu">
        <div>Drawer Content</div>
      </Drawer>,
    );

    const closeBtn = screen.getByRole('button', { name: /Close menu drawer/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={handleClose} title="Navigation Menu">
        <div>Drawer Content</div>
      </Drawer>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll when open and unlocks on unmount', () => {
    const { unmount } = render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Navigation Menu">
        <div>Drawer Content</div>
      </Drawer>,
    );

    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
