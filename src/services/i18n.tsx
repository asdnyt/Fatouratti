import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'ar';

export interface Translations {
  // Navigation
  navClients: string;
  navInvoices: string;
  navSituation: string;
  navAndroidCode: string;

  // Header & Global
  appName: string;
  appSubtitle: string;
  mobileView: string;
  fullscreenView: string;
  downloadAndroidZip: string;

  // Clients Screen
  clientsTitle: string;
  clientsSubtitle: string;
  newClientBtn: string;
  searchClientPlaceholder: string;
  activeDebts: string;
  totalDebt: string;
  noClientsTitle: string;
  noClientsSubtitle: string;
  addFirstClient: string;
  noSearchResults: string;
  remainingBalance: string;
  settled: string;
  remainsToPay: string;
  createInvoiceForClient: string;
  editClient: string;
  deleteClient: string;
  addClientModalTitle: string;
  editClientModalTitle: string;
  clientNameLabel: string;
  clientNamePlaceholder: string;
  clientPhoneLabel: string;
  clientPhonePlaceholder: string;
  clientAddressLabel: string;
  clientAddressPlaceholder: string;
  cancelBtn: string;
  saveBtn: string;
  updateBtn: string;
  nameRequiredError: string;
  phoneRequiredError: string;

  // Invoice Screen
  invoiceTitlePrefix: string;
  selectClientPrompt: string;
  changeClient: string;
  selectClient: string;
  currentBalance: string;
  selectRecipientClient: string;
  noClientsFound: string;
  invoiceSavedSuccess: string;
  clientLabel: string;
  totalInvoiced: string;
  paidAmountLabel: string;
  downloadInvoicePdf: string;
  shareInvoiceDoc: string;
  printPreviewInvoice: string;
  viewClientSituation: string;
  createAnotherInvoice: string;
  billingDate: string;
  productLines: string;
  articleNumber: string;
  productDesignationPlaceholder: string;
  quantityLabel: string;
  unitPriceLabel: string;
  lineTotalLabel: string;
  addProductBtn: string;
  notesLabel: string;
  notesPlaceholder: string;
  grandTotal: string;
  amountPaid: string;
  remainsDue: string;
  payAllQuick: string;
  payHalfQuick: string;
  payZeroQuick: string;
  saveInvoiceBtn: string;
  selectClientRequiredError: string;
  atLeastOneProductError: string;
  totalMustBePositiveError: string;

  // Situation Screen
  situationTitle: string;
  situationSubtitle: string;
  financialOverview: string;
  totalSales: string;
  totalInvoicesCount: string;
  totalPaid: string;
  totalRemaining: string;
  toCollect: string;
  received: string;
  filterAll: string;
  filterWithDebt: string;
  filterSettled: string;
  shareGlobalWhatsApp: string;
  shareClientWhatsApp: string;
  viewHistoryHint: string;
  noClientsMatchingFilter: string;

  // History Screen
  historyTitlePrefix: string;
  invoicesIssued: string;
  newInvoiceBtn: string;
  noInvoicesForClient: string;
  settledStatus: string;
  dueStatus: string;
  articlesCount: string;
  totalLabel: string;
  paidLabel: string;
  remainingLabel: string;
  productDetails: string;
  collectPaymentBtn: string;
  pdfBtn: string;
  shareBtn: string;
  printBtn: string;
  deleteInvoiceConfirm: string;
  recordPaymentTitle: string;
  amountToPayLabel: string;
  confirmPaymentBtn: string;

  // WhatsApp
  shareSituationWhatsApp: string;
  whatsAppDialogTitle: string;
  recipientLabel: string;
  messagePreviewLabel: string;
  sendToClientBtn: string;
  sendToOtherContactBtn: string;
  copyTextBtn: string;
  copiedSuccess: string;

  // Settings
  currencyLabel: string;
  resetDemoData: string;
  confirmReset: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    // Navigation
    navClients: 'Clients',
    navInvoices: 'Factures',
    navSituation: 'Situation',
    navAndroidCode: 'Code Android',

    // Header & Global
    appName: 'Gestion Clients & Facturation',
    appSubtitle: 'Android Kotlin & PWA Hors-Ligne',
    mobileView: 'Vue Mobile',
    fullscreenView: 'Plein Écran',
    downloadAndroidZip: 'Projet Android (.ZIP)',

