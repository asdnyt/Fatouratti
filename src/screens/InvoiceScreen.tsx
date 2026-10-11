import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  ChevronDown,
  UserCheck,
  Calendar,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight,
  FileDown,
  Share2
} from 'lucide-react';
import { Client, Invoice, InvoiceItem } from '../types';
import { storageService } from '../services/storage';
import { PdfService } from '../services/pdfService';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { useI18n } from '../services/i18n';
import { LanguageSelector } from '../components/LanguageSelector';

interface InvoiceScreenProps {
  selectedClient: Client | null;
  onClientChange: (client: Client) => void;
  onNavigateToSituation: (clientId?: string) => void;
}

interface ProductLineState {
  id: string;
  designation: string;
  quantity: string;
  unitPrice: string;
}

export const InvoiceScreen: React.FC<InvoiceScreenProps> = ({
  selectedClient,
  onClientChange,
  onNavigateToSituation,
}) => {
  const { t, isRtl } = useI18n();
  const [clients, setClients] = useState<Client[]>(() => storageService.getClients());
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Lignes de produits (minimum 1 ligne)
  const [lines, setLines] = useState<ProductLineState[]>([
    { id: '1', designation: '', quantity: '1', unitPrice: '' },
  ]);

  // Montant payé saisi par l'utilisateur
  const [paidInput, setPaidInput] = useState<string>('0');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal d'impression après enregistrement
  const [lastSavedInvoice, setLastSavedInvoice] = useState<Invoice | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setClients(storageService.getClients());
  }, []);

  // Calcul automatique du total de chaque ligne : Quantité × Prix unitaire
  const calculateLineTotal = (line: ProductLineState): number => {
    const qte = parseFloat(line.quantity) || 0;
    const pu = parseFloat(line.unitPrice) || 0;
    return Math.round(qte * pu * 100) / 100;
  };

  // Calcul automatique du Total Général (somme des totaux des lignes)
  const totalGeneral = lines.reduce((acc, line) => acc + calculateLineTotal(line), 0);

  // Montant payé
  const montantPaye = parseFloat(paidInput) || 0;

  // Calcul automatique du Reste à Payer : Total Général - Montant payé
  const resteAPayer = Math.max(0, Math.round((totalGeneral - montantPaye) * 100) / 100);

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        designation: '',
        quantity: '1',
        unitPrice: '',
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 1) {
      // Just clear the line
      setLines([{ id: '1', designation: '', quantity: '1', unitPrice: '' }]);
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLineChange = (id: string, field: keyof ProductLineState, value: string) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  // Raccourcis pour le montant payé
  const setPaidQuick = (type: 'all' | 'half' | 'zero') => {
    if (type === 'all') setPaidInput(totalGeneral.toString());
    if (type === 'half') setPaidInput((Math.round((totalGeneral / 2) * 100) / 100).toString());
    if (type === 'zero') setPaidInput('0');
  };

  const handleSaveInvoice = () => {
    setErrorMsg(null);

    if (!selectedClient) {
      setErrorMsg(t.selectClientRequiredError);
      setIsClientPickerOpen(true);
      return;
    }

    // Validation des lignes
    const validItems = lines.filter(
      (l) => l.designation.trim() !== '' || (parseFloat(l.unitPrice) || 0) > 0
    );

    if (validItems.length === 0) {
      setErrorMsg(t.atLeastOneProductError);
      return;
    }

    if (totalGeneral <= 0) {
      setErrorMsg(t.totalMustBePositiveError);
      return;
    }

    try {
      const itemsToSave = validItems.map((line) => ({
        designation: line.designation.trim() || (isRtl ? 'بند بدون اسم' : 'Article sans nom'),
        quantity: parseFloat(line.quantity) || 1,
        unitPrice: parseFloat(line.unitPrice) || 0,
      }));

      const newInvoice = storageService.addInvoice({
        clientId: selectedClient.id,
        items: itemsToSave,
        paidAmount: montantPaye,
        notes: notes.trim(),
        date: invoiceDate,
      });

      setLastSavedInvoice(newInvoice);
      setSaveSuccess(true);

      // Reset form
      setLines([{ id: '1', designation: '', quantity: '1', unitPrice: '' }]);
      setPaidInput('0');
      setNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de l\'enregistrement de la facture');
    }
  };

  const startNewInvoice = () => {
    setSaveSuccess(false);
    setLastSavedInvoice(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
      {/* Top App Bar : "Facture - [Nom du client]" */}
      <header className="bg-indigo-600 text-white px-4 py-3 shadow-md shrink-0 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200 block truncate">
                {isRtl ? 'سند بيع وفاتورة' : 'Bon de Vente'}
              </span>
              <h1 className="text-base font-bold leading-tight truncate">
                {selectedClient ? `${t.invoiceTitlePrefix}${selectedClient.name}` : `${t.invoiceTitlePrefix}[${t.selectClientPrompt}]`}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Selector compact in header */}
            <LanguageSelector className="bg-indigo-700/80 border-indigo-500/50" />

            {/* Client picker trigger button */}
            <button
              onClick={() => setIsClientPickerOpen(!isClientPickerOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-medium rounded-lg shrink-0 border border-indigo-500/50 transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="max-w-[70px] xs:max-w-[100px] truncate">
                {selectedClient ? t.changeClient : t.selectClient}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Client details badge if selected */}
        {selectedClient && (
          <div className="mt-2 pt-2 border-t border-indigo-500/40 flex items-center justify-between text-[11px] text-indigo-100">
            <span>{isRtl ? `هاتف: ${selectedClient.phone}` : `Tél: ${selectedClient.phone}`}</span>
            <span className="font-semibold">
              {t.currentBalance} : {storageService.formatMoney(selectedClient.remainingBalance)}
            </span>
          </div>
        )}
      </header>

      {/* Client Picker Dropdown / Drawer */}
      {isClientPickerOpen && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 shadow-lg z-20 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.selectRecipientClient}
            </span>
            <button
              onClick={() => setIsClientPickerOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              {t.cancelBtn}
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {clients.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                {t.noClientsFound}
              </p>
            ) : (
              clients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onClientChange(c);
                    setIsClientPickerOpen(false);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition ${
                    selectedClient?.id === c.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 font-bold text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{c.phone}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        {saveSuccess && lastSavedInvoice ? (
          /* SUCCESS SCREEN STATE */
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-emerald-200 dark:border-emerald-800/60 shadow-lg space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {t.invoiceSavedSuccess}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-1">
                N° {lastSavedInvoice.invoiceNumber}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-xs space-y-1.5 text-left border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex justify-between">
                <span className="text-slate-500">{t.clientLabel} :</span>
                <span className="font-bold">{lastSavedInvoice.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t.totalInvoiced} :</span>
                <span className="font-bold font-mono">
                  {storageService.formatMoney(lastSavedInvoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>{t.paidAmountLabel} :</span>
                <span className="font-bold font-mono">
                  {storageService.formatMoney(lastSavedInvoice.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between text-red-600 dark:text-red-400 font-bold border-t border-slate-200 dark:border-slate-700 pt-1">
                <span>{t.remainsDue} :</span>
                <span className="font-mono">
                  {storageService.formatMoney(lastSavedInvoice.remainingAmount)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  if (lastSavedInvoice) {
                    PdfService.downloadInvoicePdf(lastSavedInvoice);
                  }
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <FileDown className="w-4 h-4" />
                <span>{t.downloadInvoicePdf}</span>
              </button>

              <button
                onClick={async () => {
                  if (lastSavedInvoice) {
                    await PdfService.shareInvoicePdf(lastSavedInvoice);
                  }
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareInvoiceDoc}</span>
              </button>

              <button
                onClick={() => setShowPrintModal(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printPreviewInvoice}</span>
              </button>

              <button
                onClick={() => onNavigateToSituation(lastSavedInvoice.clientId)}
                className="w-full py-2 bg-purple-600/90 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span>{t.viewClientSituation}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={startNewInvoice}
                className="w-full py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition"
              >
                {t.createAnotherInvoice}
              </button>
            </div>
          </div>
        ) : (
          /* INVOICE EDITING FORM */
          <>
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Date field */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold">{t.billingDate} :</span>
              </div>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>

            {/* LIGNES DE PRODUITS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t.productLines} ({lines.length})
                </h2>
                <span className="text-[11px] text-slate-400">
                  {isRtl ? 'المجموع = الكمية × السعر' : 'Total = Quantité × Prix'}
                </span>
              </div>

              {lines.map((line, index) => {
                const lineTotal = calculateLineTotal(line);
                return (
                  <div
                    key={line.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2.5 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {t.articleNumber}{index + 1}
                      </span>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Désignation du produit */}
                    <div>
                      <input
                        type="text"
                        value={line.designation}
                        onChange={(e) =>
                          handleLineChange(line.id, 'designation', e.target.value)
                        }
                        placeholder={t.productDesignationPlaceholder}
                        className={`w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}
                      />
                    </div>

                    {/* Quantité & Prix unitaire & Total */}
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <label className="block text-[10px] text-slate-400 font-medium mb-0.5">
                          {t.quantityLabel}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={line.quantity}
                          onChange={(e) =>
                            handleLineChange(line.id, 'quantity', e.target.value)
                          }
                          placeholder="1"
                          className="w-full px-2.5 py-1.5 text-xs text-center font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="block text-[10px] text-slate-400 font-medium mb-0.5">
                          {t.unitPriceLabel}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) =>
                            handleLineChange(line.id, 'unitPrice', e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 text-xs text-right font-bold font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="col-span-4 text-right">
                        <label className="block text-[10px] text-slate-400 font-medium mb-0.5">
                          {t.lineTotalLabel}
                        </label>
                        <div className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 font-mono py-1.5 truncate">
                          {storageService.formatMoney(lineTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bouton "Ajouter un produit" */}
              <button
                type="button"
                onClick={handleAddLine}
                className="w-full py-2.5 border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addProductBtn}</span>
              </button>
            </div>

            {/* Notes facultatives */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/90 dark:border-slate-800 text-xs">
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t.notesLabel}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={t.notesPlaceholder}
                className={`w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
              />
            </div>
          </>
        )}
      </div>

      {/* SECTION RÉSUMÉ FINANCIER & PAIEMENT */}
      {!saveSuccess && (
        <div className="bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 p-4 shadow-xl shrink-0 z-10 space-y-3">
          {/* Grille des Totaux avec COULEURS DISTINCTES */}
          <div className="grid grid-cols-3 gap-2">
            {/* TOTAL GÉNÉRAL - Couleur Ardoise / Dark Navy */}
            <div className="bg-slate-900 text-white p-2.5 rounded-xl flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider truncate">
                {t.grandTotal}
              </span>
              <span className="text-sm font-extrabold font-mono truncate mt-0.5">
                {storageService.formatMoney(totalGeneral)}
              </span>
            </div>

            {/* MONTANT PAYÉ - Couleur Vert Émeraude */}
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider truncate">
                {t.amountPaid}
              </span>
              <div className="relative mt-0.5">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={totalGeneral}
                  value={paidInput}
                  onChange={(e) => setPaidInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 font-mono focus:outline-hidden text-center"
                />
              </div>
            </div>

            {/* RESTE À PAYER - Couleur Rouge Corail / Alerte */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                resteAPayer > 0
                  ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider truncate">
                {t.remainsDue}
              </span>
              <span className="text-sm font-extrabold font-mono truncate mt-0.5">
                {storageService.formatMoney(resteAPayer)}
              </span>
            </div>
          </div>

          {/* Raccourcis de paiement rapides */}
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{isRtl ? 'تسديد سريع :' : 'Raccourcis paiement :'}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaidQuick('all')}
                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold rounded text-[10px] transition"
              >
                {t.payAllQuick}
              </button>
              <button
                type="button"
                onClick={() => setPaidQuick('half')}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[10px] transition"
              >
                {t.payHalfQuick}
              </button>
              <button
                type="button"
                onClick={() => setPaidQuick('zero')}
                className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded text-[10px] transition"
              >
                {t.payZeroQuick}
              </button>
            </div>
          </div>

          {/* Bouton "Enregistrer la facture" clairement visible */}
          <button
            type="button"
            onClick={handleSaveInvoice}
            disabled={!selectedClient || totalGeneral <= 0}
            className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] ${
              !selectedClient || totalGeneral <= 0
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{t.saveInvoiceBtn}</span>
          </button>
        </div>
      )}

      {/* Impression Modal */}
      {showPrintModal && lastSavedInvoice && (
        <InvoicePrintModal
          invoice={lastSavedInvoice}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
