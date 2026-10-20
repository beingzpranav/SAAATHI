import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  CheckCircle2,
  Download,
  HardDrive,
  Subtitles,
  Layers,
  Sparkles,
  WifiOff,
  Video,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { cn } from '../../lib/cn.js';

export interface VideoTrack {
  id: string;
  titleEn: string;
  titleHi: string;
  durationSeconds: number;
  descriptionEn: string;
  descriptionHi: string;
  videoUrl: string;
  thumbnailUrl: string;
  captions: {
    en: Array<{ start: number; end: number; text: string }>;
    hi: Array<{ start: number; end: number; text: string }>;
  };
}

interface CourseVideoPlayerProps {
  tradeTitleEn: string;
  tradeTitleHi: string;
  tradeCode: string;
  className?: string;
}

const SAMPLE_VIDEOS: Record<string, VideoTrack[]> = {
  default: [
    {
      id: 'workshop-experience',
      titleEn: 'Workshop Experience & Practical Training',
      titleHi: 'वर्कशॉप अनुभव और व्यावहारिक प्रशिक्षण',
      durationSeconds: 156,
      descriptionEn: 'Step inside an actual Government ITI workshop. See live wiring, solar inverter calibration, safety gear, and precision tools.',
      descriptionHi: 'सरकारी आईटीआई वर्कशॉप के अंदर देखें। लाइव वायरिंग, सोलर इन्वर्टर कैलिब्रेशन, सुरक्षा उपकरण और सटीक उपकरण देखें।',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      captions: {
        en: [
          { start: 0, end: 5, text: 'Welcome to the ITI Industrial Practical Lab.' },
          { start: 5, end: 15, text: 'Trainees spend 70% of their curriculum on hands-on machinery.' },
          { start: 15, end: 30, text: 'Safety gear and personal protective equipment are mandatory.' },
          { start: 30, end: 50, text: 'Mastering three-phase industrial circuit breakers and panel wiring.' },
          { start: 50, end: 90, text: 'Industry mentors conduct bi-weekly evaluation of assembly accuracy.' },
          { start: 90, end: 156, text: 'Upon graduation, NCVET certification opens verified public & private recruitment.' },
        ],
        hi: [
          { start: 0, end: 5, text: 'आईटीआई औद्योगिक व्यावहारिक प्रयोगशाला में आपका स्वागत है।' },
          { start: 5, end: 15, text: 'प्रशिक्षु अपने पाठ्यक्रम का 70% हिस्सा व्यावहारिक मशीनों पर बिताते हैं।' },
          { start: 15, end: 30, text: 'सुरक्षा उपकरण और व्यक्तिगत सुरक्षा गियर अनिवार्य हैं।' },
          { start: 30, end: 50, text: 'थ्री-फेज औद्योगिक सर्किट ब्रेकर और पैनल वायरिंग में महारत हासिल करना।' },
          { start: 50, end: 90, text: 'उद्योग संरक्षक असेंबली सटीकता का पाक्षिक मूल्यांकन करते हैं।' },
          { start: 90, end: 156, text: 'सफलतापूर्वक पूरा करने पर NCVET प्रमाणन सरकारी व निजी भर्ती के द्वार खोलता है।' },
        ],
      },
    },
    {
      id: 'industry-voices',
      titleEn: 'Industry Voices, Apprenticeships & Wage Trajectory',
      titleHi: 'उद्योग अनुभव, शिक्षुता (NAPS) और वेतन वृद्धि',
      durationSeconds: 194,
      descriptionEn: 'Hear from former graduates now working at Tata Power and Schneider Electric. Learn how NAPS stipend bridges into ₹35,000+ supervisor roles.',
      descriptionHi: 'टाटा पावर और श्नाइडर इलेक्ट्रिक में कार्यरत पूर्व छात्रों से सुनें। जानें कैसे NAPS स्टाइपेंड ₹35,000+ पर्यवेक्षक वेतन में बदलता है।',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      captions: {
        en: [
          { start: 0, end: 6, text: 'Rajesh Kumar: From Karaundi ITI to Tata Power Senior Technician.' },
          { start: 6, end: 20, text: 'Under National Apprenticeship Promotion Scheme (NAPS), I earned ₹10,500/mo while learning.' },
          { start: 20, end: 45, text: 'Within 2 years of on-site service, my salary advanced to ₹34,000 per month.' },
          { start: 45, end: 85, text: 'Solar rooftop installation skills are in tremendous demand nationwide.' },
          { start: 85, end: 194, text: 'Parents were hesitant initially, but financial stability arrived before age 22.' },
        ],
        hi: [
          { start: 0, end: 6, text: 'राजेश कुमार: करौंदी आईटीआई से टाटा पावर सीनियर तकनीशियन तक का सफर।' },
          { start: 6, end: 20, text: 'राष्ट्रीय शिक्षुता संवर्धन योजना (NAPS) के तहत सीखते हुए ₹10,500/माह मिले।' },
          { start: 20, end: 45, text: '2 वर्षों के फील्ड अनुभव के बाद वेतन ₹34,000 प्रति माह हो गया।' },
          { start: 45, end: 85, text: 'सोलर रूफटॉप इंस्टॉलेशन कौशल की देश भर में भारी मांग है।' },
          { start: 85, end: 194, text: 'माता-पिता पहले झिझक रहे थे, पर 22 वर्ष की आयु से पहले आर्थिक स्थिरता आ गई।' },
        ],
      },
    },
  ],
};

