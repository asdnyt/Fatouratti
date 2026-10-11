import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || dismissed) return null;

  if (isInstallable) {
    return (
      <div className="bg-blue-900 text-white px-3 py-2 flex items-center justify-between text-xs z-30 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone className="w-4 h-4 text-blue-300 shrink-0" />
          <span className="truncate">Installer sur votre écran d'accueil Android</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={install}
            className="px-2.5 py-1 bg-white text-blue-900 font-bold rounded-lg text-[11px] shadow-sm hover:bg-blue-50 active:scale-95 transition"
          >
            Installer
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-blue-300 hover:text-white"
            aria-label="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs z-30 shrink-0">
          <span className="text-[11px] text-slate-300">Ajouter à l'écran d'accueil</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="text-[11px] text-blue-400 font-semibold underline"
            >
              Comment installer ?
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl max-w-sm text-xs space-y-3">
              <h3 className="font-bold text-sm">Installer sur iPhone / iPad</h3>
              <p className="text-slate-600 dark:text-slate-400">
                1. Appuyez sur le bouton <strong>Partager</strong> en bas de Safari.<br />
                2. Faites défiler et touchez <strong>Sur l'écran d'accueil</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
