import React, { useState } from 'react';
import { cn } from '../../lib/cn.js';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTabId, onChange, className }) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className={cn('w-full flex flex-col', className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex border-b border-[#E8DDD2] dark:border-[#3D3430] gap-2 overflow-x-auto"
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 font-semibold text-sm transition-colors border-b-2 -mb-[2px] rounded-t-[8px] min-h-[44px] whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B]',
                isSelected
                  ? 'border-[#C4562B] text-[#C4562B] dark:border-[#D86A3E] dark:text-[#D86A3E]'
                  : 'border-transparent text-[#6A5B55] hover:text-[#3A2E2A] hover:bg-[#F3ECE4]/50 dark:text-[#B8AAA3] dark:hover:text-[#F5EFEB] dark:hover:bg-[#2A2320]/50',
              )}
            >
              {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {currentTab && (
        <div
          role="tabpanel"
          id={`panel-${currentTab.id}`}
          aria-labelledby={`tab-${currentTab.id}`}
          className="pt-4 focus-visible:outline-none"
        >
          {currentTab.content}
        </div>
      )}
    </div>
  );
};
