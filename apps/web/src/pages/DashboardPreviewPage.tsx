import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Lock,
  Users,
  BookOpen,
  FileText,
  PhoneCall,
  BarChart3,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import type { HouseholdSummary } from '@saathi/shared';
import { useSessionStore } from '../stores/session.store.js';
import { apiClient } from '../lib/apiClient.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';

export const DashboardPreviewPage: React.FC = () => {
  const { user, household, setHousehold, logout } = useSessionStore();
  const navigate = useNavigate();

  // Load household data from API if not already in store
  useEffect(() => {
    if (!household) {
      apiClient
        .get<HouseholdSummary>('/households')
        .then((res) => {
          if (res.data?.id) setHousehold(res.data);
        })
        .catch(() => {
          // No intake yet — household stays null, intake card is shown
        });
    }
  }, [household, setHousehold]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const roleBadgeVariant =
    user.role === 'LEARNER' ? 'student' : user.role === 'PARENT' ? 'parent' : 'primary';

  const hasIntake = Boolean(household?.id);

  // Friendly income band label
  const incomeBandLabel: Record<string, string> = {
    BELOW_1_5L: 'Below ₹1.5L / year',
    '1_5L_TO_3L': '₹1.5L – ₹3L / year',
    '3L_TO_5L': '₹3L – ₹5L / year',
    ABOVE_5L: 'Above ₹5L / year',
  };

  const classLevelLabel: Record<string, string> = {
    CLASS_8_PASS: 'Class 8 Pass',
    CLASS_10_PASS: 'Class 10 Pass',
    CLASS_12_PASS: 'Class 12 Pass',
    GRADUATE: 'Graduate',
  };

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* ── User Profile Header ─────────────────────────────────────────── */}
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

      {/* ── Household Intake Card ───────────────────────────────────────── */}
      {!hasIntake ? (
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
                Tell us your district, block, and schooling level so the Bhavishya Engine can
                filter local vocational courses and placement figures.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/intake')}
            >
              Start Household Intake
            </Button>
          </div>
        </Card>
      ) : (
        /* ── Household Summary Banner (intake complete) ─────────────────── */
        (() => {
          const h = household!;
          return (
            <div className="p-5 rounded-[12px] border border-[#2F7D5C]/30 bg-[#EBF4F0] dark:bg-[#1B2F25] dark:border-[#2F7D5C]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#2F7D5C] dark:text-[#50AF85] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#1E573F] dark:text-[#50AF85]">
                    Household Intake Complete — {h.name}
                  </p>
                  <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {h.block}, {h.district}, {h.state}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {incomeBandLabel[h.incomeBand] ?? h.incomeBand}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {classLevelLabel[h.learnerClassLevel] ?? h.learnerClassLevel}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2F7D5C] dark:text-[#50AF85]" />
                <span className="text-xs font-semibold text-[#2F7D5C] dark:text-[#50AF85]">
                  {h.costFraming?.headlineEn ?? 'Subsidy eligible'}
                </span>
              </div>
            </div>
          );
        })()
      )}

      {/* ── Private Windows ─────────────────────────────────────────────── */}
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
            {hasIntake ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-[#EFA531]/60 text-[#915B06] hover:bg-[#FDF4E5] dark:border-[#F4B34C]/40 dark:text-[#F8C26E] dark:hover:bg-[#342817]"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/private')}
              >
                Open Student Window
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                leftIcon={<Lock className="w-4 h-4" />}
                className="w-full"
              >
                Complete Intake First
              </Button>
            )}
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
            {hasIntake ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-[#2F7D5C]/60 text-[#1E573F] hover:bg-[#EBF4F0] dark:border-[#419B74]/40 dark:text-[#50AF85] dark:hover:bg-[#1B2F25]"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/private')}
              >
                Open Parent Window
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                leftIcon={<Lock className="w-4 h-4" />}
                className="w-full"
              >
                Complete Intake First
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* ── Quick-Access Feature Grid ────────────────────────────────────── */}
      <div>
        <h2 className="font-heading text-lg font-bold mb-4 text-[#3A2E2A] dark:text-[#F5EFEB]">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Trade Explorer */}
          <Link
            to="/trades"
            className="group p-5 rounded-[12px] border border-[#E8DDD2] bg-white dark:bg-[#1F1A17] dark:border-[#3D3430] hover:border-[#C4562B]/50 hover:shadow-md transition-all flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-[8px] bg-[#F8EDE7] dark:bg-[#32211B] flex items-center justify-center text-[#C4562B]">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-[#3A2E2A] dark:text-[#F5EFEB] group-hover:text-[#C4562B] transition-colors">
                Trade Explorer
              </p>
              <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5 leading-relaxed">
                Browse verified ITI trades with NSQF ladders, median salaries, and placement rates.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#C4562B] mt-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Joint Room */}
          <Link
            to={hasIntake ? '/joint-room' : '#'}
            onClick={!hasIntake ? (e) => e.preventDefault() : undefined}
            className={`group p-5 rounded-[12px] border bg-white dark:bg-[#1F1A17] transition-all flex flex-col gap-3 ${
              hasIntake
                ? 'border-[#E8DDD2] dark:border-[#3D3430] hover:border-[#C4562B]/50 hover:shadow-md cursor-pointer'
                : 'border-[#E8DDD2]/50 dark:border-[#3D3430]/50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="w-10 h-10 rounded-[8px] bg-[#FDF4E5] dark:bg-[#342817] flex items-center justify-center text-[#EFA531]">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#3A2E2A] dark:text-[#F5EFEB] group-hover:text-[#C4562B] transition-colors">
                  Joint Family Room
                </p>
                {!hasIntake && (
                  <Lock className="w-3 h-3 text-[#6A5B55] dark:text-[#B8AAA3]" />
                )}
              </div>
              <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5 leading-relaxed">
                Bhavishya Engine agenda, real-time chat, grounded AI, and Readiness Score.
              </p>
            </div>
            {hasIntake && (
              <ArrowRight className="w-4 h-4 text-[#C4562B] mt-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Link>

          {/* Consent Ledger */}
          <Link
            to={hasIntake ? '/consent-ledger' : '#'}
            onClick={!hasIntake ? (e) => e.preventDefault() : undefined}
            className={`group p-5 rounded-[12px] border bg-white dark:bg-[#1F1A17] transition-all flex flex-col gap-3 ${
              hasIntake
                ? 'border-[#E8DDD2] dark:border-[#3D3430] hover:border-[#C4562B]/50 hover:shadow-md cursor-pointer'
                : 'border-[#E8DDD2]/50 dark:border-[#3D3430]/50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="w-10 h-10 rounded-[8px] bg-[#EBF4F0] dark:bg-[#1B2F25] flex items-center justify-center text-[#2F7D5C]">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#3A2E2A] dark:text-[#F5EFEB] group-hover:text-[#C4562B] transition-colors">
                  Consent Ledger
                </p>
                {!hasIntake && (
                  <Lock className="w-3 h-3 text-[#6A5B55] dark:text-[#B8AAA3]" />
                )}
              </div>
              <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5 leading-relaxed">
                SHA-256 hash-chained audit trail of every family consent action.
              </p>
            </div>
            {hasIntake && (
              <ArrowRight className="w-4 h-4 text-[#C4562B] mt-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Link>

          {/* Decision Card */}
          <Link
            to={hasIntake ? '/decision-card' : '#'}
            onClick={!hasIntake ? (e) => e.preventDefault() : undefined}
            className={`group p-5 rounded-[12px] border bg-white dark:bg-[#1F1A17] transition-all flex flex-col gap-3 ${
              hasIntake
                ? 'border-[#E8DDD2] dark:border-[#3D3430] hover:border-[#C4562B]/50 hover:shadow-md cursor-pointer'
                : 'border-[#E8DDD2]/50 dark:border-[#3D3430]/50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="w-10 h-10 rounded-[8px] bg-[#F8EDE7] dark:bg-[#32211B] flex items-center justify-center text-[#C4562B]">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#3A2E2A] dark:text-[#F5EFEB] group-hover:text-[#C4562B] transition-colors">
                  Decision Card
                </p>
                {!hasIntake && (
                  <Lock className="w-3 h-3 text-[#6A5B55] dark:text-[#B8AAA3]" />
                )}
              </div>
              <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5 leading-relaxed">
                Printable family agreement sealed with SHA-256 and SMS delivery.
              </p>
            </div>
            {hasIntake && (
              <ArrowRight className="w-4 h-4 text-[#C4562B] mt-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Link>

          {/* Live Counsellor */}
          <Link
            to="/counsellor"
            className="group p-5 rounded-[12px] border border-[#E8DDD2] bg-white dark:bg-[#1F1A17] dark:border-[#3D3430] hover:border-[#C4562B]/50 hover:shadow-md transition-all flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-[8px] bg-[#F8EDE7] dark:bg-[#32211B] flex items-center justify-center text-[#C4562B]">
              <PhoneCall className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-[#3A2E2A] dark:text-[#F5EFEB] group-hover:text-[#C4562B] transition-colors">
                Live Counsellor
              </p>
              <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5 leading-relaxed">
                WebRTC video call with NCVET-certified counsellors. 16 kbps audio fallback for 2G.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#C4562B] mt-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Admin Dashboard (visible to admins / counsellors only) */}
          {(user.role === 'ADMINISTRATOR' || user.role === 'COUNSELLOR') && (
            <Link
              to="/admin"
              className="group p-5 rounded-[12px] border border-[#E8DDD2] bg-white dark:bg-[#1F1A17] dark:border-[#3D3430] hover:border-[#C4562B]/50 hover:shadow-md transition-all flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-[8px] bg-[#F3ECE4] dark:bg-[#2A2320] flex items-center justify-center text-[#3A2E2A] dark:text-[#F5EFEB]">
                <BarChart3 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-[#3A2E2A] dark:text-[#F5EFEB] group-hover:text-[#C4562B] transition-colors">
                  Admin Dashboard
                </p>
                <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5 leading-relaxed">
                  District heatmaps, concern breakdowns, and k-anonymity intelligence.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#C4562B] mt-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}

          {/* AI Grounded Query hint */}
          <div className="p-5 rounded-[12px] border border-[#E8DDD2] bg-[#FFFDF9] dark:bg-[#1F1A17] dark:border-[#3D3430] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#FDF4E5] dark:bg-[#342817] flex items-center justify-center text-[#EFA531]">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-[#3A2E2A] dark:text-[#F5EFEB]">
                Saathi AI (Joint Room)
              </p>
              <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5 leading-relaxed">
                Grounded AI answers backed by NCVET tracer surveys. Zero hallucinations. Available
                inside the Joint Room.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-[#6A5B55] dark:text-[#B8AAA3] mt-auto uppercase tracking-wide">
              Access via Joint Room →
            </span>
          </div>
        </div>
      </div>

      {/* ── Progress Tracker ─────────────────────────────────────────────── */}
      <div className="p-5 rounded-[12px] border border-[#E8DDD2] dark:border-[#3D3430] bg-white dark:bg-[#1F1A17]">
        <h3 className="font-heading font-bold text-base mb-4 text-[#3A2E2A] dark:text-[#F5EFEB]">
          Your Counselling Journey
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
          {[
            { label: 'Register', done: true, to: null },
            { label: 'Intake', done: hasIntake, to: '/intake' },
            { label: 'Explore Trades', done: false, to: '/trades' },
            { label: 'Private Windows', done: false, to: hasIntake ? '/private' : null },
            { label: 'Joint Room', done: false, to: hasIntake ? '/joint-room' : null },
            { label: 'Decision Card', done: false, to: hasIntake ? '/decision-card' : null },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-2">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2F7D5C] dark:text-[#50AF85] shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#E8DDD2] dark:border-[#3D3430] shrink-0" />
                )}
                {step.to ? (
                  <Link
                    to={step.to}
                    className="text-sm font-medium text-[#C4562B] hover:underline"
                  >
                    {step.label}
                  </Link>
                ) : (
                  <span
                    className={`text-sm font-medium ${step.done ? 'text-[#2F7D5C] dark:text-[#50AF85]' : 'text-[#6A5B55] dark:text-[#B8AAA3]'}`}
                  >
                    {step.label}
                  </span>
                )}
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="w-3 h-3 text-[#C4562B] hidden sm:block shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
