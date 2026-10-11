import { Client, Invoice, InvoiceItem, ClientFinancialSummary } from '../types';

const STORAGE_KEY_CLIENTS = 'facturation_clients_v1';
const STORAGE_KEY_INVOICES = 'facturation_invoices_v1';
const STORAGE_KEY_CURRENCY = 'facturation_currency_v1';

// Initial demo dataset for realistic preview
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c-1',
    name: 'Mohamed Amine',
    phone: '06 12 34 56 78',
    address: '15 Rue de la Paix, Paris',
    createdAt: '2026-03-01T10:00:00.000Z',
    remainingBalance: 450,
  },
  {
    id: 'c-2',
    name: 'Société Atlas SARL',
    phone: '06 98 76 54 32',
    address: 'Zone Industrielle Nord, Lyon',
    createdAt: '2026-03-05T14:30:00.000Z',
    remainingBalance: 0,
  },
  {
    id: 'c-3',
    name: 'Fatima Zahra',
    phone: '07 55 44 33 22',
    address: '42 Avenue de la Liberté, Marseille',
    createdAt: '2026-03-10T09:15:00.000Z',
    remainingBalance: 1200,
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'FACT-2026-001',
    clientId: 'c-1',
    clientName: 'Mohamed Amine',
    clientPhone: '06 12 34 56 78',
    date: '2026-03-02',
    items: [
      { id: 'item-1', designation: 'Pack Fournitures Bureau', quantity: 2, unitPrice: 350, total: 700 },
      { id: 'item-2', designation: 'Cartouche d\'encre Noir', quantity: 5, unitPrice: 50, total: 250 },
    ],
    totalAmount: 950,
    paidAmount: 500,
    remainingAmount: 450,
    notes: 'Acompte versé à la commande, solde à la livraison.',
    createdAt: '2026-03-02T11:00:00.000Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'FACT-2026-002',
    clientId: 'c-2',
    clientName: 'Société Atlas SARL',
    clientPhone: '06 98 76 54 32',
    date: '2026-03-08',
    items: [
      { id: 'item-3', designation: 'Maintenance Informatique Trimestrielle', quantity: 1, unitPrice: 1500, total: 1500 },
    ],
    totalAmount: 1500,
    paidAmount: 1500,
    remainingAmount: 0,
    notes: 'Payé intégralement par virement.',
    createdAt: '2026-03-08T15:00:00.000Z',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'FACT-2026-003',
    clientId: 'c-3',
    clientName: 'Fatima Zahra',
    clientPhone: '07 55 44 33 22',
    date: '2026-03-12',
    items: [
      { id: 'item-4', designation: 'Prestation Peinture & Rénovation', quantity: 3, unitPrice: 400, total: 1200 },
    ],
    totalAmount: 1200,
    paidAmount: 0,
    remainingAmount: 1200,
    notes: 'Facture en attente de règlement.',
    createdAt: '2026-03-12T10:30:00.000Z',
  },
];

class StorageService {
  private clients: Client[] = [];
  private invoices: Invoice[] = [];
  private currencySymbol: string = '€';

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedClients = localStorage.getItem(STORAGE_KEY_CLIENTS);
      const storedInvoices = localStorage.getItem(STORAGE_KEY_INVOICES);
      const storedCurrency = localStorage.getItem(STORAGE_KEY_CURRENCY);

      if (storedCurrency) {
        this.currencySymbol = storedCurrency;
      }

      if (storedClients && storedInvoices) {
        this.clients = JSON.parse(storedClients);
        this.invoices = JSON.parse(storedInvoices);
      } else {
        // Seed initial data
        this.clients = [...INITIAL_CLIENTS];
        this.invoices = [...INITIAL_INVOICES];
        this.persist();
      }

