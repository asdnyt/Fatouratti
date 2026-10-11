export interface Client {
  id: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
  // Solde restant calculé (somme des restes à payer de toutes ses factures)
  remainingBalance: number;
}

export interface InvoiceItem {
  id: string;
  designation: string;
  quantity: number;
  unitPrice: number;
  total: number; // quantity * unitPrice
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // Ex: FACT-2026-001
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD ou ISO
  items: InvoiceItem[];
  totalAmount: number; // Somme des items
  paidAmount: number; // Montant payé
  remainingAmount: number; // totalAmount - paidAmount
  notes?: string;
  createdAt: string;
}

export interface ClientFinancialSummary {
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  invoiceCount: number;
  totalSales: number;
  totalPaid: number;
  totalRemaining: number;
}

export type TabType = 'clients' | 'invoices' | 'situation' | 'android-project';
