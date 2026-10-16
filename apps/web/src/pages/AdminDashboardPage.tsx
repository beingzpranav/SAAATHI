import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingDown,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  ShieldAlert,
  Activity,
  Filter,
  Phone,
  Video,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { apiClient } from '../lib/apiClient.js';
import { cn } from '../lib/cn.js';
import type {
  DashboardOverviewDto,
  ConcernBreakdownDto,
  DecisionFunnelDto,
  EscalationTrackerDto,
  HeatmapDto,
} from '@saathi/shared';

// ─── Mock fallback data for demo / offline ────────────────────────────────────
const MOCK_OVERVIEW: DashboardOverviewDto = {
  totalHouseholds: 248,
  totalLearners: 248,
  totalParents: 231,
  totalJointSessions: 189,
  totalDecisionCards: 142,
  totalCounsellorBookings: 67,
  pendingEscalations: 12,
  averageReadinessScore: 74,
  decisionCardCompletionRate: 57,
  reportGeneratedAt: new Date().toISOString(),
};

const MOCK_BREAKDOWN: ConcernBreakdownDto = {
  totalConcerns: 843,
  suppressedBuckets: 2,
  reportDate: new Date().toISOString(),
  items: [
    { category: 'FINANCIAL_WORRY', count: 312, preScoreMedian: 4.5, postScoreMedian: 2.1, sentimentShift: -2.4, resolutionRate: 78, suppressed: false },
    { category: 'JOB_PLACEMENT', count: 198, preScoreMedian: 4.2, postScoreMedian: 2.4, sentimentShift: -1.8, resolutionRate: 71, suppressed: false },
    { category: 'CAREER_INTEREST', count: 167, preScoreMedian: 3.8, postScoreMedian: 2.0, sentimentShift: -1.8, resolutionRate: 82, suppressed: false },
    { category: 'SOCIAL_STIGMA', count: 89, preScoreMedian: 4.8, postScoreMedian: 3.1, sentimentShift: -1.7, resolutionRate: 54, suppressed: false },
    { category: 'FAMILY_PRESSURE', count: 77, preScoreMedian: 4.0, postScoreMedian: 2.8, sentimentShift: -1.2, resolutionRate: 61, suppressed: false },
    { category: 'DISTANCE_TRAVEL', count: null, preScoreMedian: null, postScoreMedian: null, sentimentShift: null, resolutionRate: null, suppressed: true },
    { category: 'HOSTEL_SAFETY', count: null, preScoreMedian: null, postScoreMedian: null, sentimentShift: null, resolutionRate: null, suppressed: true },
  ],
};

const MOCK_FUNNEL: DecisionFunnelDto = {
  overallCompletionRate: 57,
  reportDate: new Date().toISOString(),
  stages: [
    { stage: 'HOUSEHOLD_INTAKE', labelEn: 'Household Intake Completed', labelHi: 'पारिवारिक जानकारी दर्ज', count: 248, dropoffFromPrevious: null },
    { stage: 'JOINT_SESSION', labelEn: 'Joint Session Started', labelHi: 'संयुक्त सत्र शुरू', count: 189, dropoffFromPrevious: 24 },
    { stage: 'COUNSELLOR_ESCALATION', labelEn: 'Counsellor Booking Made', labelHi: 'परामर्शदाता नियुक्ति', count: 67, dropoffFromPrevious: 65 },
    { stage: 'DECISION_CARD', labelEn: 'Family Decision Card Issued', labelHi: 'परिवार निर्णय पत्र जारी', count: 142, dropoffFromPrevious: null },
  ],
};

const MOCK_ESCALATIONS: EscalationTrackerDto = {
  totalEscalations: 67,
  reportDate: new Date().toISOString(),
  pending: [
    { bookingId: 'b1', householdId: 'h1', status: 'REQUESTED', mode: 'VIDEO', scheduledAt: null, counsellorName: null, district: 'Varanasi', state: 'UP', daysWaiting: 3 },
    { bookingId: 'b2', householdId: 'h2', status: 'REQUESTED', mode: 'AUDIO_ONLY', scheduledAt: null, counsellorName: null, district: 'Mirzapur', state: 'UP', daysWaiting: 6 },
  ],
  confirmed: [
    { bookingId: 'b3', householdId: 'h3', status: 'CONFIRMED', mode: 'VIDEO', scheduledAt: new Date(Date.now() + 86400000).toISOString(), counsellorName: 'Dr. Priya Varma', district: 'Varanasi', state: 'UP', daysWaiting: 1 },
  ],
  completed: [],
  cancelled: [],
};