      this.recalculateBalances();
    } catch (e) {
      console.warn('Erreur initialisation stockage local:', e);
      this.clients = [...INITIAL_CLIENTS];
      this.invoices = [...INITIAL_INVOICES];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(this.clients));
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(this.invoices));
      localStorage.setItem(STORAGE_KEY_CURRENCY, this.currencySymbol);
    } catch (e) {
      console.error('Erreur sauvegarde stockage local:', e);
    }
  }

  public getCurrency(): string {
    return this.currencySymbol;
  }

  public setCurrency(symbol: string) {
    this.currencySymbol = symbol;
    this.persist();
  }

  public formatMoney(amount: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
    return `${formatted} ${this.currencySymbol}`;
  }

  // Recalcule le solde restant de chaque client à partir de ses factures
  private recalculateBalances() {
    const balances: Record<string, number> = {};
    for (const inv of this.invoices) {
      const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
      balances[inv.clientId] = (balances[inv.clientId] || 0) + remaining;
    }

    this.clients = this.clients.map(client => ({
      ...client,
      remainingBalance: balances[client.id] || 0,
    }));
  }

  // === GESTION DES CLIENTS ===
  public getClients(): Client[] {
    this.recalculateBalances();
    return [...this.clients].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }

  public getClient(id: string): Client | undefined {
    return this.clients.find(c => c.id === id);
  }

  public addClient(data: { name: string; phone: string; address?: string }): Client {
    const newClient: Client = {
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address?.trim() || '',
      createdAt: new Date().toISOString(),
      remainingBalance: 0,
    };
    this.clients.unshift(newClient);
    this.persist();
    return newClient;
  }

  public updateClient(id: string, updates: Partial<Client>): Client | null {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.clients[index] = { ...this.clients[index], ...updates };
    
    // Si le nom ou téléphone a changé, mettre à jour dans les factures existantes
    if (updates.name || updates.phone) {
      this.invoices = this.invoices.map(inv => {
        if (inv.clientId === id) {
          return {
            ...inv,
            clientName: updates.name || inv.clientName,
            clientPhone: updates.phone || inv.clientPhone,
          };
        }
        return inv;
      });
    }

    this.recalculateBalances();
    this.persist();
    return this.clients[index];
  }

  public deleteClient(id: string): { success: boolean; message?: string } {
    const clientInvoices = this.invoices.filter(inv => inv.clientId === id);
    if (clientInvoices.length > 0) {
      return {
        success: false,
        message: `Impossible de supprimer ce client : ${clientInvoices.length} facture(s) lui sont associées. Supprimez d'abord ses factures.`,
      };
    }

    this.clients = this.clients.filter(c => c.id !== id);
    this.persist();
    return { success: true };
  }

  // === GESTION DES FACTURES ===
  public getInvoices(): Invoice[] {
    return [...this.invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getInvoicesByClient(clientId: string): Invoice[] {
    return this.invoices
      .filter(inv => inv.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getInvoice(id: string): Invoice | undefined {
    return this.invoices.find(inv => inv.id === id);
  }

  public generateNextInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const count = this.invoices.length + 1;
    const padded = String(count).padStart(3, '0');
    return `FACT-${year}-${padded}`;
  }

  public addInvoice(data: {
    clientId: string;
    items: Omit<InvoiceItem, 'id' | 'total'>[];
    paidAmount: number;
    notes?: string;
    date?: string;
  }): Invoice {
    const client = this.getClient(data.clientId);
    if (!client) {
      throw new Error('Client introuvable');
    }

    // Calcul des totaux des lignes
    const computedItems: InvoiceItem[] = data.items.map((item, index) => {
      const qte = Number(item.quantity) || 0;
      const pu = Number(item.unitPrice) || 0;
      return {
        id: 'item-' + Date.now() + '-' + index,
        designation: item.designation.trim() || 'Article sans nom',
        quantity: qte,
        unitPrice: pu,
        total: Math.round(qte * pu * 100) / 100,
      };
    });

    // Total général
    const totalAmount = computedItems.reduce((acc, item) => acc + item.total, 0);
    const paidAmount = Math.min(totalAmount, Math.max(0, Number(data.paidAmount) || 0));
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      invoiceNumber: this.generateNextInvoiceNumber(),
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      date: data.date || new Date().toISOString().split('T')[0],
      items: computedItems,
      totalAmount,
      paidAmount,
      remainingAmount,
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    this.invoices.unshift(newInvoice);
    this.recalculateBalances();
    this.persist();
    return newInvoice;
  }

  public recordPayment(invoiceId: string, additionalAmount: number): Invoice | null {
    const invoice = this.getInvoice(invoiceId);
    if (!invoice) return null;

    const newPaid = Math.min(invoice.totalAmount, invoice.paidAmount + additionalAmount);
    const newRemaining = Math.max(0, invoice.totalAmount - newPaid);

    invoice.paidAmount = newPaid;
    invoice.remainingAmount = newRemaining;

    this.recalculateBalances();
    this.persist();
    return invoice;
  }

  public deleteInvoice(id: string): boolean {
    const beforeCount = this.invoices.length;
    this.invoices = this.invoices.filter(inv => inv.id !== id);
    if (this.invoices.length !== beforeCount) {
      this.recalculateBalances();
      this.persist();
      return true;
    }
    return false;
  }

  // === SITUATION FINANCIÈRE ===
  public getClientFinancialSummary(clientId: string): ClientFinancialSummary | null {
    const client = this.getClient(clientId);
    if (!client) return null;

    const clientInvoices = this.invoices.filter(inv => inv.clientId === clientId);
    const totalSales = clientInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalPaid = clientInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const totalRemaining = Math.max(0, totalSales - totalPaid);

    return {
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientAddress: client.address,
      invoiceCount: clientInvoices.length,
      totalSales,
      totalPaid,
      totalRemaining,
    };
  }

  public getAllFinancialSummaries(): ClientFinancialSummary[] {
    return this.getClients().map(client => {
      const clientInvoices = this.invoices.filter(inv => inv.clientId === client.id);
      const totalSales = clientInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
      const totalPaid = clientInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
      const totalRemaining = Math.max(0, totalSales - totalPaid);

      return {
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        clientAddress: client.address,
        invoiceCount: clientInvoices.length,
        totalSales,
        totalPaid,
        totalRemaining,
      };
    });
  }

  public getGlobalStats() {
    const totalClients = this.clients.length;
    const totalInvoices = this.invoices.length;
    const totalSales = this.invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalPaid = this.invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const totalRemaining = Math.max(0, totalSales - totalPaid);

    return {
      totalClients,
      totalInvoices,
      totalSales,
      totalPaid,
      totalRemaining,
    };
  }

  public resetSampleData() {
    this.clients = [...INITIAL_CLIENTS];
    this.invoices = [...INITIAL_INVOICES];
    this.recalculateBalances();
    this.persist();
  }

  public clearAllData() {
    this.clients = [];
    this.invoices = [];
    this.persist();
  }
}

export const storageService = new StorageService();
