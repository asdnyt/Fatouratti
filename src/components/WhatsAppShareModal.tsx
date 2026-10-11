import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  Copy,
  Check,
  Send,
  ExternalLink,
  Phone
} from 'lucide-react';
import { WhatsAppService } from '../services/whatsappService';
import { useI18n } from '../services/i18n';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  recipientName?: string;
  recipientPhone?: string;
  messageText: string;
}

const COUNTRY_PREFIXES = [
  { code: '33', label: 'France (+33)' },
  { code: '212', label: 'Maroc (+212)' },
  { code: '213', label: 'Algérie (+213)' },
  { code: '216', label: 'Tunisie (+216)' },
  { code: '221', label: 'Sénégal (+221)' },
  { code: '225', label: "Côte d'Ivoire (+225)" },
  { code: '237', label: 'Cameroun (+237)' },
  { code: '32', label: 'Belgique (+32)' },
  { code: '41', label: 'Suisse (+41)' },
  { code: '1', label: 'Canada / USA (+1)' },
];

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  title,
  recipientName,
  recipientPhone = '',
  messageText,
}) => {
  const { t, isRtl } = useI18n();
  const [countryPrefix, setCountryPrefix] = useState('33');
  const [phoneInput, setPhoneInput] = useState(recipientPhone);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await WhatsAppService.copyToClipboard(messageText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendDirect = () => {
    WhatsAppService.shareViaWhatsApp(messageText, phoneInput, countryPrefix);
  };

  const handleSendWithoutPhone = () => {
    WhatsAppService.shareViaWhatsApp(messageText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-up text-xs"
      >
        {/* WhatsApp Brand Header */}
        <div className="bg-[#128C7E] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{title}</h3>
              <p className="text-[11px] text-emerald-100">
                {isRtl ? 'مشاركة مباشرة عبر تطبيق واتساب' : 'Partage direct via WhatsApp'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-100 hover:text-white rounded-lg transition"
            aria-label={t.cancelBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Recipient Phone Configuration */}
          {recipientPhone && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {t.recipientLabel} : {recipientName || (isRtl ? 'العميل' : 'Client')}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <select
                    value={countryPrefix}
                    onChange={(e) => setCountryPrefix(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    {COUNTRY_PREFIXES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-7">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder={isRtl ? 'رقم الهاتف' : 'Numéro de téléphone'}
                    className={`w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Message Preview in WhatsApp Bubble Style */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t.messagePreviewLabel}
            </span>
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="bg-[#DCF8C6] dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tr-none border border-emerald-200 dark:border-emerald-800/80 max-h-48 overflow-y-auto font-sans leading-relaxed text-[11px] shadow-xs"
            >
              <pre className="font-sans whitespace-pre-wrap">{messageText}</pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* Direct Send to Client Button */}
            <button
              onClick={handleSendDirect}
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] active:scale-98 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>
                {recipientPhone
                  ? `${t.sendToClientBtn} (${recipientName || ''})`
                  : (isRtl ? 'فتح واتساب' : 'Ouvrir WhatsApp')}
              </span>
            </button>

            {/* If user wants to choose another contact or copy */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSendWithoutPhone}
                className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition text-[11px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t.sendToOtherContactBtn}</span>
              </button>

              <button
                onClick={handleCopy}
                className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition text-[11px]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">{t.copiedSuccess}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyTextBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
