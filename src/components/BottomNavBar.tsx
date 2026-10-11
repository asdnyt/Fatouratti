import React from 'react';
import { Users, ReceiptText, BarChart3, Code2 } from 'lucide-react';
import { TabType } from '../types';
import { useI18n } from '../services/i18n';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unpaidCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  unpaidCount = 0,
}) => {
  const { t } = useI18n();

  const navItems = [
    {
      id: 'clients' as TabType,
      label: t.navClients,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-100 dark:bg-blue-950/60',
    },
    {
      id: 'invoices' as TabType,
      label: t.navInvoices,
      icon: ReceiptText,
      color: 'text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    },
    {
      id: 'situation' as TabType,
      label: t.navSituation,
      icon: BarChart3,
      color: 'text-purple-600 dark:text-purple-400',
      activeBg: 'bg-purple-100 dark:bg-purple-950/60',
      badge: unpaidCount > 0 ? unpaidCount : undefined,
    },
    {
      id: 'android-project' as TabType,
      label: t.navAndroidCode,
      icon: Code2,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Navigation principale"
      className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 pb-[max(env(safe-area-inset-bottom),0px)]"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative group`}
            >
              <div
                className={`flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200 ${
                  isActive ? item.activeBg : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? `${item.color} scale-105 stroke-[2.3]`
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1.5 right-4 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                  isActive
                    ? `${item.color} font-bold`
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
