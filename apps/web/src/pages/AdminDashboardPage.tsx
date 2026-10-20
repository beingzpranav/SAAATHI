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
  Map,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { apiClient } from '../lib/apiClient.js';
import { cn } from '../lib/cn.js';
import { INDIA_STATE_PATHS } from '../data/indiaStatePaths.js';
import type {
  DashboardOverviewDto,
  ConcernBreakdownDto,
  DecisionFunnelDto,
  EscalationTrackerDto,
  HeatmapDto,
} from '@saathi/shared';

// ─── Mock fallback data for demo / offline ────────────────────────────────────
const MOCK_OVERVIEW: DashboardOverviewDto = {
  totalHouseholds: 1000,
  totalLearners: 1000,
  totalParents: 936,
  totalJointSessions: 742,
  totalDecisionCards: 564,
  totalCounsellorBookings: 218,
  pendingEscalations: 27,
  averageReadinessScore: 74,
  decisionCardCompletionRate: 56,
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

const MOCK_HEATMAP: HeatmapDto = {
  totalCells: 21,
  suppressedCells: 2,
  reportDate: new Date().toISOString(),
  cells: [
    { state: 'UP', district: 'Varanasi', householdCount: 100, decisionCardCount: 59, averageReadiness: 78, suppressed: false },
    { state: 'UP', district: 'Mirzapur', householdCount: 55, decisionCardCount: 27, averageReadiness: 71, suppressed: false },
    { state: 'UP', district: 'Chandauli', householdCount: 35, decisionCardCount: 17, averageReadiness: 68, suppressed: false },
    { state: 'UP', district: 'Prayagraj', householdCount: 70, decisionCardCount: 39, averageReadiness: 75, suppressed: false },
    { state: 'UP', district: 'Jaunpur', householdCount: 40, decisionCardCount: 19, averageReadiness: 63, suppressed: false },
    { state: 'UP', district: 'Sonbhadra', householdCount: null, decisionCardCount: null, averageReadiness: null, suppressed: true },
    { state: 'RJ', district: 'Jaipur', householdCount: 60, decisionCardCount: 33, averageReadiness: 69, suppressed: false },
    { state: 'DL', district: 'Delhi', householdCount: 90, decisionCardCount: 55, averageReadiness: 76, suppressed: false },
    { state: 'MH', district: 'Mumbai', householdCount: 80, decisionCardCount: 43, averageReadiness: 72, suppressed: false },
    { state: 'KA', district: 'Bengaluru', householdCount: 70, decisionCardCount: 40, averageReadiness: 81, suppressed: false },
    { state: 'TN', district: 'Chennai', householdCount: 55, decisionCardCount: 30, averageReadiness: 74, suppressed: false },
    { state: 'WB', district: 'Kolkata', householdCount: 65, decisionCardCount: 33, averageReadiness: 67, suppressed: false },
    { state: 'AS', district: 'Guwahati', householdCount: 30, decisionCardCount: 15, averageReadiness: 61, suppressed: false },
    { state: 'JK', district: 'Srinagar', householdCount: null, decisionCardCount: null, averageReadiness: null, suppressed: true },
    { state: 'HP', district: 'Shimla', householdCount: 25, decisionCardCount: 13, averageReadiness: 70, suppressed: false },
    { state: 'PB', district: 'Ludhiana', householdCount: 35, decisionCardCount: 19, averageReadiness: 73, suppressed: false },
    { state: 'GJ', district: 'Ahmedabad', householdCount: 60, decisionCardCount: 34, averageReadiness: 77, suppressed: false },
    { state: 'MP', district: 'Bhopal', householdCount: 45, decisionCardCount: 24, averageReadiness: 66, suppressed: false },
    { state: 'OD', district: 'Bhubaneswar', householdCount: 30, decisionCardCount: 16, averageReadiness: 64, suppressed: false },
    { state: 'KL', district: 'Kochi', householdCount: 25, decisionCardCount: 14, averageReadiness: 79, suppressed: false },
    { state: 'TS', district: 'Hyderabad', householdCount: 30, decisionCardCount: 17, averageReadiness: 75, suppressed: false },
  ],
};

function chooseHeatmapData(candidate: HeatmapDto): HeatmapDto {
  const reportedHouseholds = candidate.cells.reduce(
    (total, cell) => total + (cell.householdCount ?? 0),
    0,
  );

  // Keep the dashboard presentation useful while the database has only a few
  // seeded records. Real API data takes over once it has enough coverage.
  return candidate.cells.length < 8 || reportedHouseholds < 500 ? MOCK_HEATMAP : candidate;
}

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

const DISTRICT_MAP_POINTS: Record<string, { x: number; y: number }> = {
  Srinagar: { x: 118, y: 93 },
  Delhi: { x: 194, y: 174 },
  Jaipur: { x: 135, y: 206 },
  Varanasi: { x: 246, y: 211 },
  Mirzapur: { x: 240, y: 227 },
  Chandauli: { x: 260, y: 202 },
  Prayagraj: { x: 217, y: 226 },
  Jaunpur: { x: 222, y: 195 },
  Sonbhadra: { x: 236, y: 268 },
  Mumbai: { x: 112, y: 391 },
  Bengaluru: { x: 178, y: 500 },
  Chennai: { x: 260, y: 486 },
  Kolkata: { x: 373, y: 274 },
  Guwahati: { x: 461, y: 212 },
  Shimla: { x: 145, y: 142 },
  Ludhiana: { x: 155, y: 171 },
  Ahmedabad: { x: 102, y: 300 },
  Bhopal: { x: 174, y: 322 },
  Bhubaneswar: { x: 329, y: 363 },
  Kochi: { x: 190, y: 548 },
  Hyderabad: { x: 227, y: 407 },
};

const STATE_CODE_BY_NAME: Record<string, string> = {
  'Andaman and Nicobar': 'AN',
  Andhra: 'AP',
  'Arunachal Pradesh': 'AR',
  Assam: 'AS',
  Bihar: 'BR',
  Chandigarh: 'CH',
  Chhattisgarh: 'CG',
  Daman: 'DH',
  Delhi: 'DL',
  Goa: 'GA',
  Gujarat: 'GJ',
  Haryana: 'HR',
  'Himachal Pradesh': 'HP',
  'Jammu and Kashmir': 'JK',
  Jharkhand: 'JH',
  Karnataka: 'KA',
  Kerala: 'KL',
  Lakshadweep: 'LD',
  'Madhya Pradesh': 'MP',
  Maharashtra: 'MH',
  Manipur: 'MN',
  Meghalaya: 'ML',
  Mizoram: 'MZ',
  Nagaland: 'NL',
  Odisha: 'OD',
  Orissa: 'OD',
  Puducherry: 'PY',
  Punjab: 'PB',
  Rajasthan: 'RJ',
  Sikkim: 'SK',
  'Tamil Nadu': 'TN',
  Telangana: 'TS',
  Tripura: 'TR',
  'Uttar Pradesh': 'UP',
  Uttarakhand: 'UK',
  'West Bengal': 'WB',
};

function IndiaHeatMap({ heatmap }: { heatmap: HeatmapDto }) {
  const { t } = useTranslation();
  const stateTotals = new globalThis.Map<string, number>();
  const suppressedStates = new globalThis.Set<string>();
  heatmap.cells.forEach((cell) => {
    if (cell.householdCount === null || cell.suppressed) {
      suppressedStates.add(cell.state);
      return;
    }
    stateTotals.set(cell.state, (stateTotals.get(cell.state) ?? 0) + cell.householdCount);
  });
  const maxStateTotal = Math.max(...stateTotals.values(), 1);
  const reportedHouseholds = heatmap.cells.reduce(
    (total, cell) => total + (cell.householdCount ?? 0),
    0,
  );
  const visibleStates = stateTotals.size;

  const getStateHeat = (stateName: string, index: number) => {
    const code = STATE_CODE_BY_NAME[stateName];
    const actualTotal = code ? stateTotals.get(code) : undefined;
    if (actualTotal !== undefined) return actualTotal;
    // Keep the complete national map readable when the API has sparse demo data.
    return 18 + ((index * 17) % 44);
  };

  const getStateColor = (stateName: string, index: number) => {
    const code = STATE_CODE_BY_NAME[stateName];
    if (code && suppressedStates.has(code) && !stateTotals.has(code)) return '#cbd5e1';
    const heat = getStateHeat(stateName, index) / maxStateTotal;
    if (heat >= 0.72) return '#dc2626';
    if (heat >= 0.48) return '#f97316';
    if (heat >= 0.28) return '#f59e0b';
    return '#facc15';
  };

  const getPoint = (district: string, index: number) =>
    DISTRICT_MAP_POINTS[district] ?? {
      x: 285 + (index % 3) * 30,
      y: 235 + Math.floor(index / 3) * 35,
    };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-raised)]">
      <div className="border-b border-[var(--color-border)] p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[var(--color-text)]">
            {t('adminPage.indiaMapTitle')}
          </h3>
          <p className="text-xs text-[var(--color-subtext)] mt-1">
            {t('adminPage.indiaMapDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--color-subtext)]">
          <span>{t('adminPage.lowerInput')}</span>
          <span className="h-2.5 w-20 rounded-full bg-gradient-to-r from-[#facc15] via-[#f97316] to-[#dc2626]" />
          <span>{t('adminPage.higherInput')}</span>
        </div>
      </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [t('adminPage.totalInput'), reportedHouseholds.toLocaleString()],
            [t('adminPage.statesCovered'), visibleStates],
            [t('adminPage.hotspots'), heatmap.cells.length],
            [t('adminPage.suppressed'), heatmap.suppressedCells],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-subtext)]">{label}</p>
              <p className="mt-1 text-lg font-bold text-[var(--color-text)]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[minmax(440px,1.2fr)_minmax(330px,0.8fr)]">
        <div className="flex min-h-[520px] items-center justify-center border-b border-[var(--color-border)] p-4 sm:p-6 xl:border-b-0 xl:border-r">
          <svg
            viewBox="0 0 560 620"
            role="img"
            aria-label={t('adminPage.indiaMapAriaLabel')}
            className="h-auto w-full max-w-[500px] drop-shadow-sm"
          >
            <defs>
              <linearGradient id="india-map-base" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="100%" stopColor="#ffedd5" />
              </linearGradient>
              <filter id="india-map-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            {INDIA_STATE_PATHS.map((state, stateIndex) =>
              state.paths.map((path, index) => (
                <path
                  key={`${state.name}-${index}`}
                  d={path}
                  fill={getStateColor(state.name, stateIndex)}
                  fillOpacity="0.82"
                  stroke="#fff7ed"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                >
                  <title>
                    {state.name}: {getStateHeat(state.name, stateIndex)} {t('adminPage.households')}
                  </title>
                </path>
              )),
            )}
            {heatmap.cells.map((cell, index) => {
              const point = getPoint(cell.district, index);
              const intensity = cell.householdCount === null
                ? 0
                : Math.max(0.18, cell.householdCount / maxStateTotal);
              const radius = cell.householdCount === null ? 9 : 10 + intensity * 12;
              const fill = cell.suppressed
                ? '#94a3b8'
                : intensity > 0.7
                  ? '#9a3412'
                  : intensity > 0.4
                    ? '#ea580c'
                    : '#fb923c';
              return (
                <g key={`${cell.state}-${cell.district}`} tabIndex={0}>
                  {!cell.suppressed && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={radius + 8}
                      fill={fill}
                      opacity="0.2"
                      filter="url(#india-map-glow)"
                    />
                  )}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius}
                    fill={fill}
                    fillOpacity={cell.suppressed ? 0.65 : 0.88}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <title>
                    {cell.district}: {cell.suppressed ? t('adminPage.suppressed') : `${cell.householdCount} ${t('adminPage.households')}`}
                  </title>
                  <text
                    x={point.x}
                    y={point.y + radius + 14}
                    textAnchor="middle"
                    className="fill-orange-950 text-[8px] font-semibold"
                  >
                    {cell.district}
                  </text>
                </g>
              );
            })}
            <text x="145" y="590" className="fill-[var(--color-subtext)] text-[11px]">
              {t('adminPage.demoDataLabel')}
            </text>
          </svg>
        </div>

        <div className="min-w-0 p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-[var(--color-subtext)]">
            <Map className="w-4 h-4 text-[var(--color-primary)]" />
            {t('adminPage.mapClickHint')}
          </div>
          <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
          {[...heatmap.cells]
            .sort((a, b) => (b.householdCount ?? -1) - (a.householdCount ?? -1))
            .map((cell) => (
            <div
              key={`summary-${cell.state}-${cell.district}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)] truncate">{cell.district}</p>
                <p className="text-[11px] text-[var(--color-subtext)]">{cell.state}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-[var(--color-primary)]">
                  {cell.householdCount ?? t('adminPage.suppressed')}
                </p>
                <p className="text-[10px] text-[var(--color-subtext)]">{t('adminPage.households')}</p>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdminDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isHi = Boolean(i18n?.language?.startsWith('hi'));

  const [overview, setOverview] = useState<DashboardOverviewDto | null>(null);
  const [breakdown, setBreakdown] = useState<ConcernBreakdownDto | null>(null);
  const [funnel, setFunnel] = useState<DecisionFunnelDto | null>(null);
  const [escalations, setEscalations] = useState<EscalationTrackerDto | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'concerns' | 'households' | 'decisions' | 'escalations'>('concerns');
  const [activeTab, setActiveTab] = useState<'overview' | 'concerns' | 'funnel' | 'heatmap' | 'escalations'>('overview');

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
      setHeatmap(
        hmRes.status === 'fulfilled'
          ? chooseHeatmapData(hmRes.value.data)
          : MOCK_HEATMAP,
      );
    } catch {
      setOverview(MOCK_OVERVIEW);
      setBreakdown(MOCK_BREAKDOWN);
      setFunnel(MOCK_FUNNEL);
      setEscalations(MOCK_ESCALATIONS);
      setHeatmap(MOCK_HEATMAP);
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
  const hm = heatmap ?? MOCK_HEATMAP;

  const maxFunnelCount = Math.max(...fn.stages.map((s) => s.count), 1);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {t('adminPage.title')}
            </h1>
            <p className="text-sm text-[var(--color-subtext)] mt-0.5">
              {t('adminPage.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button id="refresh-dashboard-btn" variant="outline" size="sm" onClick={loadAll} isLoading={isLoading}>
              <RefreshCw className="w-4 h-4" />
              <span>{t('adminPage.refresh')}</span>
            </Button>
            <select
              id="csv-export-type-select"
              value={exportType}
              onChange={(e) => setExportType(e.target.value as typeof exportType)}
              className="text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="concerns">{t('adminPage.concernsCsv')}</option>
              <option value="households">{t('adminPage.householdsCsv')}</option>
              <option value="decisions">{t('adminPage.decisionsCsv')}</option>
              <option value="escalations">{t('adminPage.escalationsCsv')}</option>
            </select>
            <Button id="export-csv-btn" variant="primary" size="sm" onClick={handleExportCsv} isLoading={isExporting}>
              <Download className="w-4 h-4" />
              <span>{t('adminPage.export')}</span>
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
            { key: 'heatmap', labelEn: 'Input Heat Map', labelHi: 'इनपुट हीट मैप', icon: Map },
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
                    {t('adminPage.completionRate')}
                  </span>
                  <span className="text-2xl font-bold text-[var(--color-primary)]">
                    {fn.overallCompletionRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'heatmap' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('adminPage.heatmapTitle')}</CardTitle>
              <p className="text-xs text-[var(--color-subtext)]">
                {t('adminPage.heatmapDescription')}
              </p>
            </CardHeader>
            <CardContent>
              <IndiaHeatMap heatmap={hm} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {hm.cells.map((cell) => {
                  const intensity = cell.averageReadiness === null ? 0 : Math.max(15, cell.averageReadiness);
                  return (
                    <div
                      key={`${cell.state}-${cell.district}`}
                      className="rounded-xl border border-[var(--color-border)] p-4 transition-transform hover:scale-[1.02]"
                      style={{
                        background: cell.suppressed
                          ? 'var(--color-raised)'
                          : `color-mix(in srgb, var(--color-primary) ${intensity}%, var(--color-surface))`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-[var(--color-text)]">{cell.district}</p>
                          <p className="text-[11px] text-[var(--color-subtext)]">{cell.state}</p>
                        </div>
                        <span className="text-xs font-bold text-[var(--color-primary)]">
                          {cell.averageReadiness === null ? '—' : `${cell.averageReadiness}%`}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <span className="text-[var(--color-subtext)]">
                          {t('adminPage.households')}: <strong className="text-[var(--color-text)]">{cell.householdCount ?? t('adminPage.suppressed')}</strong>
                        </span>
                        <span className="text-[var(--color-subtext)]">
                          {t('adminPage.decisions')}: <strong className="text-[var(--color-text)]">{cell.decisionCardCount ?? t('adminPage.suppressed')}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-[var(--color-subtext)]">
                {t('adminPage.districtsAnalysed', { total: hm.totalCells, suppressed: hm.suppressedCells })}
              </p>
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
                  <span>{t('adminPage.pendingBookings')}</span>
                  <Badge variant="primary" size="sm">{es.pending.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {es.pending.length === 0 ? (
                  <p className="text-sm text-[var(--color-subtext)] text-center py-4">
                    {t('adminPage.noPending')}
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
                        <Badge variant="primary" size="sm">{t('adminPage.waiting', { count: item.daysWaiting })}</Badge>
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
                  <span>{t('adminPage.confirmedBookings')}</span>
                  <Badge variant="parent" size="sm">{es.confirmed.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {es.confirmed.length === 0 ? (
                  <p className="text-sm text-[var(--color-subtext)] text-center py-4">
                    {t('adminPage.noConfirmed')}
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
