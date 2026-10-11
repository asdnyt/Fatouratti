import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  DollarSign,
  AlertCircle,
  Search,
  ChevronRight,
  Filter,
  Users,
  CheckCircle2,
  ArrowUpRight,
  MessageCircle,
  X
} from 'lucide-react';
import { ClientFinancialSummary } from '../types';
import { storageService } from '../services/storage';
import { WhatsAppService } from '../services/whatsappService';
import { WhatsAppShareModal } from '../components/WhatsAppShareModal';
import { useI18n } from '../services/i18n';
import { LanguageSelector } from '../components/LanguageSelector';

interface SituationScreenProps {
  onSelectClientForHistory: (clientId: string) => void;
  onRefreshTrigger?: number;
}

export const SituationScreen: React.FC<SituationScreenProps> = ({
  onSelectClientForHistory,
}) => {
  const { t, language, isRtl } = useI18n();
  const [filterType, setFilterType] = useState<'all' | 'debt' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const summaries: ClientFinancialSummary[] = storageService.getAllFinancialSummaries();
  const globalStats = storageService.getGlobalStats();

  const filteredSummaries = summaries.filter((item) => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterType === 'debt') return item.totalRemaining > 0;
    if (filterType === 'settled') return item.totalRemaining === 0 && item.invoiceCount > 0;
    return true;
  });

  const [whatsAppData, setWhatsAppData] = useState<{
    isOpen: boolean;
    title: string;
    recipientName?: string;
    recipientPhone?: string;
    messageText: string;
  }>({
    isOpen: false,
    title: '',
    messageText: '',
  });

  const handleShareClientWhatsApp = (item: ClientFinancialSummary) => {
    const client = storageService.getClient(item.clientId);
    if (!client) return;
    const clientInvoices = storageService.getInvoicesByClient(item.clientId);
    const msg = WhatsAppService.buildClientSituationMessage(client, clientInvoices, language);
    setWhatsAppData({
      isOpen: true,
      title: isRtl ? `وضعية ${client.name}` : `Situation de ${client.name}`,
      recipientName: client.name,
      recipientPhone: client.phone,
      messageText: msg,
    });
  };

  const handleShareGlobalWhatsApp = () => {
    const msg = WhatsAppService.buildGlobalSituationMessage(language);
    setWhatsAppData({
      isOpen: true,
      title: isRtl ? 'التقرير المالي الإجمالي' : 'Synthèse Financière Globale',
      messageText: msg,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
      {/* Top Bar : "Situation" - Couleur Pourpre / Violet avec sélecteur de langue */}
      <header className="bg-purple-700 text-white px-4 py-3 shadow-md shrink-0 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight tracking-tight truncate">
                {t.situationTitle}
              </h1>
              <p className="text-[11px] text-purple-200 font-medium truncate">
                {t.situationSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Bouton de langue Français / Arabe dans la barre d'en-tête */}
            <LanguageSelector className="bg-purple-800/80 border-purple-500/50" />
          </div>
        </div>
      </header>

      {/* SYNTHÈSE GLOBALE EN HAUT */}
      <div className="bg-gradient-to-b from-purple-800 to-purple-900 text-white p-4 shadow-md shrink-0">
        <span className="text-[11px] uppercase tracking-wider text-purple-200 font-bold block mb-2">
          {t.financialOverview}
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* TOTAL DES VENTES - Fond sombre */}
          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-700/80">
            <span className="text-[10px] text-slate-300 block font-medium truncate">
              {t.totalSales}
            </span>
            <span className="text-xs sm:text-sm font-extrabold font-mono text-white block mt-0.5 truncate">
              {storageService.formatMoney(globalStats.totalSales)}
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 block truncate">
              {globalStats.totalInvoices} {t.totalInvoicesCount}
            </span>
          </div>

          {/* TOTAL PAYÉ - Vert Émeraude */}
          <div className="bg-emerald-950/80 rounded-xl p-2.5 border border-emerald-700/60">
            <span className="text-[10px] text-emerald-300 block font-medium truncate">
              {t.totalPaid}
            </span>
            <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-300 block mt-0.5 truncate">
              {storageService.formatMoney(globalStats.totalPaid)}
            </span>
            <span className="text-[9px] text-emerald-400 mt-0.5 block truncate">
              {t.received}
            </span>
          </div>

          {/* TOTAL RESTANT - Rouge Alerte */}
          <div className="bg-red-950/80 rounded-xl p-2.5 border border-red-700/60">
            <span className="text-[10px] text-red-300 block font-medium truncate">
              {t.totalRemaining}
            </span>
            <span className="text-xs sm:text-sm font-extrabold font-mono text-red-300 block mt-0.5 truncate">
              {storageService.formatMoney(globalStats.totalRemaining)}
            </span>
            <span className="text-[9px] text-red-400 mt-0.5 block truncate">
              {t.toCollect}
            </span>
          </div>
        </div>

        {/* WhatsApp Share Button for Global Synthesis */}
        <button
          onClick={handleShareGlobalWhatsApp}
          className="mt-3 w-full py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] active:scale-98 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition text-xs"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>{t.shareGlobalWhatsApp}</span>
        </button>
      </div>

      {/* Barre de Recherche et Filtres interactifs */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
        <div className="relative">
          <Search className={`w-3.5 h-3.5 absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 text-slate-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'فلترة أو بحث عن عميل...' : 'Filtrer un client...'}
            className={`w-full bg-slate-50 dark:bg-slate-800 text-xs rounded-xl ${
              isRtl ? 'pr-8 pl-8 text-right' : 'pl-8 pr-8'
            } py-1.5 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute ${isRtl ? 'left-2.5' : 'right-2.5'} top-2 text-slate-400 hover:text-slate-600`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtres par boutons de segments */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-0.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-medium text-[11px] whitespace-nowrap transition ${
              filterType === 'all'
                ? 'bg-purple-700 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.filterAll} ({summaries.length})
          </button>
          <button
            onClick={() => setFilterType('debt')}
            className={`px-3 py-1 rounded-lg font-medium text-[11px] whitespace-nowrap transition ${
              filterType === 'debt'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.filterWithDebt} ({summaries.filter((s) => s.totalRemaining > 0).length})
          </button>
          <button
            onClick={() => setFilterType('settled')}
            className={`px-3 py-1 rounded-lg font-medium text-[11px] whitespace-nowrap transition ${
              filterType === 'settled'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.filterSettled} ({summaries.filter((s) => s.totalRemaining === 0 && s.invoiceCount > 0).length})
          </button>
        </div>
      </div>

      {/* LISTE DES CLIENTS AVEC LEUR SITUATION */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
          <span>{isRtl ? 'العميل والفواتير' : 'Client & Factures'}</span>
          <span>{isRtl ? 'البيانات المالية' : 'Détail financier'}</span>
        </div>

        {filteredSummaries.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            {t.noClientsMatchingFilter}
          </div>
        ) : (
          filteredSummaries.map((item) => {
            const hasDebt = item.totalRemaining > 0;
            return (
              <div
                key={item.clientId}
                onClick={() => onSelectClientForHistory(item.clientId)}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition cursor-pointer active:scale-[0.99] relative overflow-hidden"
              >
                {/* Accent line on border */}
                <div
                  className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-0 bottom-0 w-1.5 ${
                    hasDebt ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />

                {/* Top header row */}
                <div className={`flex items-start justify-between gap-2 ${isRtl ? 'pr-1' : 'pl-1'}`}>
                  <div>
                    <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      {item.clientName}
                    </h2>
                    <span className="text-xs text-slate-500 block mt-0.5">{item.clientPhone}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg text-xs font-semibold">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>
                      {item.invoiceCount} {t.totalInvoicesCount}
                    </span>
                  </div>
                </div>

                {/* 3 Metrics: Total des Ventes | Total Payé | Total Restant */}
                <div className={`grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center ${isRtl ? 'pr-1' : 'pl-1'}`}>
                  {/* Total des ventes */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 block truncate">{t.totalSales}</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono block mt-0.5 truncate">
                      {storageService.formatMoney(item.totalSales)}
                    </span>
                  </div>

                  {/* Total Payé */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium truncate">
                      {t.totalPaid}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 font-mono block mt-0.5 truncate">
                      {storageService.formatMoney(item.totalPaid)}
                    </span>
                  </div>

                  {/* Total Restant */}
                  <div
                    className={`p-2 rounded-xl border ${
                      hasDebt
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40'
                    }`}
                  >
                    <span
                      className={`text-[10px] block font-medium truncate ${
                        hasDebt ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {t.totalRemaining}
                    </span>
                    <span
                      className={`text-xs font-extrabold font-mono block mt-0.5 truncate ${
                        hasDebt ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {storageService.formatMoney(item.totalRemaining)}
                    </span>
                  </div>
                </div>

                {/* Footer call to action & WhatsApp quick share */}
                <div className={`mt-2.5 pt-2 flex items-center justify-between text-[11px] ${isRtl ? 'pr-1' : 'pl-1'}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareClientWhatsApp(item);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 active:scale-95 text-emerald-800 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 dark:text-emerald-300 font-bold rounded-lg transition"
                    title={t.shareClientWhatsApp}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.shareClientWhatsApp}</span>
                  </button>

                  <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>{isRtl ? 'عرض السجل' : 'Historique'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={whatsAppData.isOpen}
        onClose={() => setWhatsAppData((prev) => ({ ...prev, isOpen: false }))}
        title={whatsAppData.title}
        recipientName={whatsAppData.recipientName}
        recipientPhone={whatsAppData.recipientPhone}
        messageText={whatsAppData.messageText}
      />
    </div>
  );
};
