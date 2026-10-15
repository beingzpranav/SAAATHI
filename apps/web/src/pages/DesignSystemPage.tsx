import React, { useState } from 'react';
import { Compass, Users, ShieldCheck, Search, Sparkles, HelpCircle } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  Modal,
  Drawer,
  Tabs,
  Skeleton,
  Badge,
  Tooltip,
  ProgressBar,
  EmptyState,
  ErrorState,
} from '../components/ui/index.js';
import { useUiStore } from '../stores/ui.store.js';
import { env } from '../config/env.js';

export const DesignSystemPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [selectValue, setSelectValue] = useState('electrician');
  const showToast = useUiStore((state) => state.showToast);

  return (
    <div className="flex flex-col gap-12 py-6">
      {/* Page Header */}
      <div className="border-b border-[#E8DDD2] dark:border-[#3D3430] pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="demo">SYSTEM DEMO</Badge>
          <Badge variant="primary">PHASE 1 SPECIFICATION</Badge>
          <Badge variant="neutral">API: {env.VITE_API_URL}</Badge>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
          SAATHI Design System Showcase
        </h1>
        <p className="text-base text-[#6A5B55] dark:text-[#B8AAA3] max-w-3xl">
          Comprehensive review of the Hearth palette, typography, spacing tokens, and every atomic
          UI component with interactive states in both light and warm charcoal dark modes.
        </p>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold">1. Color Palette (Hearth)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-[8px] bg-[#C4562B] text-white">
            <div className="font-bold text-sm">Terracotta</div>
            <div className="text-xs opacity-90">#C4562B</div>
            <div className="text-[11px] mt-2 opacity-75">Primary &amp; Joint Room</div>
          </div>
          <div className="p-4 rounded-[8px] bg-[#EFA531] text-[#291F0E]">
            <div className="font-bold text-sm">Marigold</div>
            <div className="text-xs opacity-90">#EFA531</div>
            <div className="text-[11px] mt-2 opacity-75">Student Window</div>
          </div>
          <div className="p-4 rounded-[8px] bg-[#2F7D5C] text-white">
            <div className="font-bold text-sm">Leaf Green</div>
            <div className="text-xs opacity-90">#2F7D5C</div>
            <div className="text-[11px] mt-2 opacity-75">Parent Window</div>
          </div>
          <div className="p-4 rounded-[8px] bg-[#FFFDF9] border border-[#E8DDD2] text-[#3A2E2A]">
            <div className="font-bold text-sm">Warm White</div>
            <div className="text-xs opacity-90">#FFFDF9</div>
            <div className="text-[11px] mt-2 opacity-75">Light Mode Base</div>
          </div>
          <div className="p-4 rounded-[8px] bg-[#1F1A17] text-[#F5EFEB] border border-[#3D3430]">
            <div className="font-bold text-sm">Warm Charcoal</div>
            <div className="text-xs opacity-90">#1F1A17</div>
            <div className="text-[11px] mt-2 opacity-75">Dark Mode Surface</div>
          </div>
        </div>
      </section>

      {/* 2. Buttons */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold">2. Buttons (8px Rectangular Radius)</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary Action</Button>
          <Button variant="student" leftIcon={<Sparkles className="w-4 h-4" />}>
            Student Choice
          </Button>
          <Button variant="parent" leftIcon={<ShieldCheck className="w-4 h-4" />}>
            Parent View
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium (44px min)
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="primary" isLoading>
            Loading State
          </Button>
          <Button variant="primary" disabled>
            Disabled State
          </Button>
        </div>
      </section>

      {/* 3. Inputs and Selects */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold">3. Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <Input
            label="Learner Full Name"
            placeholder="e.g. Ramesh Kumar"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (e.target.value.length < 3 && e.target.value.length > 0) {
                setInputError('Name must be at least 3 characters');
              } else {
                setInputError('');
              }
            }}
            error={inputError}
            helperText="Enter name as per Aadhaar or school records"
            leftIcon={<Users className="w-4 h-4" />}
          />

          <Select
            label="Select Vocational Trade"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            options={[
              { value: 'electrician', label: 'Electrician (CTS - 2 Years)' },
              { value: 'fitter', label: 'Fitter (CTS - 2 Years)' },
              { value: 'solar_tech', label: 'Solar Technician (1 Year)' },
              { value: 'welder', label: 'Welder (1 Year)' },
            ]}
            helperText="Curriculum recognized under NSQF"
          />
        </div>
      </section>

      {/* 4. Cards */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold">4. Cards (12px Radius)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <h3 className="font-heading text-lg font-bold mb-2">Default Card</h3>
            <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
              Neutral container card for general information, lists, and disclosures.
            </p>
          </Card>

          <Card variant="student">
            <h3 className="font-heading text-lg font-bold mb-2 text-[#915B06] dark:text-[#F8C26E]">
              Student Window Card
            </h3>
            <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
              Highlighted with the marigold border representing student choices and preferences.
            </p>
          </Card>

          <Card variant="parent">
            <h3 className="font-heading text-lg font-bold mb-2 text-[#1E573F] dark:text-[#50AF85]">
              Parent Window Card
            </h3>
            <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
              Highlighted with the leaf green border representing parental guidance and concerns.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. Badges & Confidence Labels */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold">5. Badges and Data Confidence Labels</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary">Terracotta Badge</Badge>
          <Badge variant="student">Student Badge</Badge>
          <Badge variant="parent">Parent Badge</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="demo">DEMO DATA</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Badge variant="confidence-high">Confidence: High (30+ Verified)</Badge>
          <Badge variant="confidence-medium">Confidence: Medium (10-29 Verified)</Badge>
          <Badge variant="confidence-low">Confidence: Low (&lt;10 Records)</Badge>
          <Badge variant="confidence-none">Confidence: None (No Local Data)</Badge>
        </div>
      </section>

      {/* 6. Tabs, Tooltips, Progress */}
      <section className="flex flex-col gap-6">
        <h2 className="font-heading text-2xl font-bold">6. Tabs, Tooltips, and Progress</h2>
        <div className="max-w-2xl">
          <Tabs
            tabs={[
              {
                id: 'course-info',
                label: 'Course Details',
                icon: <Compass className="w-4 h-4" />,
                content: (
                  <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
                    Electrician trade training covering domestic wiring, industrial power systems,
                    and transformer maintenance under NSQF Level 4.
                  </p>
                ),
              },
              {
                id: 'outcomes',
                label: 'Placement Figures',
                icon: <ShieldCheck className="w-4 h-4" />,
                content: (
                  <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
                    Median monthly earnings of ₹16,500 based on 42 verified graduates in Varanasi
                    district.
                  </p>
                ),
              },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 max-w-xl">
          <Tooltip content="Verified by National Council for Vocational Training">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#C4562B] cursor-pointer">
              <span>NCVT Affiliation</span>
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
            </span>
          </Tooltip>
        </div>

        <div className="flex flex-col gap-4 max-w-md">
          <ProgressBar value={75} label="Household Intake Progress" variant="primary" />
          <ProgressBar value={40} label="Student Mapping Complete" variant="student" />
          <ProgressBar value={90} label="Parent Consensus Reached" variant="parent" />
        </div>
      </section>

      {/* 7. Modal, Drawer, and Toast Triggers */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold">7. Interactive Overlays</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            Open Sample Modal
          </Button>
          <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
            Open Sample Drawer
          </Button>
          <Button
            variant="secondary"
            onClick={() => showToast('Information saved successfully', 'info')}
          >
            Trigger Info Toast
          </Button>
          <Button
            variant="parent"
            onClick={() => showToast('Preference shared with family', 'success')}
          >
            Trigger Success Toast
          </Button>
          <Button
            variant="danger"
            onClick={() => showToast('Failed to connect to verification server', 'error')}
          >
            Trigger Error Toast
          </Button>
        </div>
      </section>

      {/* 8. Skeletons, Empty and Error States */}
      <section className="flex flex-col gap-6">
        <h2 className="font-heading text-2xl font-bold">8. Asynchronous State Handlers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[12px] border border-[#E8DDD2] dark:border-[#3D3430] bg-white dark:bg-[#1F1A17] flex flex-col gap-3">
            <div className="text-xs font-bold uppercase text-[#6A5B55] dark:text-[#B8AAA3]">
              Loading Skeletons
            </div>
            <Skeleton variant="rectangular" height={32} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="70%" />
            <div className="flex gap-2 mt-2">
              <Skeleton variant="circular" width={36} height={36} />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton variant="text" />
                <Skeleton variant="text" width="50%" />
              </div>
            </div>
          </div>

          <EmptyState
            title="No Live Bookings Yet"
            description="You have not requested any video counselling appointments. Slots open within 48 hours."
            actionLabel="Request video slot"
            onAction={() => showToast('Booking opens in Phase 6', 'info')}
          />

          <ErrorState
            title="Unable to Load Records"
            description="The verified outcome records for this block could not be fetched due to network timeout."
            onRetry={() => showToast('Retrying records retrieval...', 'info')}
          />
        </div>
      </section>

      {/* Interactive Modal Instance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Consent Ledger Verification"
        description="Every share event is cryptographically hashed to protect privacy."
      >
        <div className="flex flex-col gap-4 text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
          <p>
            Your responses in the Student Window remain confidential until you choose to tap
            &quot;Share with Family&quot;.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>

      {/* Interactive Drawer Instance */}
      <Drawer
        id="demo-drawer"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Course Filter Drawer"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
            Filter trade options by duration, stipend availability, and NSQF entry step.
          </p>
          <Input placeholder="Search trades..." leftIcon={<Search className="w-4 h-4" />} />
          <Button variant="primary" onClick={() => setIsDrawerOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </Drawer>
    </div>
  );
};
