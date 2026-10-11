import { Client, Invoice } from '../types';
import { storageService } from './storage';

export class WhatsAppService {
  /**
   * Nettoie et formate un numéro de téléphone pour WhatsApp
   */
  public static cleanPhoneNumber(phone: string, defaultCountryPrefix: string = '33'): string {
    let cleaned = phone.replace(/[\s\.\-\(\)]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned.substring(1);
    }
    if (cleaned.startsWith('00')) {
      return cleaned.substring(2);
    }
    // Si le numéro commence par 0 (ex: 0612345678)
    if (cleaned.startsWith('0')) {
      const withoutZero = cleaned.substring(1);
      const prefixClean = defaultCountryPrefix.replace('+', '');
      return `${prefixClean}${withoutZero}`;
    }
    return cleaned;
  }

  /**
   * Construit le message texte formaté pour la situation d'un client (Français ou Arabe)
   */
  public static buildClientSituationMessage(
    client: Client,
    invoices: Invoice[],
    lang: 'fr' | 'ar' = 'fr'
  ): string {
    const currency = storageService.getCurrency();
    const totalSales = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalPaid = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const totalRemaining = Math.max(0, totalSales - totalPaid);

    if (lang === 'ar') {
      let message = `السلام عليكم ورحمة الله، *${client.name}*،\n\n`;
      message += `إليكم ملخص *الوضعية المالية* الخاصة بكم :\n\n`;
      message += `📄 *إجمالي الفواتير* : ${invoices.length}\n`;
      message += `💰 *إجمالي المبيعات* : ${storageService.formatMoney(totalSales)}\n`;
      message += `✅ *إجمالي المسدد* : ${storageService.formatMoney(totalPaid)}\n`;

      if (totalRemaining > 0) {
        message += `⚠️ *المبلغ المتبقي بذمتكم* : *${storageService.formatMoney(totalRemaining)}*\n`;
      } else {
        message += `🎉 *الحالة* : *خالص بالكامل (0,00 ${currency})*\n`;
      }

      if (invoices.length > 0) {
        message += `\n📋 *تفاصيل الفواتير* :\n`;
        invoices.slice(0, 5).forEach((inv) => {
          const status =
            inv.remainingAmount > 0
              ? `متبقي : ${storageService.formatMoney(inv.remainingAmount)}`
              : `مسددة بالكامل ✅`;
          message += `• فاتورة ${inv.invoiceNumber} (${inv.date}) : ${storageService.formatMoney(
            inv.totalAmount
          )} — ${status}\n`;
        });

        if (invoices.length > 5) {
          message += `• ... و ${invoices.length - 5} فواتير أخرى\n`;
        }
      }

      if (totalRemaining > 0) {
        message += `\nيرجى التكرم بتسوية المبلغ المتبقي في أقرب وقت ممكن. شكراً لتعاونكم.`;
      } else {
        message += `\nنشكركم جزيلاً على ثقتكم وتعاملكم المتميز معنا.`;
      }

      message += `\n\n_إدارة العملاء والفواتير_`;
      return message;
    }

    // Version Française
    let message = `Bonjour *${client.name}*,\n\n`;
    message += `Voici le récapitulatif de votre *situation financière* :\n\n`;
    message += `📄 *Factures totales* : ${invoices.length}\n`;
    message += `💰 *Total des ventes* : ${storageService.formatMoney(totalSales)}\n`;
    message += `✅ *Total réglé* : ${storageService.formatMoney(totalPaid)}\n`;

    if (totalRemaining > 0) {
      message += `⚠️ *Reste à payer* : *${storageService.formatMoney(totalRemaining)}*\n`;
    } else {
      message += `🎉 *Statut* : *Intégralement soldé (0,00 ${currency})*\n`;
    }

    if (invoices.length > 0) {
      message += `\n📋 *Détail de vos factures* :\n`;
      invoices.slice(0, 5).forEach((inv) => {
        const status =
          inv.remainingAmount > 0
            ? `Reste : ${storageService.formatMoney(inv.remainingAmount)}`
            : `Réglée ✅`;
        message += `• ${inv.invoiceNumber} (${inv.date}) : ${storageService.formatMoney(
          inv.totalAmount
        )} — ${status}\n`;
      });

      if (invoices.length > 5) {
        message += `• ... et ${invoices.length - 5} autre(s) facture(s)\n`;
      }
    }

    if (totalRemaining > 0) {
      message += `\nMerci de bien vouloir régulariser le montant restant dès que possible.`;
    } else {
      message += `\nNous vous remercions pour votre confiance et votre fidélité.`;
    }

    message += `\n\n_Gestion Clients & Facturation_`;
    return message;
  }

  /**
   * Construit le message pour la situation globale de l'entreprise (Français ou Arabe)
   */
  public static buildGlobalSituationMessage(lang: 'fr' | 'ar' = 'fr'): string {
    const stats = storageService.getGlobalStats();
    const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    if (lang === 'ar') {
      let message = `📊 *التقرير والوضعية المالية الإجمالية*\n`;
      message += `📅 التاريخ : ${today}\n\n`;
      message += `👥 *إجمالي عدد العملاء* : ${stats.totalClients}\n`;
      message += `📄 *إجمالي الفواتير المحررة* : ${stats.totalInvoices}\n`;
      message += `💰 *رقم المعاملات (المبيعات)* : ${storageService.formatMoney(stats.totalSales)}\n`;
      message += `✅ *إجمالي المقبوض (المسدد)* : ${storageService.formatMoney(stats.totalPaid)}\n`;
      message += `⚠️ *إجمالي الديون (المتبقي)* : *${storageService.formatMoney(stats.totalRemaining)}*\n\n`;
      message += `_إدارة العملاء والفواتير_`;
      return message;
    }

    let message = `📊 *Synthèse Financière Globale*\n`;
    message += `📅 Date : ${today}\n\n`;
    message += `👥 *Total Clients* : ${stats.totalClients}\n`;
    message += `📄 *Nombre de Factures* : ${stats.totalInvoices}\n`;
    message += `💰 *Chiffre d'Affaires (Ventes)* : ${storageService.formatMoney(stats.totalSales)}\n`;
    message += `✅ *Total Encaissé* : ${storageService.formatMoney(stats.totalPaid)}\n`;
    message += `⚠️ *Total Créances (Reste dû)* : *${storageService.formatMoney(stats.totalRemaining)}*\n\n`;
    message += `_Gestion Clients & Facturation_`;

    return message;
  }

  /**
   * Ouvre WhatsApp avec le message pré-rempli
   * Si targetPhone est fourni, tente d'envoyer directement au contact
   */
  public static shareViaWhatsApp(
    messageText: string,
    targetPhone?: string,
    countryPrefix: string = '33'
  ): void {
    const encoded = encodeURIComponent(messageText);

    let url = '';
    if (targetPhone && targetPhone.trim()) {
      const cleaned = this.cleanPhoneNumber(targetPhone, countryPrefix);
      url = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encoded}`;
    }

    // Ouvre dans un nouvel onglet ou lance l'application WhatsApp sur Android / iOS
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Copie le texte formaté dans le presse-papier
   */
  public static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}
