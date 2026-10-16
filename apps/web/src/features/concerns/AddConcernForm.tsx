import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { apiClient } from '../../lib/apiClient.js';
import { cn } from '../../lib/cn.js';
import type { ConcernCategory } from '@saathi/shared';

/* ------------------------------------------------------------------ */
/* Add-concern form                                                    */
/* ------------------------------------------------------------------ */
export const AddConcernForm: React.FC<{
  accentColor: string;
  onAddSuccess?: (concern: any) => void;
}> = ({ accentColor, onAddSuccess }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<ConcernCategory | string>('FINANCIAL_WORRY');
  const [isAdding, setIsAdding] = useState(false);
  
  const categories: { key: ConcernCategory; labelEn: string; labelHi: string }[] = [
    { key: 'FINANCIAL_WORRY', labelEn: 'Financial', labelHi: 'वित्तीय' },
    { key: 'CAREER_INTEREST', labelEn: 'Career', labelHi: 'करियर' },
    { key: 'WORK_ENVIRONMENT', labelEn: 'Work Environment', labelHi: 'कार्य स्थल' },
    { key: 'SOCIAL_RESPECT', labelEn: 'Social', labelHi: 'सामाजिक' },
    { key: 'MIGRATION_DISTANCE', labelEn: 'Distance', labelHi: 'दूरी' },
    { key: 'TIME_HORIZON', labelEn: 'Timeline', labelHi: 'समय' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 3) return;

    setIsAdding(true);
    try {
      const input: any = {
        questionKey: `concern_${category}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        answerValue: text.trim(),
        category: category,
      };

      const res = await apiClient.post<any>('/concerns', input);
      onAddSuccess?.(res.data);
      setText('');
      setCategory('FINANCIAL_WORRY');
    } catch (error) {
      console.error('Failed to add concern:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-raised)]">
      <textarea
        id="new-concern-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe your concern or question..."
        rows={2}
        className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-subtext)] resize-none outline-none"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategory(cat.key)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-lg border transition-colors',
                category === cat.key
                  ? 'border-transparent font-medium'
                  : 'border-[var(--color-border)] text-[var(--color-subtext)] hover:text-[var(--color-text)]',
              )}
              style={
                category === cat.key
                  ? { background: `${accentColor}22`, color: accentColor, borderColor: `${accentColor}44` }
                  : {}
              }
            >
              {cat.labelEn}
            </button>
          ))}
        </div>
        <button
          type="submit"
          id="add-concern-submit"
          disabled={!text.trim() || isAdding}
          className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-medium text-white disabled:opacity-40 transition-opacity"
          style={{ background: accentColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
};
