import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, LogOut } from 'lucide-react';
import { useSessionStore } from '../stores/session.store.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';

export const DashboardPreviewPage: React.FC = () => {
  const { user, logout } = useSessionStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const roleBadgeVariant =
    user.role === 'LEARNER' ? 'student' : user.role === 'PARENT' ? 'parent' : 'primary';

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* User Header Profile */}
      <div className="p-6 rounded-[12px] border border-[#E8DDD2] bg-white dark:bg-[#1F1A17] dark:border-[#3D3430] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[8px] bg-[#F8EDE7] dark:bg-[#32211B] flex items-center justify-center text-[#C4562B] dark:text-[#D86A3E]">
            <User className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-heading text-2xl font-bold">{user.name}</h1>
              <Badge variant={roleBadgeVariant}>{user.role}</Badge>
              {user.isMinor && <Badge variant="neutral">Minor (&lt;18)</Badge>}
            </div>
            <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">{user.email}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Sign out
        </Button>
      </div>

      {/* Household Intake Prompt Card */}
      <Card variant="default" className="border-[#C4562B]/30 bg-[#FFFDF9] dark:bg-[#1F1A17]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="primary">STEP 2</Badge>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3]">
                Household Intake
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold">
              Complete Your Family Intake Assessment
            </h2>
            <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3] leading-relaxed">
              Tell us your district, block, and schooling level so the Bhavishya Engine can filter
              local vocational courses and placement figures.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => alert('Household intake will open in Phase 3!')}
          >
            Start Household Intake
          </Button>
        </div>
      </Card>

      {/* Counselling Windows Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="student" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-lg text-[#915B06] dark:text-[#F8C26E]">
              Student Window
            </span>
            <Badge variant="student">PIN Protected</Badge>
          </div>
          <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
            Confidential space for learner trade aspirations, safety priorities, and pay
            expectations.
          </p>
          <div className="mt-auto pt-2">
            <Button variant="outline" size="sm" disabled className="w-full">
              Requires Household Intake (Phase 3 &amp; 4)
            </Button>
          </div>
        </Card>

        <Card variant="parent" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-lg text-[#1E573F] dark:text-[#50AF85]">
              Parent Window
            </span>
            <Badge variant="parent">PIN Protected</Badge>
          </div>
          <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
            Confidential space for parent concerns regarding financial stability, job dignity, and
            location risks.
          </p>
          <div className="mt-auto pt-2">
            <Button variant="outline" size="sm" disabled className="w-full">
              Requires Household Intake (Phase 3 &amp; 4)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
