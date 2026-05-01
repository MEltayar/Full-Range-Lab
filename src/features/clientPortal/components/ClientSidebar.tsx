import { useState } from 'react';
import { Home, ClipboardList, User, X, LogOut } from 'lucide-react';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import { BrandTile } from '../../../components/Brand';
import { useAuthStore } from '../../../store/authStore';
import { useClientPortalStore } from '../../../store/clientPortalStore';

export type TabId = 'today' | 'plans' | 'me';

export const CLIENT_NAV_ITEMS: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: 'today', label: 'Today', Icon: Home },
  { id: 'plans', label: 'Plans', Icon: ClipboardList },
  { id: 'me',    label: 'Me',    Icon: User },
];

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
}

export default function ClientSidebar({ isOpen, onClose, activeTab, setActiveTab }: ClientSidebarProps) {
  const linkedClient = useClientPortalStore((s) => s.linkedClient);
  const resetPortal  = useClientPortalStore((s) => s.reset);
  const signOut      = useAuthStore((s) => s.signOut);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      resetPortal();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <aside
      className={[
        'flex flex-col h-screen px-3 py-4',
        'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:translate-x-0 md:w-56 md:shrink-0',
      ].join(' ')}
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="mb-6 px-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandTile className="w-8 h-8 rounded-xl shadow-lg" />
          <div>
            <p className="text-sm font-bold tracking-tight text-white leading-none">Full Range Lab</p>
            <p className="text-[10px] text-orange-300 mt-0.5 font-medium tracking-wide">Client Portal</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {CLIENT_NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { setActiveTab(id); onClose(); }}
              className={
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`
              }
              style={isActive ? { background: 'linear-gradient(135deg, #f97316, #dc2626)', boxShadow: '0 2px 12px rgba(249,115,22,0.35)' } : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
        {linkedClient && (
          <p className="px-3 text-[10px] uppercase tracking-wide text-white/40">
            Signed in as <span className="text-white/80 font-semibold normal-case">{linkedClient.name}</span>
          </p>
        )}
        <ThemeToggle />
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/75 hover:bg-white/10 hover:text-white transition-all w-full text-left disabled:opacity-50"
        >
          <LogOut size={16} />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
