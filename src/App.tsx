/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType, Client } from './types';
import { storageService } from './services/storage';
import { I18nProvider, useI18n } from './services/i18n';
import { LanguageSelector } from './components/LanguageSelector';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { BottomNavBar } from './components/BottomNavBar';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { ClientsScreen } from './screens/ClientsScreen';
import { InvoiceScreen } from './screens/InvoiceScreen';
import { SituationScreen } from './screens/SituationScreen';
import { ClientHistoryScreen } from './screens/ClientHistoryScreen';
import { AndroidCodeScreen } from './screens/AndroidCodeScreen';
import { Smartphone, Monitor, Download } from 'lucide-react';
import { generateAndroidZip } from './services/androidProjectGenerator';

function AppContent() {
  const { t, isRtl } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('clients');
  const [selectedClientForInvoice, setSelectedClientForInvoice] = useState<Client | null>(() => {
    const clients = storageService.getClients();
    return clients.length > 0 ? clients[0] : null;
  });
  const [viewingClientHistoryId, setViewingClientHistoryId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Desktop preview mode: phone frame vs full screen
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(true);

  // Écran 1 : Lorsqu'on clique sur un client, ouvrir automatiquement son écran de facturation !
  const handleClientSelectedForInvoice = (client: Client) => {
    setSelectedClientForInvoice(client);
    setViewingClientHistoryId(null);
    setActiveTab('invoices');
  };

  // Écran 3 : Lorsqu'on sélectionne un client dans la Situation pour voir son historique
  const handleSelectClientForHistory = (clientId: string) => {
    setViewingClientHistoryId(clientId);
  };

  const handleTabChange = (tab: TabType) => {
    setViewingClientHistoryId(null);
    setActiveTab(tab);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDownloadZipDirect = async () => {
    const blob = await generateAndroidZip();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Gestion_Clients_Facturation_Android_Kotlin.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const unpaidCount = storageService
    .getAllFinancialSummaries()
    .filter((s) => s.totalRemaining > 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans antialiased">
      {/* Top Bar for Desktop Preview with Language Switcher, Phone frame toggle & direct Android zip download */}
      <div className="no-print w-full bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between text-xs shrink-0 z-40 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-bold text-white text-[13px] tracking-tight truncate">
            {t.appName}
          </span>
          <span className="hidden lg:inline text-slate-400 text-[11px] font-mono">
            ({t.appSubtitle})
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Bouton de langue Français / Arabe */}
          <LanguageSelector />

          {/* Toggle Phone Frame / Fullscreen on larger screens */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setIsPhoneFrameMode(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                isPhoneFrameMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.mobileView}</span>
            </button>
            <button
              onClick={() => setIsPhoneFrameMode(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                !isPhoneFrameMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{t.fullscreenView}</span>
            </button>
          </div>

          <button
            onClick={handleDownloadZipDirect}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Android</span>
            <span>(.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Main Application Container */}
      <main
        className={`w-full flex-1 flex flex-col items-center justify-center transition-all duration-300 ${
          isPhoneFrameMode
            ? 'p-0 sm:py-6 sm:px-4'
            : 'p-0'
        }`}
      >
        <div
          className={`w-full flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden relative shadow-2xl transition-all duration-300 ${
            isPhoneFrameMode
              ? 'max-w-[430px] h-[100dvh] sm:h-[844px] sm:max-h-[92vh] sm:rounded-[42px] sm:border-[8px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/60'
              : 'max-w-4xl h-[100dvh] sm:h-[90vh] sm:rounded-2xl sm:border border-slate-800'
          }`}
        >
          {/* Android Punch Hole Camera on Mockup (only in phone frame mode on desktop) */}
          {isPhoneFrameMode && (
            <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rounded-full z-40 border border-slate-800" />
          )}

          {/* Android Status Bar */}
          <AndroidStatusBar />

          {/* PWA Install Notification if available */}
          <PWAInstallBanner />

          {/* Active Screen View */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {viewingClientHistoryId ? (
              <ClientHistoryScreen
                clientId={viewingClientHistoryId}
                onBack={() => setViewingClientHistoryId(null)}
                onInvoiceCreatedAgain={(client) => handleClientSelectedForInvoice(client)}
              />
            ) : activeTab === 'clients' ? (
              <ClientsScreen
                onSelectClientForInvoice={handleClientSelectedForInvoice}
                onRefreshTrigger={refreshTrigger}
              />
            ) : activeTab === 'invoices' ? (
              <InvoiceScreen
                selectedClient={selectedClientForInvoice}
                onClientChange={(client) => setSelectedClientForInvoice(client)}
                onNavigateToSituation={(clientId) => {
                  if (clientId) {
                    setViewingClientHistoryId(clientId);
                  }
                  setActiveTab('situation');
                }}
              />
            ) : activeTab === 'situation' ? (
              <SituationScreen
                onSelectClientForHistory={handleSelectClientForHistory}
                onRefreshTrigger={refreshTrigger}
              />
            ) : (
              <AndroidCodeScreen />
            )}
          </div>

          {/* Android Navigation Bar in bottom */}
          <BottomNavBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            unpaidCount={unpaidCount}
          />

          {/* Android Home Gesture Indicator Bar (Bottom) */}
          <div className="w-full bg-white dark:bg-slate-900 flex justify-center py-1 shrink-0">
            <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
