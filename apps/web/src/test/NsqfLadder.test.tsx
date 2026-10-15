import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NsqfLadder } from '../features/trades/components/NsqfLadder.js';
import type { NsqfLadderStep } from '@saathi/shared';

describe('NsqfLadder Component', () => {
  const mockSteps: NsqfLadderStep[] = [
    {
      level: 3,
      titleEn: 'Level 3: Assistant Wireman',
      titleHi: 'स्तर 3: सहायक वायरमैन',
      roleEn: 'Assists senior technicians with conduit laying.',
      roleHi: 'पाइप बिछाने में सहायता करता है।',
      minExperienceEn: 'Class 8 Pass',
      minExperienceHi: 'कक्षा 8 उत्तीर्ण',
      medianSalaryMonthly: 11500,
      isStartingStep: false,
    },
    {
      level: 4,
      titleEn: 'Level 4: Licensed Electrician',
      titleHi: 'स्तर 4: लाइसेंस प्राप्त इलेक्ट्रीशियन',
      roleEn: 'Performs independent domestic and commercial wiring.',
      roleHi: 'स्वतंत्र घरेलू और वाणिज्यिक वायरिंग करता है।',
      minExperienceEn: 'Class 10 Pass + 2-year ITI CTS',
      minExperienceHi: 'कक्षा 10 उत्तीर्ण + 2 वर्षीय आईटीआई',
      medianSalaryMonthly: 18500,
      isStartingStep: true, // Learner starting point!
    },
    {
      level: 5,
      titleEn: 'Level 5: Master Electrician & Supervisor',
      titleHi: 'स्तर 5: मास्टर इलेक्ट्रीशियन और पर्यवेक्षक',
      roleEn: 'Supervises industrial panel wiring and motor maintenance.',
      roleHi: 'औद्योगिक पैनल वायरिंग का पर्यवेक्षण करता है।',
      minExperienceEn: 'Level 4 + 2 years experience',
      minExperienceHi: 'स्तर 4 + 2 वर्ष अनुभव',
      medianSalaryMonthly: 28000,
      isStartingStep: false,
    },
  ];

  it('renders all steps in sequence', () => {
    render(<NsqfLadder steps={mockSteps} tradeTitle="Electrician" />);

    expect(screen.getByText('Level 3: Assistant Wireman')).toBeInTheDocument();
    expect(screen.getByText('Level 4: Licensed Electrician')).toBeInTheDocument();
    expect(screen.getByText('Level 5: Master Electrician & Supervisor')).toBeInTheDocument();
  });

  it('visually highlights the learner starting step with badge and distinctive tag', () => {
    render(<NsqfLadder steps={mockSteps} tradeTitle="Electrician" />);

    const startBadge = screen.getByText(/Learner Starting Step|आपका प्रवेश बिंदु/i);
    expect(startBadge).toBeInTheDocument();
  });

  it('displays verified median monthly salaries in Indian Rupee format', () => {
    render(<NsqfLadder steps={mockSteps} tradeTitle="Electrician" />);

    expect(screen.getByText(/₹18,500/)).toBeInTheDocument();
    expect(screen.getByText(/₹28,000/)).toBeInTheDocument();
    expect(screen.getByText(/₹11,500/)).toBeInTheDocument();
  });

  it('provides accessible landmark and level attributes', () => {
    const { container } = render(<NsqfLadder steps={mockSteps} tradeTitle="Electrician" />);

    const ladderRoot = container.querySelector('[aria-label="NSQF Career Progression Ladder"]');
    expect(ladderRoot).toBeInTheDocument();

    const lvl4Badge = screen.getByLabelText('Level 4');
    expect(lvl4Badge).toBeInTheDocument();
  });
});
