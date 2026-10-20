import React, { useState, useRef, useEffect } from 'react';
import { Lock, Shield, AlertTriangle, CheckCircle2, Delete } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { useRoomStore } from '../../stores/room.store.js';
import { useTranslation } from 'react-i18next';
import { TranslatedText } from '../../components/common/TranslatedText.js';

interface PinLockModalProps {
  isOpen: boolean;
  onUnlocked: () => void;
  onCancel: () => void;
  accentColor?: 'student' | 'parent';
  title?: string;
}

const DIAL_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
const PIN_LENGTH = 4;

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  onUnlocked,
  onCancel,
  accentColor = 'student',
  title = 'Enter your Private PIN',
}) => {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');
  const [setupError, setSetupError] = useState('');

  const { status, isVerifying, verifyError, fetchStatus, setPin: savePin, verifyPin, isUnlocked } = useRoomStore();

  const isMounted = useRef(false);
  useEffect(() => {
    if (isOpen && !isMounted.current) {
      isMounted.current = true;
      fetchStatus();
    }
    if (!isOpen) {
      isMounted.current = false;
      setPin('');
      setShakeError(false);
    }
  }, [isOpen, fetchStatus]);

  useEffect(() => {
    if (isUnlocked) onUnlocked();
  }, [isUnlocked, onUnlocked]);

  useEffect(() => {
    if (verifyError) {
      setShakeError(true);
      setPin('');
      const t = setTimeout(() => setShakeError(false), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [verifyError]);

  // Show PIN setup if no PIN is set yet
  useEffect(() => {
    if (status && !status.hasPinSet) {
      setSetupMode(true);
    }
  }, [status]);

  if (!isOpen) return null;

  const accent =
    accentColor === 'student'
      ? { main: 'var(--color-student)', light: 'var(--color-student-light)' }
      : { main: 'var(--color-parent)', light: 'var(--color-parent-light)' };

  const isLocked = status?.isLocked ?? false;

  // --- PIN dial handler ---
  const handleKey = async (key: string) => {
    if (isLocked || isVerifying) return;

    if (setupMode) {
      const current = setupStep === 'enter' ? setupPin : confirmPin;
      if (key === 'del') {
        if (setupStep === 'enter') setSetupPin((p) => p.slice(0, -1));
        else setConfirmPin((p) => p.slice(0, -1));
        return;
      }
      if (!key || current.length >= PIN_LENGTH) return;
      const next = current + key;
      if (setupStep === 'enter') {
        setSetupPin(next);
        if (next.length === PIN_LENGTH) setSetupStep('confirm');
      } else {
        setConfirmPin(next);
        if (next.length === PIN_LENGTH) {
          if (next === setupPin) {
            try {
              await savePin(setupPin);
              setSetupMode(false);
              setSetupPin('');
              setConfirmPin('');
              setSetupStep('enter');
            } catch {
              setSetupError('Failed to save PIN. Please try again.');
            }
          } else {
            setSetupError('PINs do not match. Please try again.');
            setSetupPin('');
            setConfirmPin('');
            setSetupStep('enter');
          }
        }
      }
      return;
    }

    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!key || pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      await verifyPin(next);
    }
  };

  const dots = Array.from({ length: PIN_LENGTH }, (_, i) => {
    const current = setupMode
      ? setupStep === 'enter'
        ? setupPin
        : confirmPin
      : pin;
    return i < current.length;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          'relative w-full max-w-sm rounded-2xl border shadow-2xl',
          'bg-[var(--color-surface)] border-[var(--color-border)]',
          shakeError && 'animate-shake',
        )}
        style={{ '--accent': accent.main, '--accent-light': accent.light } as React.CSSProperties}
      >
        {/* Header */}
        <div
          className="flex flex-col items-center gap-2 px-6 pt-8 pb-4"
          style={{ background: `linear-gradient(135deg, ${accent.light}, transparent)` }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: accent.light }}
          >
            {isLocked ? (
              <AlertTriangle className="w-7 h-7" style={{ color: 'var(--color-error)' }} />
            ) : (
              <Lock className="w-7 h-7" style={{ color: accent.main }} />
            )}
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)] text-center font-[var(--font-heading)]">
            {setupMode
              ? setupStep === 'enter'
                ? <TranslatedText text={t('privateWindow.createPin')} context="app_ui" />
                : <TranslatedText text={t('privateWindow.confirmPin')} context="app_ui" />
              : title}
          </h2>
          <p className="text-sm text-[var(--color-subtext)] text-center">
            {setupMode
              ? setupStep === 'enter'
                ? <TranslatedText text={t('privateWindow.choosePin')} context="app_ui" />
                : <TranslatedText text={t('privateWindow.reenterPin')} context="app_ui" />
              : isLocked
                ? <TranslatedText text={t('privateWindow.temporarilyLocked')} context="app_ui" />
                : <TranslatedText text={t('privateWindow.privateThoughts')} context="app_ui" />}
          </p>
        </div>

        {/* Locked state */}
        {isLocked && !setupMode && (
          <div className="px-6 pb-6 flex flex-col items-center gap-4">
            <div
              className="w-full rounded-xl p-4 text-center text-sm"
              style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
            >
              <Shield className="w-5 h-5 mx-auto mb-2" />
              <TranslatedText text={t('privateWindow.lockedUntil')} context="app_ui" />{' '}
              {status?.lockedUntil
                ? new Date(status.lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '—'}
              <br />
              <span className="text-xs opacity-80">
                <TranslatedText text={t('privateWindow.waitBeforeRetry')} context="app_ui" />
              </span>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 rounded-xl text-sm font-medium border border-[var(--color-border)] text-[var(--color-subtext)] hover:bg-[var(--color-muted)] transition-colors"
            >
              Go back
            </button>
          </div>
        )}

        {/* PIN dots */}
        {!isLocked && (
          <div className="px-6 pb-6 flex flex-col items-center gap-6">
            {/* Dots */}
            <div className="flex gap-4">
              {dots.map((filled, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-4 h-4 rounded-full border-2 transition-all duration-150',
                    filled
                      ? 'scale-110'
                      : 'bg-transparent',
                  )}
                  style={{
                    borderColor: accent.main,
                    backgroundColor: filled ? accent.main : 'transparent',
                  }}
                />
              ))}
            </div>

            {/* Error */}
            {(verifyError || setupError) && (
              <p className="text-xs text-center px-2" style={{ color: 'var(--color-error)' }}>
                {verifyError || setupError}
              </p>
            )}

            {/* Verified success indicator */}
            {isUnlocked && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-success)' }}>
                <CheckCircle2 className="w-4 h-4" />
                <TranslatedText text={t('privateWindow.unlocked')} context="app_ui" />
              </div>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {DIAL_KEYS.map((key, idx) => {
                if (key === '') return <div key={idx} />;
                const isDel = key === 'del';
                return (
                  <button
                    key={idx}
                    type="button"
                    id={`pin-key-${key}`}
                    onClick={() => handleKey(key)}
                    disabled={isVerifying}
                    className={cn(
                      'aspect-square rounded-xl text-xl font-semibold transition-all duration-100',
                      'flex items-center justify-center',
                      'border border-[var(--color-border)]',
                      'bg-[var(--color-raised)] text-[var(--color-text)]',
                      'hover:scale-95 active:scale-90',
                      isDel && 'text-base',
                      isVerifying && 'opacity-50 cursor-not-allowed',
                    )}
                    aria-label={
                      isDel
                        ? t('privateWindow.deleteDigit')
                        : `${t('privateWindow.digit')} ${key}`
                    }
                  >
                    {isDel ? <Delete className="w-5 h-5" /> : key}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-[var(--color-subtext)] hover:text-[var(--color-text)] transition-colors mt-1"
            >
              <TranslatedText text={t('privateWindow.cancel')} context="app_ui" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
