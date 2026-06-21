'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaProvider() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;

    setIsStandalone(standalone);
    setIsIos(ios);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((error) => console.warn('Service worker registration failed:', error));
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      if (!standalone) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (ios && !standalone) {
      const dismissed = sessionStorage.getItem('luxestay-pwa-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setShowBanner(false);
      setIsStandalone(true);
    }

    setInstallPrompt(null);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('luxestay-pwa-dismissed', '1');
  };

  if (isStandalone || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-lg rounded-xl border border-amber-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur sm:left-auto sm:right-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white font-bold">
          L
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">Install LuxeStay</p>
          <p className="text-sm text-slate-300 mt-1">
            {isIos
              ? 'Tap Share, then "Add to Home Screen" to install LuxeStay on your iPhone.'
              : 'Add to your home screen or desktop for quick access like a native app.'}
          </p>
          <div className="mt-3 flex gap-2">
            {!isIos && installPrompt && (
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600"
                onClick={handleInstall}
              >
                <Download className="h-4 w-4 mr-1" />
                Install App
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={dismissBanner}
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss install banner"
          className="text-slate-400 hover:text-white"
          onClick={dismissBanner}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