    // Clients Screen
    clientsTitle: 'Clients',
    clientsSubtitle: 'clients enregistrés',
    newClientBtn: 'Nouveau',
    searchClientPlaceholder: 'Rechercher par nom ou téléphone...',
    activeDebts: 'Créances en cours',
    totalDebt: 'Solde total',
    noClientsTitle: 'Aucun client enregistré',
    noClientsSubtitle: 'Commencez par ajouter votre premier client pour créer des factures.',
    addFirstClient: 'Ajouter un client',
    noSearchResults: 'Aucun résultat trouvé',
    remainingBalance: 'Solde restant',
    settled: 'Soldé',
    remainsToPay: 'Reste à payer',
    createInvoiceForClient: 'Créer une facture',
    editClient: 'Modifier',
    deleteClient: 'Supprimer',
    addClientModalTitle: 'Ajouter un client',
    editClientModalTitle: 'Modifier le client',
    clientNameLabel: 'Nom du client',
    clientNamePlaceholder: 'Ex: Mohamed Amine ou Société ABC',
    clientPhoneLabel: 'Téléphone',
    clientPhonePlaceholder: 'Ex: 06 12 34 56 78',
    clientAddressLabel: 'Adresse (facultatif)',
    clientAddressPlaceholder: 'Ex: 12 Rue de la Paix, Paris',
    cancelBtn: 'Annuler',
    saveBtn: 'Enregistrer',
    updateBtn: 'Mettre à jour',
    nameRequiredError: 'Le nom du client est obligatoire.',
    phoneRequiredError: 'Le numéro de téléphone est obligatoire.',

    // Invoice Screen
    invoiceTitlePrefix: 'Facture - ',
    selectClientPrompt: 'Choisir client',
    changeClient: 'Changer',
    selectClient: 'Sélectionner',
    currentBalance: 'Solde actuel',
    selectRecipientClient: 'Sélectionner le client destinataire :',
    noClientsFound: 'Aucun client trouvé. Créez-en un dans l’onglet Clients.',
    invoiceSavedSuccess: 'Facture enregistrée avec succès !',
    clientLabel: 'Client',
    totalInvoiced: 'Total Facturé',
    paidAmountLabel: 'Montant Payé',
    downloadInvoicePdf: 'Télécharger la Facture en PDF',
    shareInvoiceDoc: 'Partager le document (WhatsApp, Email...)',
    printPreviewInvoice: 'Aperçu d’impression / Bon de Vente',
    viewClientSituation: 'Voir la situation financière du client',
    createAnotherInvoice: 'Créer une autre facture',
    billingDate: 'Date de facturation',
    productLines: 'Lignes de produits',
    articleNumber: 'Article #',
    productDesignationPlaceholder: 'Désignation du produit ou service *',
    quantityLabel: 'Quantité',
    unitPriceLabel: 'Prix unitaire',
    lineTotalLabel: 'Total ligne',
    addProductBtn: 'Ajouter un produit',
    notesLabel: 'Remarques / Conditions (facultatif) :',
    notesPlaceholder: 'Ex: Acompte réglé en espèces, garantie 1 an...',
    grandTotal: 'Total Général',
    amountPaid: 'Montant Payé',
    remainsDue: 'Reste à Payer',
    payAllQuick: 'Tout payé',
    payHalfQuick: '50%',
    payZeroQuick: 'Non payé (0)',
    saveInvoiceBtn: 'Enregistrer la facture',
    selectClientRequiredError: 'Veuillez sélectionner un client pour cette facture.',
    atLeastOneProductError: 'Veuillez ajouter au moins un produit avec une désignation ou un prix.',
    totalMustBePositiveError: 'Le montant total de la facture doit être supérieur à zéro.',

    // Situation Screen
    situationTitle: 'Situation',
    situationSubtitle: 'Situation financière des clients',
    financialOverview: 'Vue d’ensemble financière',
    totalSales: 'Total Ventes',
    totalInvoicesCount: 'factures',
    totalPaid: 'Total Payé',
    totalRemaining: 'Total Restant',
    toCollect: 'À recouvrer',
    received: 'Encaissé',
    filterAll: 'Tous',
    filterWithDebt: 'Avec reste dû',
    filterSettled: 'Soldés',
    shareGlobalWhatsApp: 'Partager la synthèse par WhatsApp',
    shareClientWhatsApp: 'WhatsApp',
    viewHistoryHint: 'Cliquer pour voir l’historique des factures',
    noClientsMatchingFilter: 'Aucun client ne correspond aux critères sélectionnés.',

