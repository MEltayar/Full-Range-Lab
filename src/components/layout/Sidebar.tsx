import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  UsersRound,
  ClipboardList,
  Settings,
  HelpCircle,
  X,
  LogOut,
  Lock,
  Salad,
  UtensilsCrossed,
  Shield,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { BrandTile } from '../Brand';
import { useAuthStore } from '../../store/authStore';
import { usePlanStore } from '../../store/planStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUserStore } from '../../store/userStore';

const BASE_NAV = [
  { id: 'dashboard',        path: '/',                icon: LayoutDashboard, proOnly: false, rehabOnly: false },
  { id: 'clients',          path: '/clients',         icon: UsersRound,      proOnly: false, rehabOnly: false },
  { id: 'exercises',        path: '/exercises',       icon: Dumbbell,        proOnly: false, rehabOnly: false },
  { id: 'programs',         path: '/programs',        icon: ClipboardList,   proOnly: false, rehabOnly: false },
  { id: 'food-library',     path: '/food-library',    icon: Salad,           proOnly: false, rehabOnly: false },
  { id: 'diet-plans',       path: '/diet-plans',      icon: UtensilsCrossed, proOnly: false, rehabOnly: false },
  { id: 'config',           path: '/config',          icon: Settings,        proOnly: false, rehabOnly: false },
  { id: 'help',             path: '/help',            icon: HelpCircle,      proOnly: false, rehabOnly: false },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const isPro = usePlanStore((s) => s.isPro)();
  const isGym = useSettingsStore((s) => s.profileType) === 'gym';
  const userRole         = useUserStore((s) => s.role);
  const roleConfirmed    = useUserStore((s) => s.roleConfirmed);
  const [signingOut, setSigningOut] = useState(false);

  const navSections = BASE_NAV
    .filter((item) => !(isGym && item.rehabOnly))
    .map((item) => ({
      ...item,
      label:
        item.id === 'programs'         ? (isGym ? 'Training Plans'  : 'Program Builder') :
        item.id === 'clients'          ? 'Clients'          :
        item.id === 'dashboard'        ? 'Dashboard'        :
        item.id === 'exercises'        ? 'Exercise Library' :
        item.id === 'food-library'     ? 'Food Library'     :
        item.id === 'diet-plans'       ? 'Diet Plans'       :
        item.id === 'config'           ? 'Configuration'    :
        'Help & About',
    }));

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch {
      navigate('/login');
    } finally {
      setSigningOut(false);
    }
  }

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
            <p className="text-[10px] text-orange-300 mt-0.5 font-medium tracking-wide">{isGym ? 'Personal Training' : 'Physiotherapy'}</p>
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
        {navSections.map(({ id, label, path, icon: Icon, proOnly }) => {
          const locked = proOnly && !isPro;
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          if (locked) {
            return (
              <a
                key={id}
                href="/pricing"
                title="Upgrade to Pro"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40"
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                <Lock size={12} />
              </a>
            );
          }

          return (
            <NavLink
              key={id}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`
              }
              style={isActive ? { background: 'linear-gradient(135deg, #f97316, #dc2626)', boxShadow: '0 2px 12px rgba(249,115,22,0.35)' } : undefined}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          );
        })}

        {/* Admin panel — super_admin and staff */}
        {roleConfirmed && (userRole === 'super_admin' || userRole === 'staff') && (
          <>
            <div className="my-1 border-t border-white/15" />
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Shield size={16} />
              Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
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
