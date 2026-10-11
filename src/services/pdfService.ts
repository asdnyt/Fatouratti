import { jsPDF } from 'jspdf';
import { Invoice } from '../types';
import { storageService } from './storage';

export class PdfService {
  /**
   * Génère l'instance jsPDF complète et stylisée d'une facture / bon de vente
   */
  public static createInvoicePdf(invoice: Invoice): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const currency = storageService.getCurrency();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Palette de couleurs professionnelles
    const primaryColor: [number, number, number] = [37, 99, 235]; // #2563EB
    const darkColor: [number, number, number] = [15, 23, 42]; // #0F172A
    const grayBg: [number, number, number] = [248, 250, 252]; // #F8FAFC
    const grayBorder: [number, number, number] = [226, 232, 240]; // #E2E8F0
    const textMuted: [number, number, number] = [100, 116, 139]; // #64748B
    const greenColor: [number, number, number] = [5, 150, 105]; // #059669
    const redColor: [number, number, number] = [220, 38, 38]; // #DC2626

    // --- EN-TÊTE PRINCIPAL ---
    // Bandeau bleu supérieur
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BON DE VENTE & FACTURE', 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Gestion Clients & Facturation', pageWidth - 14, 15, { align: 'right' });

    // --- INFORMATIONS FACTURE (Sous le bandeau) ---
    let y = 36;

    // Bloc Facture (Gauche)
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Facture N° : ${invoice.invoiceNumber}`, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.text(`Date d'émission : ${invoice.date}`, 14, y + 6);

    // --- CADRE CLIENT (Droite) ---
    const clientBoxX = pageWidth - 90;
    const clientBoxWidth = 76;
    const clientBoxHeight = 30;

    doc.setFillColor(...grayBg);
    doc.setDrawColor(...grayBorder);
    doc.roundedRect(clientBoxX, y - 6, clientBoxWidth, clientBoxHeight, 3, 3, 'FD');

    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CLIENT DESTINATAIRE', clientBoxX + 4, y);

    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(invoice.clientName, clientBoxX + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.text(`Tél : ${invoice.clientPhone}`, clientBoxX + 4, y + 12);
    
    const client = storageService.getClient(invoice.clientId);
    if (client?.address) {
      doc.text(`Adresse : ${client.address}`, clientBoxX + 4, y + 17, {
        maxWidth: clientBoxWidth - 8,
      });
    }

    // --- TABLEAU DES ARTICLES ---
    y = 74;

    // En-tête du tableau
    doc.setFillColor(30, 41, 59); // Dark slate
    doc.rect(14, y, pageWidth - 28, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);

    const colX = {
      designation: 18,
      qty: 110,
      price: 140,
      total: pageWidth - 18,
    };

    doc.text('DÉSIGNATION DU PRODUIT / SERVICE', colX.designation, y + 5.5);
    doc.text('QTÉ', colX.qty, y + 5.5, { align: 'center' });
    doc.text(`P.U. (${currency})`, colX.price, y + 5.5, { align: 'right' });
    doc.text(`TOTAL (${currency})`, colX.total, y + 5.5, { align: 'right' });

    y += 8;

    // Lignes d'articles
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    invoice.items.forEach((item, index) => {
      const rowHeight = 8;
      // Alternance de fond de ligne
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(248, 250, 252);
      }
      doc.rect(14, y, pageWidth - 28, rowHeight, 'F');

      // Bordure basse
      doc.setDrawColor(...grayBorder);
      doc.line(14, y + rowHeight, pageWidth - 14, y + rowHeight);

      doc.setTextColor(...darkColor);
      doc.text(item.designation, colX.designation, y + 5.5);

      doc.setTextColor(...textMuted);
      doc.text(String(item.quantity), colX.qty, y + 5.5, { align: 'center' });

      doc.text(
        new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(item.unitPrice),
        colX.price,
        y + 5.5,
        { align: 'right' }
      );

      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'bold');
      doc.text(
        new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(item.total),
        colX.total,
        y + 5.5,
        { align: 'right' }
      );
      doc.setFont('helvetica', 'normal');

      y += rowHeight;
    });

    y += 6;

    // --- RÉCAPITULATIF FINANCIER (Bas droite) ---
    const summaryBoxWidth = 85;
    const summaryX = pageWidth - 14 - summaryBoxWidth;

    // Cadre Total
    doc.setFillColor(...grayBg);
    doc.setDrawColor(...grayBorder);
    doc.roundedRect(summaryX, y, summaryBoxWidth, 34, 3, 3, 'FD');

    // Total Général
    let sumY = y + 7;
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL GÉNÉRAL :', summaryX + 4, sumY);
    doc.text(
      `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(invoice.totalAmount)} ${currency}`,
      summaryX + summaryBoxWidth - 4,
      sumY,
      { align: 'right' }
    );

    // Séparateur fin
    doc.setDrawColor(...grayBorder);
    doc.line(summaryX + 4, sumY + 3, summaryX + summaryBoxWidth - 4, sumY + 3);

    // Montant Payé
    sumY += 9;
    doc.setTextColor(...greenColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Montant Payé :', summaryX + 4, sumY);
    doc.text(
      `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(invoice.paidAmount)} ${currency}`,
      summaryX + summaryBoxWidth - 4,
      sumY,
      { align: 'right' }
    );

    // Reste à Payer
    sumY += 9;
    const hasRemaining = invoice.remainingAmount > 0;
    if (hasRemaining) {
      doc.setTextColor(...redColor);
      doc.text('RESTE À PAYER :', summaryX + 4, sumY);
      doc.text(
        `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(invoice.remainingAmount)} ${currency}`,
        summaryX + summaryBoxWidth - 4,
        sumY,
        { align: 'right' }
      );
    } else {
      doc.setTextColor(...greenColor);
      doc.text('STATUT :', summaryX + 4, sumY);
      doc.text('SOLDÉ (0.00 ' + currency + ')', summaryX + summaryBoxWidth - 4, sumY, {
        align: 'right',
      });
    }

    // --- NOTES (Gauche) ---
    if (invoice.notes) {
      doc.setFillColor(...grayBg);
      doc.setDrawColor(...grayBorder);
      doc.roundedRect(14, y, summaryX - 20, 34, 3, 3, 'FD');

      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('REMARQUES & CONDITIONS :', 18, y + 6);

      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(invoice.notes, 18, y + 12, { maxWidth: summaryX - 28 });
    }

    // --- PIED DE PAGE ---
    const footerY = pageHeight - 15;
    doc.setDrawColor(...grayBorder);
    doc.line(14, footerY, pageWidth - 14, footerY);

    doc.setTextColor(...textMuted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Merci pour votre confiance ! Document généré hors-ligne.', 14, footerY + 5);
    doc.text(
      `Page 1/1 • Facture ${invoice.invoiceNumber}`,
      pageWidth - 14,
      footerY + 5,
      { align: 'right' }
    );

    return doc;
  }

  /**
   * Télécharge directement le fichier PDF sur l'appareil
   */
  public static downloadInvoicePdf(invoice: Invoice) {
    const doc = this.createInvoicePdf(invoice);
    const filename = `Facture_${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  }

  /**
   * Partage le document PDF via l'API Web Share native (WhatsApp, Email, etc.)
   * ou télécharge si non supporté
   */
  public static async shareInvoicePdf(invoice: Invoice): Promise<{ success: boolean; shared: boolean }> {
    const doc = this.createInvoicePdf(invoice);
    const filename = `Facture_${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`;

    try {
      const blob = doc.output('blob');
      const file = new File([blob], filename, { type: 'application/pdf' });

      // Vérifie si navigator.canShare supporte les fichiers
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Facture ${invoice.invoiceNumber}`,
          text: `Bonjour ${invoice.clientName}, voici votre facture N° ${invoice.invoiceNumber} d'un montant de ${storageService.formatMoney(invoice.totalAmount)}.`,
        });
        return { success: true, shared: true };
      }

      // Si le partage de fichier n'est pas supporté mais que navigator.share existe
      if (navigator.share) {
        await navigator.share({
          title: `Facture ${invoice.invoiceNumber}`,
          text: `Facture N° ${invoice.invoiceNumber} pour ${invoice.clientName}. Total : ${storageService.formatMoney(invoice.totalAmount)}, Reste : ${storageService.formatMoney(invoice.remainingAmount)}.`,
        });
        return { success: true, shared: true };
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return { success: true, shared: false };
      }
      console.warn('Partage natif non disponible, téléchargement direct:', e);
    }

    // Fallback : téléchargement direct
    this.downloadInvoicePdf(invoice);
    return { success: true, shared: false };
  }

  /**
   * Ouvre la boîte de dialogue d'impression native du navigateur
   */
  public static printInvoicePdf(invoice: Invoice) {
    const doc = this.createInvoicePdf(invoice);
    doc.autoPrint();
    const pdfBlobUrl = URL.createObjectURL(doc.output('blob'));
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = pdfBlobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        window.open(pdfBlobUrl, '_blank');
      }
    };
  }
}