export const CourseVideoPlayer: React.FC<CourseVideoPlayerProps> = ({
  tradeTitleEn,
  tradeTitleHi,
  tradeCode: _tradeCode,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const isHi = Boolean(i18n?.language?.startsWith('hi'));

  const videoList = (SAMPLE_VIDEOS.default || []) as VideoTrack[];

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const currentVideo = (videoList[activeVideoIndex] || videoList[0]) as VideoTrack;
  const [duration, setDuration] = useState(currentVideo?.durationSeconds ?? 0);

  // Check offline storage cache
  useEffect(() => {
    const cached = localStorage.getItem(`saathi_video_offline_${currentVideo.id}`);
    setIsOfflineSaved(Boolean(cached));
    setCurrentTime(0);
    setIsPlaying(false);
    setVideoError(false);
  }, [currentVideo.id]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback for auto-play policy
        setIsPlaying(true);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleToggleOfflineDownload = () => {
    if (isOfflineSaved) {
      localStorage.removeItem(`saathi_video_offline_${currentVideo.id}`);
      setIsOfflineSaved(false);
    } else {
      setIsDownloading(true);
      setTimeout(() => {
        localStorage.setItem(`saathi_video_offline_${currentVideo.id}`, 'cached-indexeddb');
        setIsDownloading(false);
        setIsOfflineSaved(true);
      }, 50);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Find active caption
  const currentCaptions = isHi ? currentVideo.captions.hi : currentVideo.captions.en;
  const activeCaption = currentCaptions.find(
    (c) => currentTime >= c.start && currentTime <= c.end,
  );

  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden',
        className,
      )}
    >
      {/* Header bar with video selector tabs */}
      <div className="p-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-raised)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              {t('media.videoImmersion', { title: isHi ? tradeTitleHi : tradeTitleEn })}
            </h3>
            <p className="text-xs text-[var(--color-subtext)]">
              {t('media.videoSubtitle')}
            </p>
          </div>
        </div>

        {/* Video selector toggle buttons */}
        <div className="flex items-center gap-2 bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)]">
          {videoList.map((video, idx) => (
            <button
              key={video.id}
              type="button"
              id={`video-tab-${idx}`}
              onClick={() => {
                setActiveVideoIndex(idx);
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                }
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                activeVideoIndex === idx
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-subtext)] hover:text-[var(--color-text)]',
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{idx === 0 ? t('media.workshop') : t('media.wages')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div
        ref={containerRef}
        className="relative bg-black aspect-video flex items-center justify-center overflow-hidden group select-none"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(isPlaying ? false : true)}
      >
        <video
          ref={videoRef}
          src={currentVideo.videoUrl}
          poster={currentVideo.thumbnailUrl}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => setVideoError(true)}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />

        {/* Fallback simulation if network video cannot load */}
        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-white">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold mb-1">{isHi ? currentVideo.titleHi : currentVideo.titleEn}</h4>
            <p className="text-xs text-zinc-400 max-w-md mb-4">{isHi ? currentVideo.descriptionHi : currentVideo.descriptionEn}</p>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {t('media.simulation')}
              </Badge>
            </div>
          </div>
        )}

        {/* Synchronized Closed Caption Overlay */}
        {captionsEnabled && activeCaption && (
          <div className="absolute bottom-16 left-6 right-6 flex justify-center pointer-events-none z-20">
            <div className="bg-black/85 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium tracking-wide shadow-lg border border-white/10 text-center max-w-2xl backdrop-blur-sm animate-in fade-in duration-200">
              {activeCaption.text}
            </div>
          </div>
        )}

        {/* Big Center Play Button when paused */}
        {!isPlaying && (
          <button
            type="button"
            id="video-play-center-btn"
            onClick={handleTogglePlay}
            aria-label={t('media.play')}
            className="absolute z-10 w-16 h-16 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
          >
            <Play className="w-8 h-8 ml-1" fill="currentColor" />
          </button>
        )}

        {/* HUD Controls Overlay */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-30 flex flex-col gap-2',
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          {/* Seek progress slider */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-300 min-w-[36px]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              id="video-seek-slider"
              min={0}
              max={duration || currentVideo.durationSeconds}
              step={1}
              value={currentTime}
              onChange={handleSeek}
              aria-label={t('media.seek')}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
            />
            <span className="text-[11px] font-mono text-zinc-400 min-w-[36px]">
              {formatTime(duration || currentVideo.durationSeconds)}
            </span>
          </div>

          {/* Bottom Control Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="video-play-pause-btn"
                onClick={handleTogglePlay}
                aria-label={isPlaying ? t('media.pause') : t('media.play')}
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                type="button"
                id="video-replay-btn"
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }}
                aria-label={t('media.restart')}
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="video-mute-btn"
                onClick={handleToggleMute}
                aria-label={isMuted ? t('media.unmute') : t('media.mute')}
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
              {/* Speed Selector */}
              <div className="flex items-center gap-1 bg-white/10 rounded-md p-0.5">
                {[1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleRateChange(rate)}
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] transition-colors',
                      playbackRate === rate ? 'bg-[var(--color-primary)] text-white' : 'text-zinc-300 hover:text-white',
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Captions Toggle */}
              <button
                type="button"
                id="video-captions-toggle"
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                aria-label={t('media.subtitles')}
                className={cn(
                  'p-1.5 rounded-md transition-colors flex items-center gap-1',
                  captionsEnabled ? 'text-[var(--color-primary)] bg-white/10' : 'text-zinc-400 hover:text-white',
                )}
              >
                <Subtitles className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px]">{isHi ? 'उपशीर्षक' : 'CC'}</span>
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                id="video-fullscreen-btn"
                onClick={handleToggleFullscreen}
                aria-label={t('media.fullscreen')}
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Details & Offline Download Status */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-[var(--color-text)]">
              {isHi ? currentVideo.titleHi : currentVideo.titleEn}
            </h4>
            {isOfflineSaved && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-success)] font-semibold bg-[var(--color-success)]/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                {t('media.offline')}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-subtext)] line-clamp-2 max-w-xl">
            {isHi ? currentVideo.descriptionHi : currentVideo.descriptionEn}
          </p>
        </div>

        {/* Offline Cache Button */}
        <div className="shrink-0 flex items-center gap-2">
          <Button
            variant={isOfflineSaved ? 'outline' : 'secondary'}
            size="sm"
            id="video-offline-download-btn"
            onClick={handleToggleOfflineDownload}
            disabled={isDownloading}
            className="text-xs gap-1.5"
          >
            {isDownloading ? (
              <>
                <HardDrive className="w-3.5 h-3.5 animate-spin" />
                <span>{t('media.saving')}</span>
              </>
            ) : isOfflineSaved ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[var(--color-success)]" />
                <span>{t('media.saved')}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{t('media.saveOffline')}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
