import React, { useState } from 'react';
import {
  Printer,
  X,
  FileDown,
  Share2,
  FileText,
  Check
} from 'lucide-react';
import { Invoice } from '../types';
import { storageService } from '../services/storage';
import { PdfService } from '../services/pdfService';
import { useI18n } from '../services/i18n';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const { t, isRtl } = useI18n();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!invoice) return null;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDownloadPdf = () => {
    PdfService.downloadInvoicePdf(invoice);
    showFeedback(isRtl ? 'تم تحميل ملف PDF بنجاح !' : 'Fichier PDF téléchargé avec succès !');
  };

  const handleSharePdf = async () => {
    const res = await PdfService.shareInvoicePdf(invoice);
    if (res.shared) {
      showFeedback(isRtl ? 'تمت مشاركة الفاتورة بنجاح !' : 'Document partagé !');
    } else {
      showFeedback(isRtl ? 'تم تحميل ملف PDF.' : 'Document PDF téléchargé.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800 animate-scale-up"
      >
        {/* Header - Not printed */}
        <div className="no-print flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <span className="font-bold text-sm block leading-tight">
                {isRtl ? 'فاتورة وسند بيع' : 'Facture & Bon de Vente'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">N° {invoice.invoiceNumber}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label={t.cancelBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar for PDF Export & Sharing (Pinned right below header) */}
        <div className="no-print bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isRtl ? 'تصدير ومشاركة :' : 'Export & Partage :'}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Export PDF Button */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تحميل PDF' : 'Télécharger PDF'}</span>
            </button>

            {/* Share PDF Button */}
            <button
              onClick={handleSharePdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition"
              title={isRtl ? 'مشاركة عبر واتساب، البريد...' : 'Partager via WhatsApp, Email, etc.'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareBtn}</span>
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printBtn}</span>
            </button>
          </div>
        </div>

        {/* Feedback message banner if an action was triggered */}
        {feedback && (
          <div className="no-print bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Printable Document Preview Content */}
        <div
          id="printable-invoice"
          className="p-6 overflow-y-auto bg-white text-slate-900 space-y-5 text-sm"
        >
          {/* Header Document */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-extrabold text-blue-700 tracking-tight">
                  {isRtl ? 'سند بيع وفاتورة' : 'BON DE VENTE / FACTURE'}
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  N° {invoice.invoiceNumber}
                </p>
              </div>
              <div className={isRtl ? 'text-left' : 'text-right'}>
                <span className="text-xs text-slate-500 block">
                  {isRtl ? 'تاريخ التحرير' : "Date d'émission"}
                </span>
                <span className="text-sm font-semibold">{invoice.date}</span>
              </div>
            </div>
          </div>

          {/* Client Box */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              {t.clientLabel}
            </span>
            <div className="font-bold text-base text-slate-900">{invoice.clientName}</div>
            <div className="text-xs text-slate-600 mt-0.5">
              {isRtl ? `هاتف : ${invoice.clientPhone}` : `Tél : ${invoice.clientPhone}`}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs border-collapse`}>
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-700 font-bold bg-slate-50">
                  <th className="py-2 px-2">{isRtl ? 'بيان المادة' : 'Désignation'}</th>
                  <th className="py-2 px-2 text-center">{isRtl ? 'الكمية' : 'Qté'}</th>
                  <th className={`py-2 px-2 ${isRtl ? 'text-left' : 'text-right'}`}>
                    {isRtl ? 'س.و' : 'P.U.'}
                  </th>
                  <th className={`py-2 px-2 ${isRtl ? 'text-left' : 'text-right'}`}>
                    {isRtl ? 'المجموع' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2 px-2 font-medium text-slate-800">{item.designation}</td>
                    <td className="py-2 px-2 text-center text-slate-600">{item.quantity}</td>
                    <td className={`py-2 px-2 ${isRtl ? 'text-left' : 'text-right'} text-slate-600 font-mono`}>
                      {storageService.formatMoney(item.unitPrice)}
                    </td>
                    <td className={`py-2 px-2 ${isRtl ? 'text-left' : 'text-right'} font-bold text-slate-900 font-mono`}>
                      {storageService.formatMoney(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className={`border-t-2 border-slate-200 pt-3 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
            <div className="w-56 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-700">{t.grandTotal} :</span>
                <span className="font-bold text-slate-900 font-mono">
                  {storageService.formatMoney(invoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-emerald-700">
                <span className="font-semibold">{t.amountPaid} :</span>
                <span className="font-bold font-mono">
                  {storageService.formatMoney(invoice.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 bg-slate-100 px-2 rounded-lg font-bold">
                <span className={invoice.remainingAmount > 0 ? 'text-red-700' : 'text-emerald-700'}>
                  {t.remainsDue} :
                </span>
                <span
                  className={`font-mono ${
                    invoice.remainingAmount > 0 ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {storageService.formatMoney(invoice.remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="font-semibold block text-slate-700 mb-0.5">{t.notesLabel}</span>
              {invoice.notes}
            </div>
          )}

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
            {isRtl
              ? 'شكراً لتعاملكم معنا. وثيقة منشأة بواسطة تطبيق إدارة العملاء والفواتير.'
              : 'Merci de votre confiance. Document généré automatiquement par Gestion Clients & Facturation.'}
          </div>
        </div>

        {/* Modal bottom actions (no-print) */}
        <div className="no-print p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition"
          >
            {t.cancelBtn}
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تصدير PDF' : 'Exporter en PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
