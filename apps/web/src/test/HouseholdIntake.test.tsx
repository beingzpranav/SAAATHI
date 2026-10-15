import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HouseholdIntakeForm } from '../features/household/components/HouseholdIntakeForm.js';

describe('HouseholdIntakeForm Component', () => {
  it('renders intake inputs, income bands, and class levels', () => {
    render(
      <BrowserRouter>
        <HouseholdIntakeForm />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/Household Name|परिवार \/ घर का नाम/i)).toBeInTheDocument();
    expect(
      screen.getByText(/2. Annual Household Income Band|2. वार्षिक पारिवारिक आय वर्ग/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/3. Learner Current Class Level|3. शिक्षार्थी की वर्तमान शिक्षा स्तर/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Live Personalization Impact|लाइव अनुकूलन पूर्वावलोकन/i),
    ).toBeInTheDocument();
  });

  it('updates dynamic preview when income band is changed to BELOW_1_5L', () => {
    render(
      <BrowserRouter>
        <HouseholdIntakeForm />
      </BrowserRouter>,
    );

    const lowIncomeRadio = screen.getByRole('radio', { name: /1.5 Lakhs \/ year|< ₹1.5 लाख/i });
    fireEvent.click(lowIncomeRadio);

    expect(screen.getByText(/100% Tuition Fee Waiver|100% ट्यूशन फीस माफ़ी/i)).toBeInTheDocument();
  });

  it('updates dynamic preview when learner education level is changed to Class 8 Pass', () => {
    render(
      <BrowserRouter>
        <HouseholdIntakeForm />
      </BrowserRouter>,
    );

    const class8Radio = screen.getByRole('radio', { name: /Class 8 Pass|कक्षा 8 उत्तीर्ण/i });
    fireEvent.click(class8Radio);

    expect(screen.getByText(/Assistant Wireman|सहायक वायरमैन/i)).toBeInTheDocument();
  });

  it('handles quick fill button populating demo defaults', () => {
    render(
      <BrowserRouter>
        <HouseholdIntakeForm />
      </BrowserRouter>,
    );

    const quickFillBtn = screen.getByRole('button', {
      name: /Quick Fill: Varanasi Demo|त्वरित भरें: वाराणसी डेमो/i,
    });
    fireEvent.click(quickFillBtn);

    const nameInput = screen.getByLabelText(
      /Household Name|परिवार \/ घर का नाम/i,
    ) as HTMLInputElement;
    expect(nameInput.value).toContain('Varanasi');
  });
});