// ─── Helper components ────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-subtext)] font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-[var(--color-text)] leading-tight">{value}</p>
        {sub && <p className="text-xs text-[var(--color-subtext)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SentimentBar({ shift, max = 5 }: { shift: number | null; max?: number }) {
  if (shift === null) return <span className="text-xs text-[var(--color-subtext)]">Suppressed</span>;
  const pct = Math.min(Math.abs(shift) / max, 1) * 100;
  const isImprovement = shift < 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', isImprovement ? 'bg-[var(--color-leaf)]' : 'bg-[var(--color-primary)]')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums w-10 text-right', isImprovement ? 'text-[var(--color-leaf)]' : 'text-[var(--color-primary)]')}>
        {isImprovement ? '' : '+'}{shift.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdminDashboardPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isHi = Boolean(i18n?.language?.startsWith('hi'));

  const [overview, setOverview] = useState<DashboardOverviewDto | null>(null);
  const [breakdown, setBreakdown] = useState<ConcernBreakdownDto | null>(null);
  const [funnel, setFunnel] = useState<DecisionFunnelDto | null>(null);
  const [escalations, setEscalations] = useState<EscalationTrackerDto | null>(null);
  const [_heatmap, setHeatmap] = useState<HeatmapDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'concerns' | 'households' | 'decisions' | 'escalations'>('concerns');
  const [activeTab, setActiveTab] = useState<'overview' | 'concerns' | 'funnel' | 'escalations'>('overview');

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [ovRes, brRes, fnRes, esRes, hmRes] = await Promise.allSettled([
        apiClient.get<DashboardOverviewDto>('/admin/dashboard/overview'),
        apiClient.get<ConcernBreakdownDto>('/admin/dashboard/concerns'),
        apiClient.get<DecisionFunnelDto>('/admin/dashboard/funnel'),
        apiClient.get<EscalationTrackerDto>('/admin/dashboard/escalations'),
        apiClient.get<HeatmapDto>('/admin/dashboard/heatmap'),
      ]);

      setOverview(ovRes.status === 'fulfilled' ? ovRes.value.data : MOCK_OVERVIEW);
      setBreakdown(brRes.status === 'fulfilled' ? brRes.value.data : MOCK_BREAKDOWN);
      setFunnel(fnRes.status === 'fulfilled' ? fnRes.value.data : MOCK_FUNNEL);
      setEscalations(esRes.status === 'fulfilled' ? esRes.value.data : MOCK_ESCALATIONS);
      setHeatmap(hmRes.status === 'fulfilled' ? hmRes.value.data : null);
    } catch {
      setOverview(MOCK_OVERVIEW);
      setBreakdown(MOCK_BREAKDOWN);
      setFunnel(MOCK_FUNNEL);
      setEscalations(MOCK_ESCALATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadAll(); }, []);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(
        `/api/v1/admin/dashboard/export?type=${exportType}`,
        { credentials: 'include' },
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saathi-${exportType}-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail in demo mode
    } finally {
      setIsExporting(false);
    }
  };

  const ov = overview ?? MOCK_OVERVIEW;
  const br = breakdown ?? MOCK_BREAKDOWN;
  const fn = funnel ?? MOCK_FUNNEL;
  const es = escalations ?? MOCK_ESCALATIONS;

  const maxFunnelCount = Math.max(...fn.stages.map((s) => s.count), 1);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {isHi ? 'SAATHI प्रशासन डैशबोर्ड' : 'SAATHI Admin Dashboard'}
            </h1>
            <p className="text-sm text-[var(--color-subtext)] mt-0.5">
              {isHi
                ? 'राज्य व जिला स्तरीय डेटा — k-अनामिकता गोपनीयता संरक्षण के साथ'
                : 'State & district level data — k-anonymity privacy protection active'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button id="refresh-dashboard-btn" variant="outline" size="sm" onClick={loadAll} isLoading={isLoading}>
              <RefreshCw className="w-4 h-4" />
              <span>{isHi ? 'रीफ्रेश' : 'Refresh'}</span>
            </Button>
            <select
              id="csv-export-type-select"
              value={exportType}
              onChange={(e) => setExportType(e.target.value as typeof exportType)}
              className="text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="concerns">Concerns CSV</option>
              <option value="households">Households CSV</option>
              <option value="decisions">Decisions CSV</option>
              <option value="escalations">Escalations CSV</option>
            </select>
            <Button id="export-csv-btn" variant="primary" size="sm" onClick={handleExportCsv} isLoading={isExporting}>
              <Download className="w-4 h-4" />
              <span>{isHi ? 'CSV निर्यात' : 'Export CSV'}</span>
            </Button>
          </div>
        </div>

        {/* ── Privacy Shield Banner ───────────────────────────────────── */}
        <div className="rounded-xl border border-[var(--color-leaf)]/30 bg-[var(--color-leaf)]/8 px-4 py-3 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[var(--color-leaf)] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-text)]">
            <strong className="text-[var(--color-leaf)]">
              {isHi ? 'k-अनामिकता सुरक्षा सक्रिय' : 'K-Anonymity Privacy Protection Active'}:
            </strong>
            {' '}{isHi
              ? `किसी भी बकेट में 10 से कम उत्तरदाताओं वाले डेटा को "SUPPRESSED" के रूप में चिह्नित किया गया है। ${br.suppressedBuckets} बकेट वर्तमान में छुपाए गए हैं।`
              : `Any metric bucket with fewer than 10 respondents is suppressed. ${br.suppressedBuckets} bucket${br.suppressedBuckets !== 1 ? 's' : ''} currently suppressed.`}
          </p>
        </div>

        {/* ── Overview Stats Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label={isHi ? 'कुल परिवार' : 'Total Households'} value={ov.totalHouseholds} color="bg-[var(--color-primary)]/10 text-[var(--color-primary)]" />
          <StatCard icon={FileText} label={isHi ? 'निर्णय पत्र' : 'Decision Cards'} value={ov.totalDecisionCards} sub={`${ov.decisionCardCompletionRate}% completion`} color="bg-[var(--color-leaf)]/10 text-[var(--color-leaf)]" />
          <StatCard icon={Activity} label={isHi ? 'संयुक्त सत्र' : 'Joint Sessions'} value={ov.totalJointSessions} color="bg-[var(--color-marigold)]/10 text-[var(--color-marigold)]" />
          <StatCard icon={AlertTriangle} label={isHi ? 'लंबित नियुक्तियां' : 'Pending Escalations'} value={ov.pendingEscalations} color="bg-red-500/10 text-red-500" />
          <StatCard icon={Users} label={isHi ? 'शिक्षार्थी' : 'Learners'} value={ov.totalLearners} color="bg-[var(--color-student)]/10 text-[var(--color-student)]" />
          <StatCard icon={Users} label={isHi ? 'अभिभावक' : 'Parents'} value={ov.totalParents} color="bg-[var(--color-parent)]/10 text-[var(--color-parent)]" />
          <StatCard icon={Phone} label={isHi ? 'परामर्श नियुक्तियां' : 'Counsellor Bookings'} value={ov.totalCounsellorBookings} color="bg-[var(--color-primary-light)] text-[var(--color-primary)]" />
          <StatCard
            icon={ov.averageReadinessScore !== null ? CheckCircle2 : ShieldAlert}
            label={isHi ? 'औसत तत्परता स्कोर' : 'Avg Readiness Score'}
            value={ov.averageReadinessScore !== null ? `${ov.averageReadinessScore}%` : 'Suppressed'}
            color="bg-teal-500/10 text-teal-500"
          />
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-[var(--color-raised)] p-1 rounded-xl border border-[var(--color-border)] overflow-x-auto">
          {([
            { key: 'overview', labelEn: 'Overview', labelHi: 'अवलोकन', icon: BarChart3 },
            { key: 'concerns', labelEn: 'Concerns & Sentiment', labelHi: 'चिंताएं और भावना', icon: TrendingDown },
            { key: 'funnel', labelEn: 'Decision Funnel', labelHi: 'निर्णय फनल', icon: Filter },
            { key: 'escalations', labelEn: 'Escalations', labelHi: 'नियुक्तियां', icon: AlertTriangle },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              id={`admin-tab-${tab.key}`}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                activeTab === tab.key
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-subtext)] hover:text-[var(--color-text)]',
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{isHi ? tab.labelHi : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────── */}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle>{isHi ? 'कार्यक्रम स्वास्थ्य अवलोकन' : 'Programme Health Overview'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-subtext)]">{isHi ? 'निर्णय पत्र पूर्णता दर' : 'Decision Card Completion Rate'}</span>
                  <span className="font-bold text-[var(--color-text)]">{ov.decisionCardCompletionRate}%</span>
                </div>
                <div className="h-3 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-leaf)] rounded-full transition-all"
                    style={{ width: `${ov.decisionCardCompletionRate}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--color-subtext)]">
                  {isHi
                    ? `रिपोर्ट तैयार की गई: ${new Date(ov.reportGeneratedAt).toLocaleString('hi-IN')}`
                    : `Report generated: ${new Date(ov.reportGeneratedAt).toLocaleString('en-IN')}`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Concern Breakdown Tab */}
        {activeTab === 'concerns' && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isHi ? 'श्रेणी-वार चिंता विश्लेषण और भावना बदलाव' : 'Concern Breakdown & Sentiment Shifts'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-2 px-3 py-1 text-xs font-semibold text-[var(--color-subtext)] border-b border-[var(--color-border)]">
                  <span className="col-span-3">{isHi ? 'श्रेणी' : 'Category'}</span>
                  <span className="col-span-1 text-right">{isHi ? 'संख्या' : 'Count'}</span>
                  <span className="col-span-4">{isHi ? 'भावना बदलाव (↓ बेहतर)' : 'Sentiment Shift (↓ better)'}</span>
                  <span className="col-span-2 text-right">{isHi ? 'समाधान %' : 'Resolution %'}</span>
                  <span className="col-span-2 text-right">{isHi ? 'स्थिति' : 'Status'}</span>
                </div>
                {br.items.map((item) => (
                  <div
                    key={item.category}
                    className={cn(
                      'grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg text-sm items-center',
                      item.suppressed
                        ? 'bg-[var(--color-raised)]/50 opacity-60'
                        : 'hover:bg-[var(--color-raised)] transition-colors',
                    )}
                  >
                    <span className="col-span-3 font-medium text-[var(--color-text)] text-xs truncate">
                      {item.category.replace(/_/g, ' ')}
                    </span>
                    <span className="col-span-1 text-right tabular-nums text-xs text-[var(--color-subtext)]">
                      {item.count !== null ? item.count : '—'}
                    </span>
                    <div className="col-span-4">
                      <SentimentBar shift={item.sentimentShift} />
                    </div>
                    <span className="col-span-2 text-right tabular-nums text-xs text-[var(--color-subtext)]">
                      {item.resolutionRate !== null ? `${item.resolutionRate}%` : '—'}
                    </span>
                    <div className="col-span-2 flex justify-end">
                      {item.suppressed ? (
                        <Badge variant="neutral" size="sm">Suppressed</Badge>
                      ) : (
                        <Badge variant="parent" size="sm">Visible</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--color-subtext)] mt-4 pt-3 border-t border-[var(--color-border)]">
                {isHi
                  ? `कुल ${br.totalConcerns} चिंताएं — ${br.suppressedBuckets} बकेट k-अनामिकता के कारण छुपाए गए`
                  : `Total ${br.totalConcerns} concerns — ${br.suppressedBuckets} bucket${br.suppressedBuckets !== 1 ? 's' : ''} suppressed by k-anonymity`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Decision Funnel Tab */}
        {activeTab === 'funnel' && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isHi ? 'परिवार निर्णय फनल' : 'Family Decision Funnel'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fn.stages.map((stage, idx) => {
                  const barWidth = Math.round((stage.count / maxFunnelCount) * 100);
                  const colors = [
                    'from-[var(--color-primary)] to-[var(--color-primary)]/70',
                    'from-[var(--color-marigold)] to-[var(--color-marigold)]/70',
                    'from-[var(--color-parent)] to-[var(--color-parent)]/70',
                    'from-[var(--color-leaf)] to-[var(--color-leaf)]/70',
                  ];
                  return (
                    <div key={stage.stage} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[var(--color-raised)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold text-[var(--color-subtext)]">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-[var(--color-text)]">
                            {isHi ? stage.labelHi : stage.labelEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-xl font-bold text-[var(--color-text)] tabular-nums">{stage.count.toLocaleString('en-IN')}</span>
                          {stage.dropoffFromPrevious !== null && (
                            <span className="text-xs font-medium text-red-500 flex items-center gap-0.5">
                              <TrendingDown className="w-3.5 h-3.5" />
                              -{stage.dropoffFromPrevious}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-3 rounded-full bg-[var(--color-border)] overflow-hidden">
                        <div
                          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', colors[idx])}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-sm text-[var(--color-subtext)]">
                    {isHi ? 'कुल पूर्णता दर' : 'Overall Completion Rate'}
                  </span>
                  <span className="text-2xl font-bold text-[var(--color-primary)]">
                    {fn.overallCompletionRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Escalation Tracker Tab */}
        {activeTab === 'escalations' && (
          <div className="space-y-4">
            {/* Pending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>{isHi ? 'लंबित नियुक्तियां' : 'Pending Bookings'}</span>
                  <Badge variant="primary" size="sm">{es.pending.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {es.pending.length === 0 ? (
                  <p className="text-sm text-[var(--color-subtext)] text-center py-4">
                    {isHi ? 'कोई लंबित नियुक्ति नहीं' : 'No pending bookings'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {es.pending.map((item) => (
                      <div key={item.bookingId} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.mode === 'VIDEO' ? <Video className="w-4 h-4 text-[var(--color-subtext)] flex-shrink-0" /> : <Phone className="w-4 h-4 text-[var(--color-subtext)] flex-shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--color-text)] truncate">{item.district}, {item.state}</p>
                            <p className="text-xs text-[var(--color-subtext)]">HH: {item.householdId.slice(0, 8)}…</p>
                          </div>
                        </div>
                        <Badge variant="primary" size="sm">{item.daysWaiting}d waiting</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confirmed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-leaf)]" />
                  <span>{isHi ? 'पुष्टिकृत नियुक्तियां' : 'Confirmed Bookings'}</span>
                  <Badge variant="parent" size="sm">{es.confirmed.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {es.confirmed.length === 0 ? (
                  <p className="text-sm text-[var(--color-subtext)] text-center py-4">
                    {isHi ? 'कोई पुष्टिकृत नियुक्ति नहीं' : 'No confirmed bookings'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {es.confirmed.map((item) => (
                      <div key={item.bookingId} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-leaf)]/5 border border-[var(--color-leaf)]/20 text-sm gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.mode === 'VIDEO' ? <Video className="w-4 h-4 text-[var(--color-subtext)] flex-shrink-0" /> : <Phone className="w-4 h-4 text-[var(--color-subtext)] flex-shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--color-text)] truncate">{item.district}, {item.state}</p>
                            <p className="text-xs text-[var(--color-subtext)]">{item.counsellorName ?? 'Unassigned'} · {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('en-IN') : 'TBD'}</p>
                          </div>
                        </div>
                        <Badge variant="parent" size="sm">Confirmed</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-xs text-[var(--color-subtext)] text-center">
              {isHi ? `कुल ${es.totalEscalations} नियुक्तियां` : `Total ${es.totalEscalations} escalations tracked`}
            </p>
          </div>
        )}

        {/* ── Footer note ─────────────────────────────────────────────── */}
        <p className="text-xs text-[var(--color-subtext)] text-center pb-4">
          {isHi
            ? 'SAATHI प्रशासन · SIH 2026 · सभी डेटा k-अनामिकता (न्यूनतम 10 प्रतिभागी) से संरक्षित'
            : 'SAATHI Admin · SIH 2026 · All data protected by k-anonymity (minimum 10 respondents per bucket)'}
        </p>
      </div>
    </div>
  );
};
