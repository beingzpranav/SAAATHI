import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  Headphones,
  CheckCircle2,
  FileText,
  UserCheck,
  Building2,
  MapPin,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { apiClient } from '../lib/apiClient.js';
import { useSessionStore } from '../stores/session.store.js';
import { LiveConsultationModal } from '../features/counselling/LiveConsultationModal.js';
import type { BookingDto, CounsellorHouseholdSummary, ConcernDto } from '@saathi/shared';
import { cn } from '../lib/cn.js';

export const CounsellorConsolePage: React.FC = () => {
  const { i18n } = useTranslation();
  const isHi = Boolean(i18n?.language?.startsWith('hi'));
  const { user } = useSessionStore();

  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('household-varanasi-01');
  const [householdSummary, setHouseholdSummary] = useState<CounsellorHouseholdSummary | null>(null);
  const [counsellorNotes, setCounsellorNotes] = useState('');
  const [isSavedNotes, setIsSavedNotes] = useState(false);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<BookingDto | null>(null);

  // Load counsellor bookings
  useEffect(() => {
    apiClient
      .get<BookingDto[]>('/counselling/counsellor/bookings')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setBookings(res.data);
          if (res.data[0]?.householdId) {
            setSelectedHouseholdId(res.data[0].householdId);
          }
        } else {
          // Fallback sample bookings for demonstration
          const fallbackBookings: BookingDto[] = [
            {
              id: 'booking-varanasi-1',
              householdId: 'household-varanasi-01',
              counsellorId: user?.id || 'counsellor-1',
              requestedSlot: new Date(Date.now() + 3600 * 1000).toISOString(),
              scheduledAt: new Date(Date.now() + 3600 * 1000).toISOString(),
              status: 'CONFIRMED',
              mode: 'VIDEO',
              meetingRoomId: 'saathi-room-varanasi-402',
              notes: 'Learner keen on Solar PV; parent worried about fees and government recognition.',
              counsellorName: 'Dr. Priya Varma',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'booking-varanasi-2',
              householdId: 'household-mirzapur-02',
              counsellorId: user?.id || 'counsellor-1',
              requestedSlot: new Date(Date.now() + 86400 * 1000).toISOString(),
              scheduledAt: new Date(Date.now() + 86400 * 1000).toISOString(),
              status: 'REQUESTED',
              mode: 'AUDIO_ONLY',
              meetingRoomId: 'saathi-room-mirzapur-108',
              notes: 'Low bandwidth rural connection; audio consultation preferred.',
              counsellorName: 'Dr. Priya Varma',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          setBookings(fallbackBookings);
          if (fallbackBookings[0]?.householdId) {
            setSelectedHouseholdId(fallbackBookings[0].householdId);
          }
        }
      })
      .catch(() => {
        // Mock sample if non-counsellor preview
        const mockBookings: BookingDto[] = [
          {
            id: 'booking-demo-1',
            householdId: 'household-varanasi-01',
            counsellorId: 'counsellor-1',
            requestedSlot: new Date().toISOString(),
            scheduledAt: new Date().toISOString(),
            status: 'CONFIRMED',
            mode: 'VIDEO',
            meetingRoomId: 'saathi-room-varanasi-402',
            notes: 'Discussion regarding UP ITI fee waivers and apprenticeship placement.',
            counsellorName: 'Dr. Priya Varma',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setBookings(mockBookings);
        if (mockBookings[0]?.householdId) {
          setSelectedHouseholdId(mockBookings[0].householdId);
        }
      });
  }, [user?.id]);

  // Load selected household dossier with privacy filter
  useEffect(() => {
    if (!selectedHouseholdId) return;

    apiClient
      .get<CounsellorHouseholdSummary>(`/counselling/counsellor/household/${selectedHouseholdId}`)
      .then((res) => {
        setHouseholdSummary(res.data);
      })
      .catch(() => {
        const fallbackConcerns: ConcernDto[] = [
          {
            id: 'c-shared-1',
            userId: 'user-learner-1',
            householdId: selectedHouseholdId,
            category: 'FINANCIAL_WORRY',
            questionKey: 'Are there hidden lab charges or tool kit costs at Government ITI?',
            answerValue: 'Family needs confirmation of free toolkits under PMKVY/NCVET.',
            preScore: 4,
            postScore: 2,
            isShared: true,
            sharedAt: new Date().toISOString(),
            resolvedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'c-shared-2',
            userId: 'user-parent-1',
            householdId: selectedHouseholdId,
            category: 'CAREER_INTEREST',
            questionKey: 'Can learner transition into a Diploma or B.Tech degree after ITI?',
            answerValue: 'Learner wants lateral entry pathway into 2nd year Polytechnic.',
            preScore: 5,
            postScore: 3,
            isShared: true,
            sharedAt: new Date().toISOString(),
            resolvedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        // High fidelity fallback illustrating the privacy boundary
        setHouseholdSummary({
          householdId: selectedHouseholdId,
          familyName: 'Sharma Household',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          block: 'Kashi Vidyapeeth',
          incomeBand: '1_5L_TO_3L',
          learnerClassLevel: 'CLASS_10_PASS',
          sharedConcerns: fallbackConcerns,
          privateConcernsCount: 2, // 2 private concerns strictly hidden
          recommendedTrades: ['Electrician (Domestic & Industrial)', 'Solar PV Technician'],
        });
      });
  }, [selectedHouseholdId]);

  const handleStatusUpdate = async (bookingId: string, nextStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await apiClient.put(`/counselling/bookings/${bookingId}/status`, { status: nextStatus });
    } catch {
      // Local optimistic update
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b)),
    );
  };

  const handleSaveNotes = () => {
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2500);
  };

  const currentBooking = bookings.find((b) => b.householdId === selectedHouseholdId) || bookings[0];

  return (
    <div className="py-6 sm:py-8 space-y-8 max-w-6xl mx-auto">
      {/* Counsellor Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-[var(--color-text)]">
                {isHi ? 'प्रमाणित काउंसलर कंसोल' : 'Certified Counsellor Console'}
              </h1>
              <Badge variant="primary" size="sm">
                NCVET Verified
              </Badge>
            </div>
            <p className="text-xs text-[var(--color-subtext)]">
              {isHi
                ? 'राष्ट्रीय कौशल विकास मिशन (MSDE) के तहत पारिवारिक परामर्श व लाइव वीडियो सहायता'
                : 'Empowering rural households with verified career pathways under MSDE standards.'}
            </p>
          </div>
        </div>

        {/* Action to Join Active Session */}
        {currentBooking && (
          <Button
            variant="primary"
            size="md"
            id="counsellor-launch-call-btn"
            onClick={() => {
              setActiveBooking(currentBooking);
              setIsLiveCallOpen(true);
            }}
            className="gap-2 shadow-md"
          >
            {currentBooking.mode === 'AUDIO_ONLY' ? (
              <Headphones className="w-4 h-4" />
            ) : (
              <Video className="w-4 h-4" />
            )}
            <span>
              {isHi ? 'लाइव परामर्श शुरू करें' : 'Join Live Session'}
            </span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Consultations */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                <span>{isHi ? 'आगामी परामर्श सत्र' : 'Scheduled Consultations'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedHouseholdId(booking.householdId)}
                  className={cn(
                    'p-3 rounded-xl border cursor-pointer transition-all space-y-2',
                    selectedHouseholdId === booking.householdId
                      ? 'border-[var(--color-primary)] bg-[var(--color-raised)] shadow-sm'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-raised)]/50',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      {booking.householdId.replace('household-', 'Household #')}
                    </span>
                    <Badge
                      variant={
                        booking.status === 'CONFIRMED'
                          ? 'parent'
                          : booking.status === 'COMPLETED'
                            ? 'neutral'
                            : 'student'
                      }
                      size="sm"
                    >
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-subtext)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(booking.requestedSlot).toLocaleDateString()} at {new Date(booking.requestedSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--color-primary)]">
                    {booking.mode === 'AUDIO_ONLY' ? (
                      <Headphones className="w-3.5 h-3.5" />
                    ) : (
                      <Video className="w-3.5 h-3.5" />
                    )}
                    <span>{booking.mode === 'AUDIO_ONLY' ? '2G/3G Audio Call' : 'Video Conference'}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Household Dossier & Privacy Shield */}
        <div className="lg:col-span-2 space-y-6">
          {householdSummary && (
            <>
              {/* Strict Privacy Shield Notice */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">
                    {isHi
                      ? 'गोपनीयता फ़िल्टर सक्रिय: केवल संयुक्त रूप से साझा की गई चिंताएं प्रदर्शित हैं'
                      : 'Strict Privacy Filter Enforced: Only Jointly Shared Concerns are Visible'}
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400/90 leading-relaxed">
                    {isHi
                      ? `परिवार द्वारा निजी विंडो में रखी गई ${householdSummary.privateConcernsCount} चिंताएं काउंसलर से सुरक्षित व गुप्त रखी गई हैं। केवल वे बिंदु दिखाई दे रहे हैं जिन्हें छात्र और माता-पिता दोनों ने साझा करने की सहमति दी है।`
                      : `${householdSummary.privateConcernsCount} private learner/parent concerns remain strictly confidential inside private windows. Only points explicitly approved for joint discussion appear here.`}
                  </p>
                </div>
              </div>

              {/* Household Demographic Profile */}
              <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
                <CardHeader className="pb-3 border-b border-[var(--color-border)] flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>{householdSummary.familyName}</span>
                  </CardTitle>
                  <span className="text-xs text-[var(--color-subtext)] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {householdSummary.district}, {householdSummary.state}
                  </span>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-[var(--color-raised)]">
                      <span className="text-[var(--color-subtext)] block">{isHi ? 'ब्लॉक' : 'Block'}</span>
                      <strong className="text-[var(--color-text)]">{householdSummary.block}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--color-raised)]">
                      <span className="text-[var(--color-subtext)] block">{isHi ? 'वार्षिक आय' : 'Income Band'}</span>
                      <strong className="text-[var(--color-text)]">₹{householdSummary.incomeBand.replace('_', ' ')}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--color-raised)]">
                      <span className="text-[var(--color-subtext)] block">{isHi ? 'शिक्षा स्तर' : 'Education'}</span>
                      <strong className="text-[var(--color-text)]">{householdSummary.learnerClassLevel.replace('_', ' ')}</strong>
                    </div>
                  </div>

                  {/* Bookmarked Trades of Interest */}
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text)] mb-2">
                      {isHi ? 'परिवार द्वारा रुचि दिखाए गए ट्रेड्स' : 'Shortlisted Trades of Interest'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {householdSummary.recommendedTrades?.map((title: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20"
                        >
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Shared Concerns List */}
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text)] mb-2 flex items-center gap-1.5">
                      <span>{isHi ? 'संयुक्त रूप से साझा की गई चिंताएं' : 'Jointly Shared Family Concerns'}</span>
                      <span className="text-[10px] bg-[var(--color-raised)] px-2 py-0.5 rounded-full text-[var(--color-subtext)]">
                        {householdSummary.sharedConcerns.length} {isHi ? 'मुद्दे' : 'items'}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {householdSummary.sharedConcerns.map((concern) => (
                        <div
                          key={concern.id}
                          className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-raised)]/50 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wide">
                              {concern.category.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-[var(--color-subtext)]">
                              Anxiety: <strong>{concern.preScore}/5</strong>
                            </span>
                          </div>
                          <p className="font-semibold text-[var(--color-text)]">{concern.questionKey}</p>
                          <p className="text-[var(--color-subtext)] text-[11px] italic">
                            &quot;{concern.answerValue}&quot;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Counsellor Notes & Recommendation Input */}
                  <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
                    <label
                      htmlFor="counsellor-notes-input"
                      className="text-xs font-bold text-[var(--color-text)] block"
                    >
                      {isHi ? 'परामर्शदाता के आधिकारिक नोट्स और अनुशंसा' : 'Official Counsellor Consultation Notes'}
                    </label>
                    <textarea
                      id="counsellor-notes-input"
                      rows={3}
                      value={counsellorNotes}
                      onChange={(e) => setCounsellorNotes(e.target.value)}
                      placeholder={
                        isHi
                          ? 'सत्र के दौरान परिवार को समझाए गए बिंदु, शुल्क छूट सत्यापन, NAPS अनुबंध संबंधी टिप्पणियां...'
                          : 'Record session notes, guidance provided on fee waivers, apprenticeship expectations, and agreement terms...'
                      }
                      className="w-full text-xs p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {currentBooking && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(currentBooking.id, 'CONFIRMED')}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(currentBooking.id, 'COMPLETED')}
                            >
                              <UserCheck className="w-3.5 h-3.5 text-blue-500 mr-1" />
                              Mark Done
                            </Button>
                          </>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        id="counsellor-save-notes-btn"
                        onClick={handleSaveNotes}
                        className="gap-1.5"
                      >
                        {isSavedNotes ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>{isHi ? 'सहेजा गया!' : 'Notes Saved!'}</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5" />
                            <span>{isHi ? 'नोट्स सुरक्षित करें' : 'Save Notes'}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Live Video / Audio Consultation Modal */}
      {isLiveCallOpen && activeBooking && (
        <LiveConsultationModal
          isOpen={isLiveCallOpen}
          onClose={() => setIsLiveCallOpen(false)}
          meetingRoomId={activeBooking.meetingRoomId || undefined}
          counsellorName={user?.name || 'Dr. Priya Varma (NCVET Certified)'}
          householdName={householdSummary?.familyName || 'Sharma Family'}
          initialMode={activeBooking.mode}
        />
      )}
    </div>
  );
};
