import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2, ChevronRight, ClipboardList, Mail, Phone } from 'lucide-react';
import type { Client } from '../../../types';

interface ClientCardProps {
  client: Client;
  programCount: number;
  hasActiveProgram: boolean;
  recentlyActive?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-orange-400 to-red-500',
    'from-teal-400 to-cyan-600',
    'from-violet-400 to-purple-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-green-600',
    'from-blue-400 to-indigo-600',
    'from-rose-400 to-pink-600',
    'from-sky-400 to-blue-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ClientCard({ client, programCount, hasActiveProgram, recentlyActive = false, onEdit, onDelete }: ClientCardProps) {
  const initials = client.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const avatarColor = getAvatarColor(client.name);

  // Engagement window pill — only shown when an end date is set.
  const subPill = (() => {
    if (!client.subscriptionEndDate) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const end = new Date(`${client.subscriptionEndDate}T00:00:00`);
    const days = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
    if (days < 0) return { text: `Expired ${Math.abs(days)}d ago`, cls: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' };
    if (days <= 7) return { text: `${days}d left`, cls: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' };
    return null;
  })();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function openMenu() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setMenuOpen((v) => !v);
  }

  const hasActions = onEdit || onDelete;

  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all group" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}>

      {/* Avatar */}
      <div className={`relative w-11 h-11 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center shrink-0 shadow-sm`}>
        <span className="text-sm font-bold text-white">{initials}</span>
        {recentlyActive && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-800"
            title="Active in the last 7 days"
            aria-label="Active in the last 7 days"
          />
        )}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/clients/${client.id}`}
            className="text-base font-bold text-gray-900 dark:text-gray-100 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            {client.name}
          </Link>
          {hasActiveProgram && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </span>
          )}
          {subPill && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${subPill.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${subPill.dot}`} />
              {subPill.text}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {client.age !== undefined && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Age: {client.age}</span>
          )}
          {client.email && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 truncate">
              <Mail size={11} /> {client.email}
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 truncate">
              <Phone size={11} /> {client.phone}
            </span>
          )}
        </div>
      </div>

      {/* Program count pill */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1.5 rounded-lg shrink-0 shadow-sm">
        <ClipboardList size={12} />
        {programCount} program{programCount !== 1 ? 's' : ''}
      </div>

      {/* Meatball menu */}
      {hasActions && (
        <div className="shrink-0">
          <button
            ref={btnRef}
            onClick={openMenu}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Actions"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
              className="z-50 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
            >
              {onEdit && (
                <button
                  onClick={() => { onEdit(); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Pencil size={13} className="text-gray-400" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigate arrow */}
      <Link
        to={`/clients/${client.id}`}
        className="p-1.5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors shrink-0"
      >
        <ChevronRight size={15} />
      </Link>
    </div>
  );
}
