import React, { useState } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  FolderArchive,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { ANDROID_FILES, generateAndroidZip } from '../services/androidProjectGenerator';
import { storageService } from '../services/storage';
import { useI18n } from '../services/i18n';
import { LanguageSelector } from '../components/LanguageSelector';

export const AndroidCodeScreen: React.FC = () => {
  const { t, isRtl } = useI18n();
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currencyInput, setCurrencyInput] = useState(() => storageService.getCurrency());
  const [currencySaved, setCurrencySaved] = useState(false);

  const selectedFile = ANDROID_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateAndroidZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Gestion_Clients_Facturation_Android_Kotlin.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erreur téléchargement zip:', e);
      alert('Erreur lors de la génération du fichier ZIP.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveCurrency = (symbol: string) => {
    storageService.setCurrency(symbol);
    setCurrencyInput(symbol);
    setCurrencySaved(true);
    setTimeout(() => setCurrencySaved(false), 2000);
  };

  const handleResetData = () => {
    if (confirm(t.confirmReset)) {
      storageService.resetSampleData();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* Top Header */}
      <header className="bg-slate-950 px-4 py-3 border-b border-slate-800 shrink-0 z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight truncate">
              {isRtl ? 'مشروع أندرويد ناتيف' : 'Projet Android Natif'}
            </h1>
            <p className="text-[10px] text-slate-400 truncate">Kotlin + Jetpack Compose + Room SQLite</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageSelector className="bg-slate-800 border-slate-700" />

          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? (isRtl ? 'جاري التحميل...' : 'Génération...') : (isRtl ? 'تحميل (.ZIP)' : 'Télécharger (.ZIP)')}</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 pb-20">
        {/* Banner with download card */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <FolderArchive className="w-4 h-4" />
              {isRtl ? 'مشروع جاهز للفتح في Android Studio' : "Projet Android Studio Prêt à l'emploi"}
            </div>
            <p className="text-xs text-slate-300 max-w-md">
              {isRtl
                ? 'يحتوي على الكود البرمجي الكامل بلغة كوتلين : Room Database SQLite، Jetpack Compose، Material 3، وإعدادات Gradle.'
                : "Contient l'intégralité du code source natif : Room Database SQLite, Jetpack Compose, Material 3, et les fichiers de configuration Gradle."}
            </p>
          </div>
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isRtl ? 'تحميل المشروع كاملاً (.ZIP)' : 'Télécharger le Projet Complet'}</span>
          </button>
        </div>

        {/* Currency & Settings Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">{t.currencyLabel}</span>
            <div className="flex items-center gap-1">
              {['€', 'DH', 'FCFA', 'DZD', '$'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleSaveCurrency(sym)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                    currencyInput === sym
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
            {currencySaved && <span className="text-emerald-400 text-[10px]">{isRtl ? 'تم الحفظ !' : 'Enregistré !'}</span>}
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.resetDemoData}</span>
          </button>
        </div>

        {/* File Explorer & Code Viewer */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* File selector pill list */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
            {ANDROID_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedFileIndex === idx
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          {/* Selected File Header with Copy button */}
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <span className="font-mono text-[11px] text-emerald-400 block truncate">
                {selectedFile.path}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {selectedFile.description}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.copiedSuccess}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyTextBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="p-4 bg-slate-950 overflow-x-auto max-h-[460px] text-xs font-mono leading-relaxed text-slate-300">
            <pre className="whitespace-pre">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
