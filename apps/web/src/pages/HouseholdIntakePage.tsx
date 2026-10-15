import React from 'react';
import { HouseholdIntakeForm } from '../features/household/components/HouseholdIntakeForm.js';

export const HouseholdIntakePage: React.FC = () => {
  return (
    <div className="py-6 sm:py-10">
      <HouseholdIntakeForm />
    </div>
  );
};