    // History Screen
    historyTitlePrefix: 'Historique - ',
    invoicesIssued: 'Facture(s) émise(s)',
    newInvoiceBtn: '+ Nouvelle facture',
    noInvoicesForClient: 'Aucune facture enregistrée pour ce client.',
    settledStatus: 'Réglée',
    dueStatus: 'Reste dû',
    articlesCount: 'article(s)',
    totalLabel: 'Total',
    paidLabel: 'Payé',
    remainingLabel: 'Reste',
    productDetails: 'Détail des produits :',
    collectPaymentBtn: 'Encaisser',
    pdfBtn: 'PDF',
    shareBtn: 'Partager',
    printBtn: 'Imprimer',
    deleteInvoiceConfirm: 'Supprimer la facture',
    recordPaymentTitle: 'Encaisser un paiement',
    amountToPayLabel: 'Montant à verser (€)',
    confirmPaymentBtn: 'Valider l’encaissement',

    // WhatsApp
    shareSituationWhatsApp: 'Partager la situation par WhatsApp',
    whatsAppDialogTitle: 'Partager la situation par WhatsApp',
    recipientLabel: 'Destinataire',
    messagePreviewLabel: 'Aperçu du message formaté :',
    sendToClientBtn: 'Envoyer au client',
    sendToOtherContactBtn: 'Autre contact',
    copyTextBtn: 'Copier le texte',
    copiedSuccess: 'Copié !',

