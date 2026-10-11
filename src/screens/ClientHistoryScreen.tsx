import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Receipt,
  Printer,
  ChevronDown,
  ChevronUp,
  DollarSign,
  CheckCircle,
  Clock,
  Phone,
  Trash2,
  FileText,
  FileDown,
  Share2,
  MessageCircle
} from 'lucide-react';
import { Client, Invoice } from '../types';
import { storageService } from '../services/storage';
import { PdfService } from '../services/pdfService';
import { WhatsAppService } from '../services/whatsappService';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { WhatsAppShareModal } from '../components/WhatsAppShareModal';
import { useI18n } from '../services/i18n';
import { LanguageSelector } from '../components/LanguageSelector';

interface ClientHistoryScreenProps {
  clientId: string;
  onBack: () => void;
  onInvoiceCreatedAgain?: (client: Client) => void;
}

export const ClientHistoryScreen: React.FC<ClientHistoryScreenProps> = ({
  clientId,
  onBack,
  onInvoiceCreatedAgain,
}) => {
  const { t, language, isRtl } = useI18n();
  const [client, setClient] = useState<Client | undefined>(() =>
    storageService.getClient(clientId)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    storageService.getInvoicesByClient(clientId)
  );

  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Modal de versement / encaissement
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');

  // Modal de partage WhatsApp
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const refreshData = () => {
    setClient(storageService.getClient(clientId));
    setInvoices(storageService.getInvoicesByClient(clientId));
  };

  if (!client) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>{isRtl ? 'العميل غير موجود.' : 'Client introuvable.'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs rounded-xl"
        >
          {isRtl ? 'العودة إلى الوضعية' : 'Retour à la Situation'}
        </button>
      </div>
    );
  }

  const totalVentes = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaye = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalRestant = invoices.reduce((acc, inv) => acc + inv.remainingAmount, 0);

  const handleOpenPayment = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setPaymentModalInvoice(inv);
    setPaymentAmountInput(inv.remainingAmount.toString());
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    const amount = parseFloat(paymentAmountInput) || 0;
    if (amount <= 0) return;

    storageService.recordPayment(paymentModalInvoice.id, amount);
    setPaymentModalInvoice(null);
    refreshData();
  };

  const handleDeleteInvoice = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`${t.deleteInvoiceConfirm} ${inv.invoiceNumber} ?`)) {
      storageService.deleteInvoice(inv.id);
      refreshData();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
      {/* Header bar */}
      <header className="bg-purple-700 text-white px-4 py-3 shadow-md shrink-0 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl hover:bg-purple-800 text-purple-100 hover:text-white transition shrink-0"
              aria-label={isRtl ? 'رجوع' : 'Retour'}
            >
              <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate">
                {t.historyTitlePrefix}{client.name}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-purple-200">
                <Phone className="w-3 h-3" />
                <span>{client.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageSelector className="bg-purple-800/80 border-purple-500/50" />
          </div>
        </div>
      </header>

      {/* Synthèse du client */}
      <div className="bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200/80 dark:border-purple-900/60 p-4 shrink-0">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 block truncate">{t.totalSales}</span>
            <span className="font-extrabold text-slate-900 dark:text-white font-mono text-xs truncate block mt-0.5">
              {storageService.formatMoney(totalVentes)}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-emerald-600 block truncate">{t.totalPaid}</span>
            <span className="font-extrabold text-emerald-600 font-mono text-xs truncate block mt-0.5">
              {storageService.formatMoney(totalPaye)}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-red-600 block truncate">{t.totalRemaining}</span>
            <span
              className={`font-extrabold font-mono text-xs truncate block mt-0.5 ${
                totalRestant > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {storageService.formatMoney(totalRestant)}
            </span>
          </div>
        </div>

        {/* WhatsApp Share Button for Client Situation */}
        <button
          onClick={() => setIsWhatsAppModalOpen(true)}
          className="mt-3 w-full py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] active:scale-98 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition text-xs"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>{t.shareSituationWhatsApp}</span>
        </button>
      </div>

      {/* List of Previous Invoices */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        <div className="flex items-center justify-between text-xs px-1 text-slate-500">
          <span className="font-semibold uppercase tracking-wider">
            {invoices.length} {t.invoicesIssued}
          </span>
          {onInvoiceCreatedAgain && (
            <button
              onClick={() => onInvoiceCreatedAgain(client)}
              className="text-purple-600 font-bold hover:underline"
            >
              {t.newInvoiceBtn}
            </button>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            {t.noInvoicesForClient}
          </div>
        ) : (
          invoices.map((inv) => {
            const isExpanded = expandedInvoiceId === inv.id;
            const hasRemaining = inv.remainingAmount > 0;

            return (
              <div
                key={inv.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition"
              >
                {/* Header card */}
                <div
                  onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                  className="p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        hasRemaining
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                          {inv.invoiceNumber}
                        </span>
                        {hasRemaining ? (
                          <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 px-1.5 py-0.2 rounded font-semibold">
                            {t.dueStatus}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                            {t.settledStatus}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{inv.date}</span>
                        <span>•</span>
                        <span>{inv.items.length} {t.articlesCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                        {storageService.formatMoney(inv.totalAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {t.paidLabel} : {storageService.formatMoney(inv.paidAmount)}
                      </div>
                      {hasRemaining && (
                        <div className="text-[10px] font-bold text-red-600 font-mono">
                          {t.remainingLabel} : {storageService.formatMoney(inv.remainingAmount)}
                        </div>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-3">
                    {/* Item lines */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                        {t.productDetails}
                      </span>
                      {inv.items.map((item, i) => (
                        <div
                          key={item.id || i}
                          className="flex justify-between items-center text-[11px] py-1 border-b border-slate-100 dark:border-slate-700/60 last:border-0"
                        >
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {item.designation}{' '}
                            <span className="text-slate-400">
                              (x{item.quantity} @ {storageService.formatMoney(item.unitPrice)})
                            </span>
                          </span>
                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                            {storageService.formatMoney(item.total)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {inv.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50 dark:bg-slate-800/80 p-2 rounded-lg border border-amber-200/40">
                        {t.notesLabel} {inv.notes}
                      </p>
                    )}

                    {/* Quick action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {hasRemaining && (
                          <button
                            onClick={(e) => handleOpenPayment(inv, e)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition shadow-xs"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            {t.collectPaymentBtn}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            PdfService.downloadInvoicePdf(inv);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold transition shadow-xs"
                          title={t.downloadInvoicePdf}
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>{t.pdfBtn}</span>
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await PdfService.shareInvoicePdf(inv);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-semibold transition"
                          title={t.shareInvoiceDoc}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{t.shareBtn}</span>
                        </button>
                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
                          title={t.printBtn}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={(e) => handleDeleteInvoice(inv, e)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                        title={t.deleteClient}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal d'encaissement de versement */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t.recordPaymentTitle}
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {paymentModalInvoice.invoiceNumber} • {t.remainingLabel} :{' '}
                <strong className="text-red-600">
                  {storageService.formatMoney(paymentModalInvoice.remainingAmount)}
                </strong>
              </p>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t.amountToPayLabel}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max={paymentModalInvoice.remainingAmount}
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
                >
                  {t.confirmPaymentBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* WhatsApp Situation Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        title={isRtl ? `وضعية ${client.name}` : `Situation de ${client.name}`}
        recipientName={client.name}
        recipientPhone={client.phone}
        messageText={WhatsAppService.buildClientSituationMessage(client, invoices, language)}
      />
    </div>
  );
};
