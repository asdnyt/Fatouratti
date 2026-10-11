import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  MapPin,
  Search,
  Receipt,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  Check,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Client } from '../types';
import { storageService } from '../services/storage';
import { useI18n } from '../services/i18n';
import { LanguageSelector } from '../components/LanguageSelector';

interface ClientsScreenProps {
  onSelectClientForInvoice: (client: Client) => void;
  onRefreshTrigger?: number;
}

export const ClientsScreen: React.FC<ClientsScreenProps> = ({
  onSelectClientForInvoice,
}) => {
  const { t, isRtl } = useI18n();
  const [clients, setClients] = useState<Client[]>(() => storageService.getClients());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshClients = () => {
    setClients(storageService.getClients());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddModal = () => {
    setEditingClient(null);
    setName('');
    setPhone('');
    setAddress('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone);
    setAddress(client.address || '');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(t.nameRequiredError);
      return;
    }
    if (!phone.trim()) {
      setFormError(t.phoneRequiredError);
      return;
    }

    if (editingClient) {
      storageService.updateClient(editingClient.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      showToast(editingClient.name);
    } else {
      const created = storageService.addClient({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      showToast(created.name);
    }

    refreshClients();
    setIsAddModalOpen(false);
  };

  const handleDeleteClient = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`${t.deleteClient} : "${client.name}" ?`)) {
      const res = storageService.deleteClient(client.id);
      if (res.success) {
        showToast('Client supprimé.');
        refreshClients();
      } else {
        alert(res.message);
      }
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const totalClients = clients.length;
  const clientsWithDebt = clients.filter((c) => c.remainingBalance > 0).length;
  const totalDebt = clients.reduce((acc, c) => acc + c.remainingBalance, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
      {/* Top Bar Material 3 style */}
      <header className="bg-blue-600 text-white px-4 py-3 shadow-md shrink-0 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight tracking-tight truncate">
                {t.clientsTitle}
              </h1>
              <p className="text-[11px] text-blue-100 font-medium truncate">
                {totalClients} {t.clientsSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Selector compact in screen top bar */}
            <LanguageSelector className="bg-blue-700/80 border-blue-500/50" />

            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-50 active:scale-95 text-xs font-bold rounded-lg shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newClientBtn}</span>
            </button>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="mt-2.5 relative">
          <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 text-blue-200`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchClientPlaceholder}
            className={`w-full bg-blue-700/60 placeholder:text-blue-200/80 text-white text-xs rounded-xl ${
              isRtl ? 'pr-9 pl-8 text-right' : 'pl-9 pr-8'
            } py-2 focus:outline-hidden focus:ring-2 focus:ring-white/40 transition`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute ${isRtl ? 'left-2.5' : 'right-2.5'} top-2.5 text-blue-200 hover:text-white`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Mini Banner Summary */}
      <div className="px-4 py-2 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 flex justify-between items-center text-xs shrink-0">
        <div className="text-slate-600 dark:text-slate-400">
          {t.activeDebts} : <span className="font-semibold text-slate-800 dark:text-slate-200">{clientsWithDebt}</span>
        </div>
        <div className="font-bold text-red-600 dark:text-red-400 font-mono">
          {t.totalDebt} : {storageService.formatMoney(totalDebt)}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-28 left-4 right-4 z-40 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center justify-between animate-fade-in">
          <span>{toastMessage}</span>
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      )}

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 mb-3">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              {searchQuery ? t.noSearchResults : t.noClientsTitle}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {searchQuery
                ? `"${searchQuery}"`
                : t.noClientsSubtitle}
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {t.addFirstClient}
            </button>
          </div>
        ) : (
          filteredClients.map((client) => {
            const hasDebt = client.remainingBalance > 0;
            return (
              <div
                key={client.id}
                onClick={() => onSelectClientForInvoice(client)}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs hover:shadow-md border border-slate-200/90 dark:border-slate-800 transition cursor-pointer active:scale-[0.99] relative overflow-hidden"
              >
                {/* Visual side accent */}
                <div
                  className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-0 bottom-0 w-1.5 ${
                    hasDebt ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />

                <div className="flex items-start justify-between gap-2">
                  <div className={`flex-1 min-w-0 ${isRtl ? 'pr-1' : 'pl-1'}`}>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-base text-slate-900 dark:text-white truncate">
                        {client.name}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <a
                        href={`tel:${client.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:text-blue-600 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        <span dir="ltr">{client.phone}</span>
                      </a>
                      {client.address && (
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-500 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{client.address}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Solde restant - Clearly highlighted */}
                  <div className={`${isRtl ? 'text-left' : 'text-right'} shrink-0`}>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                      {t.remainingBalance}
                    </span>
                    <span
                      className={`text-sm font-extrabold font-mono ${
                        hasDebt
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {storageService.formatMoney(client.remainingBalance)}
                    </span>
                    {hasDebt ? (
                      <span className="inline-block text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded mt-0.5">
                        {t.remainsToPay}
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded mt-0.5">
                        {t.settled}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card footer with direct invoice action */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform">
                    <Receipt className="w-3.5 h-3.5" />
                    {t.createInvoiceForClient}
                    <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => openEditModal(client, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title={t.editClient}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClient(client, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                      title={t.deleteClient}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) - Material 3 standard */}
      <button
        onClick={openAddModal}
        className={`fixed bottom-20 ${isRtl ? 'left-5' : 'right-5'} z-20 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:scale-90 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200`}
        aria-label={t.newClientBtn}
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Form Modal: Ajouter / Modifier un client */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingClient ? t.editClientModalTitle : t.addClientModalTitle}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-blue-100 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.clientNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.clientNamePlaceholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.clientPhoneLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.clientPhonePlaceholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.clientAddressLabel}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.clientAddressPlaceholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold shadow-md transition"
                >
                  {editingClient ? t.updateBtn : t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