    // Settings
    currencyLabel: 'Devise utilisée :',
    resetDemoData: 'Réinitialiser démo',
    confirmReset: 'Réinitialiser les données de démonstration ?',
  },
  ar: {
    // Navigation
    navClients: 'العملاء',
    navInvoices: 'الفواتير',
    navSituation: 'الوضعية',
    navAndroidCode: 'كود أندرويد',

    // Header & Global
    appName: 'إدارة العملاء والفوترة',
    appSubtitle: 'تطبيق أندرويد كوتلين بدون إنترنت',
    mobileView: 'عرض الهاتف',
    fullscreenView: 'شاشة كاملة',
    downloadAndroidZip: 'مشروع أندرويد (.ZIP)',

    // Clients Screen
    clientsTitle: 'العملاء',
    clientsSubtitle: 'عملاء مسجلين',
    newClientBtn: 'عميل جديد',
    searchClientPlaceholder: 'بحث بالاسم أو الهاتف...',
    activeDebts: 'ديون جارية',
    totalDebt: 'إجمالي الرصيد',
    noClientsTitle: 'لا يوجد عملاء مسجلين',
    noClientsSubtitle: 'ابدأ بإضافة عميلك الأول لإنشاء فواتير وسندات بيع.',
    addFirstClient: 'إضافة عميل',
    noSearchResults: 'لا توجد نتائج مطابقة',
    remainingBalance: 'الرصيد المتبقي',
    settled: 'خالص',
    remainsToPay: 'متبقي للدفع',
    createInvoiceForClient: 'إنشاء فاتورة',
    editClient: 'تعديل',
    deleteClient: 'حذف',
    addClientModalTitle: 'إضافة عميل جديد',
    editClientModalTitle: 'تعديل بيانات العميل',
    clientNameLabel: 'اسم العميل',
    clientNamePlaceholder: 'مثال: محمد أمين أو شركة النور',
    clientPhoneLabel: 'رقم الهاتف',
    clientPhonePlaceholder: 'مثال: 06 12 34 56 78',
    clientAddressLabel: 'العنوان (اختياري)',
    clientAddressPlaceholder: 'مثال: شارع الحرية، المدينة',
    cancelBtn: 'إلغاء',
    saveBtn: 'حفظ',
    updateBtn: 'تحديث',
    nameRequiredError: 'اسم العميل مطلوب.',
    phoneRequiredError: 'رقم الهاتف مطلوب.',

    // Invoice Screen
    invoiceTitlePrefix: 'فاتورة - ',
    selectClientPrompt: 'اختر العميل',
    changeClient: 'تغيير',
    selectClient: 'اختيار',
    currentBalance: 'الرصيد الحالي',
    selectRecipientClient: 'تحديد العميل المعني بالفاتورة :',
    noClientsFound: 'لم يتم العثور على عملاء. أضف عميلاً من قسم العملاء.',
    invoiceSavedSuccess: 'تم حفظ الفاتورة بنجاح !',
    clientLabel: 'العميل',
    totalInvoiced: 'إجمالي الفاتورة',
    paidAmountLabel: 'المبلغ المدفوع',
    downloadInvoicePdf: 'تحميل الفاتورة بصيغة PDF',
    shareInvoiceDoc: 'مشاركة الفاتورة (واتساب، إيميل...)',
    printPreviewInvoice: 'معاينة وطباعة الفاتورة',
    viewClientSituation: 'عرض الوضعية المالية للعميل',
    createAnotherInvoice: 'إنشاء فاتورة جديدة',
    billingDate: 'تاريخ الفاتورة',
    productLines: 'بنود المنتجات والخدمات',
    articleNumber: 'البند رقم ',
    productDesignationPlaceholder: 'بيان المنتج أو الخدمة *',
    quantityLabel: 'الكمية',
    unitPriceLabel: 'سعر الوحدة',
    lineTotalLabel: 'المجموع',
    addProductBtn: 'إضافة منتج',
    notesLabel: 'ملاحظات / شروط (اختياري) :',
    notesPlaceholder: 'مثال: تم دفع عربون نقداً، ضمان لمدة سنة...',
    grandTotal: 'المجموع الإجمالي',
    amountPaid: 'المبلغ المدفوع',
    remainsDue: 'المتبقي للدفع',
    payAllQuick: 'خالص كلياً',
    payHalfQuick: '50%',
    payZeroQuick: 'غير مدفوع (0)',
    saveInvoiceBtn: 'حفظ وتسجيل الفاتورة',
    selectClientRequiredError: 'يرجى اختيار عميل لهذه الفاتورة.',
    atLeastOneProductError: 'يرجى إضافة منتج واحد على الأقل مع تحديد السعر.',
    totalMustBePositiveError: 'يجب أن يكون إجمالي الفاتورة أكبر من صفر.',

    // Situation Screen
    situationTitle: 'الوضعية المالية',
    situationSubtitle: 'متابعة المبيعات والديون للعملاء',
    financialOverview: 'نظرة عامة على مالية النشاط',
    totalSales: 'إجمالي المبيعات',
    totalInvoicesCount: 'فواتير',
    totalPaid: 'إجمالي المقبوض',
    totalRemaining: 'إجمالي المتبقي',
    toCollect: 'قيد التحصيل',
    received: 'تم قبضه',
    filterAll: 'الكل',
    filterWithDebt: 'بذمتهم ديون',
    filterSettled: 'خالصين',
    shareGlobalWhatsApp: 'مشاركة الحصيلة عبر واتساب',
    shareClientWhatsApp: 'واتساب',
    viewHistoryHint: 'انقر لعرض سجل الفواتير السابق',
    noClientsMatchingFilter: 'لا يوجد عملاء يطابقون خيارات الفرز.',

    // History Screen
    historyTitlePrefix: 'سجل الفواتير - ',
    invoicesIssued: 'فواتير محررة',
    newInvoiceBtn: '+ فاتورة جديدة',
    noInvoicesForClient: 'لا توجد فواتير مسجلة لهذا العميل.',
    settledStatus: 'خالصة',
    dueStatus: 'باقي بذمته',
    articlesCount: 'منتج/خدمة',
    totalLabel: 'الإجمالي',
    paidLabel: 'المدفوع',
    remainingLabel: 'المتبقي',
    productDetails: 'تفاصيل المنتجات :',
    collectPaymentBtn: 'قبض دفعة',
    pdfBtn: 'PDF',
    shareBtn: 'مشاركة',
    printBtn: 'طباعة',
    deleteInvoiceConfirm: 'حذف الفاتورة',
    recordPaymentTitle: 'تسجيل دفعة نقدية',
    amountToPayLabel: 'المبلغ المسدد',
    confirmPaymentBtn: 'تأكيد التسديد',

    // WhatsApp
    shareSituationWhatsApp: 'مشاركة الوضعية عبر واتساب',
    whatsAppDialogTitle: 'مشاركة الوضعية المالية عبر واتساب',
    recipientLabel: 'المرسل إليه',
    messagePreviewLabel: 'معاينة نص الرسالة :',
    sendToClientBtn: 'إرسال إلى العميل',
    sendToOtherContactBtn: 'جهة اتصال أخرى',
    copyTextBtn: 'نسخ النص',
    copiedSuccess: 'تم النسخ !',

    // Settings
    currencyLabel: 'العملة المعتمدة :',
    resetDemoData: 'إعادة ضبط البيانات التجريبية',
    confirmReset: 'هل تريد حقاً استعادة البيانات الافتراضية ؟',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return saved === 'ar' || saved === 'fr' ? saved : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const isRtl = language === 'ar';

  useEffect(() => {
    // Update HTML dir and lang attributes
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        isRtl,
      }}
    >
      <div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-arabic' : ''}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
