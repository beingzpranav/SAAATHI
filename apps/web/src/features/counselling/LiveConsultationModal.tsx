import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Wifi,
  WifiOff,
  Headphones,
  Copy,
  Check,
  Shield,
  Activity,
  Users,
  Volume2,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { cn } from '../../lib/cn.js';

interface LiveConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingRoomId?: string;
  counsellorName?: string;
  householdName?: string;
  initialMode?: 'VIDEO' | 'AUDIO_ONLY';
}

export const LiveConsultationModal: React.FC<LiveConsultationModalProps> = ({
  isOpen,
  onClose,
  meetingRoomId = 'saathi-room-varanasi-402',
  counsellorName = 'Dr. Priya Varma (NCVET Certified)',
  householdName = 'Sharma Family',
  initialMode = 'VIDEO',
}) => {
  const { i18n } = useTranslation();
  const isHi = Boolean(i18n?.language?.startsWith('hi'));

  const [mode, setMode] = useState<'VIDEO' | 'AUDIO_ONLY'>(initialMode);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(initialMode === 'AUDIO_ONLY');
  const [networkQuality, setNetworkQuality] = useState<'EXCELLENT' | 'FAIR' | 'LOW'>('EXCELLENT');
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize consultation & media stream simulation
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsConnected(false);
      setCallDuration(0);
      return;
    }

    // Try acquiring real camera/mic if permitted, else gracefully mock
    let active = true;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && mode === 'VIDEO') {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setIsConnected(true);
        })
        .catch(() => {
          // Graceful simulated feed
          setIsConnected(true);
        });
    } else {
      setIsConnected(true);
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, mode]);

  // Call timer
  useEffect(() => {
    if (!isOpen || !isConnected) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isConnected]);

  // Format call duration
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const handleToggleAudioFallback = () => {
    if (mode === 'VIDEO') {
      setMode('AUDIO_ONLY');
      setIsVideoOff(true);
      setNetworkQuality('LOW');
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
      }
    } else {
      setMode('VIDEO');
      setIsVideoOff(false);
      setNetworkQuality('EXCELLENT');
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/counsellor?room=${meetingRoomId}`,
    ).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleEndCall}
      title={isHi ? 'लाइव परामर्श सत्र' : 'Live Vocational Consultation'}
      description={
        isHi
          ? 'सत्यापित काउंसलर के साथ रीयल-टाइम आमने-सामने मार्गदर्शन (कम बैंडविड्थ ऑडियो फ़ॉलबैक समर्थित)'
          : 'Direct WebRTC consultation with government-certified vocational mentor with 2G/3G audio fallback.'
      }
      size="xl"
    >
      <div className="space-y-4">
        {/* Top Status HUD */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[var(--color-raised)] border border-[var(--color-border)] text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold font-mono text-[var(--color-primary)]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {formatDuration(callDuration)}
            </span>
            <span className="text-[var(--color-subtext)] hidden sm:inline">|</span>
            <span className="text-[var(--color-text)] font-semibold">{counsellorName}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Network Indicator Badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border',
                mode === 'AUDIO_ONLY' || networkQuality === 'LOW'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400',
              )}
            >
              {mode === 'AUDIO_ONLY' ? (
                <>
                  <Headphones className="w-3 h-3" />
                  <span>{isHi ? 'ऑडियो फ़ॉलबैक (16 kbps)' : 'Audio Fallback (16 kbps)'}</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>{isHi ? '4G/ब्रॉडबैंड (HD वीडियो)' : '4G HD Video'}</span>
                </>
              )}
            </span>

            {/* Room Copy Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              id="live-call-copy-link-btn"
              className="inline-flex items-center gap-1 text-[11px] text-[var(--color-subtext)] hover:text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 rounded-lg"
              title="Copy session link"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span className="font-mono">{meetingRoomId.slice(0, 14)}...</span>
            </button>
          </div>
        </div>

        {/* Video / Audio Consultation Stage */}
        <div className="relative bg-zinc-950 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-zinc-800 shadow-2xl">
          {mode === 'VIDEO' && !isVideoOff ? (
            <>
              {/* Remote Counsellor Video (Simulated / WebRTC) */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80"
                  alt="Counsellor Dr. Priya Varma"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-semibold flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{counsellorName}</span>
                </div>
              </div>

              {/* Local User PiP Video Thumbnail */}
              <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-zinc-900 z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-2 text-[10px] text-white/90 font-medium">
                  {householdName}
                </div>
              </div>
            </>
          ) : (
            /* Audio-Only Fallback Interface (Low Bandwidth) */
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="relative">
                {/* Concentric Audio Wave Pulses */}
                <div className="absolute -inset-4 rounded-full bg-[var(--color-primary)]/20 animate-ping opacity-50" />
                <div className="absolute -inset-8 rounded-full bg-[var(--color-primary)]/10 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-[var(--color-raised)] border-2 border-[var(--color-primary)] flex items-center justify-center shadow-2xl">
                  <Headphones className="w-10 h-10 text-[var(--color-primary)]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">{counsellorName}</h4>
                <p className="text-xs text-zinc-400 max-w-sm">
                  {isHi
                    ? 'कम नेटवर्क बैंडविड्थ के कारण ऑडियो फ़ॉलबैक सक्रिय है। आवाज बिना रुकावट स्पष्ट सुनाई देगी।'
                    : 'Low-bandwidth audio mode active. Optimised for rural 2G/3G connectivity with zero buffering.'}
                </p>
              </div>

              {/* Live Audio Level Equalizer Simulation */}
              <div className="flex items-center gap-1.5 h-6">
                {[6, 14, 22, 10, 18, 24, 12, 20, 8, 16].map((height, i) => (
                  <span
                    key={i}
                    className="w-1 bg-[var(--color-primary)] rounded-full animate-bounce"
                    style={{
                      height: `${height}px`,
                      animationDelay: `${i * 120}ms`,
                      animationDuration: '800ms',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Media Call Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Mute Mic */}
          <button
            type="button"
            id="live-call-toggle-mic-btn"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={cn(
              'p-3.5 rounded-full text-white transition-all shadow-md',
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-800 hover:bg-zinc-700',
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video */}
          <button
            type="button"
            id="live-call-toggle-video-btn"
            onClick={handleToggleVideo}
            aria-label={isVideoOff ? 'Turn video on' : 'Turn video off'}
            className={cn(
              'p-3.5 rounded-full text-white transition-all shadow-md',
              isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-800 hover:bg-zinc-700',
            )}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Low Bandwidth Audio Fallback Switch */}
          <Button
            variant="outline"
            size="sm"
            id="live-call-toggle-fallback-btn"
            onClick={handleToggleAudioFallback}
            className={cn(
              'rounded-full gap-2 text-xs font-bold border-2',
              mode === 'AUDIO_ONLY'
                ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-[var(--color-border)]',
            )}
          >
            <Headphones className="w-4 h-4" />
            <span>{mode === 'AUDIO_ONLY' ? (isHi ? 'वीडियो चालू करें' : 'Switch to Video') : (isHi ? '2G/3G ऑडियो मोड' : 'Low-Bandwidth Audio Mode')}</span>
          </Button>

          {/* End Consultation */}
          <button
            type="button"
            id="live-call-hangup-btn"
            onClick={handleEndCall}
            aria-label="End consultation call"
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg active:scale-95"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
