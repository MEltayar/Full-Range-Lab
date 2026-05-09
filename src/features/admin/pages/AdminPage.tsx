import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Shield, Users, UserCheck, Receipt,
  Pencil, Trash2, RefreshCw, Check, X, ChevronDown, MoreVertical, CalendarPlus,
  Search, ArrowUp, ArrowDown, ArrowUpDown,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useUserStore } from '../../../store/userStore';
import type { UserRole } from '../../../store/userStore';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import {
  listAllPaymentProofs,
  signPaymentProofUrl,
  approvePaymentProof,
  rejectPaymentProof,
} from '../../../store/paymentProofStore';
import type { PaymentProof } from '../../../types';

// ── Types ─────────────────────────────────────────────────────────────────────

const PLAN_OPTIONS = ['trial', 'pro_monthly', 'pro_yearly'] as const;
type PlanOption = typeof PLAN_OPTIONS[number];
const PLAN_LABELS: Record<PlanOption, string> = {
  trial: 'Trial', pro_monthly: 'Pro Monthly', pro_yearly: 'Pro Yearly',
};

const STATUS_OPTIONS = ['active', 'expired'] as const;
type StatusOption = typeof STATUS_OPTIONS[number];

interface UnifiedUser {
  id: string;
  role: UserRole;
  displayName: string | null;
  // subscription fields — null means no subscription row yet
  subId: string | null;
  plan: PlanOption | null;
  status: StatusOption | null;
  trialStartedAt: string | null;
  currentPeriodEnd: string | null;
  clientsCreated: number;  // ever-created counter (used for trial limit)
  activeClients: number;   // actual current count from clients table
}

interface AdminClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  age: number | null;
  userId: string | null;
  ownerName: string | null;
  createdAt: string;
}

type Tab = 'users' | 'clients' | 'payments';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PlanBadge({ plan }: { plan: PlanOption }) {
  const styles: Record<PlanOption, string> = {
    pro_monthly: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    pro_yearly:  'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    trial:       'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${styles[plan]}`}>
      {PLAN_LABELS[plan]}
    </span>
  );
}

function StatusBadge({ status }: { status: StatusOption }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
      status === 'active'
        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
        : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
    }`}>
      {status === 'active' ? 'Active' : 'Expired'}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return role === 'super_admin'
    ? <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">Super Admin</span>
    : role === 'staff'
    ? <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Staff</span>
    : <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">User</span>;
}

// ── Inline editable text cell ─────────────────────────────────────────────────

function EditableText({
  value, onSave, disabled,
}: { value: string; onSave: (v: string) => Promise<void>; disabled?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <span
        className={`group flex items-center gap-1.5 ${!disabled ? 'cursor-pointer' : ''}`}
        onClick={() => !disabled && setEditing(true)}
      >
        {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
        {!disabled && <Pencil size={11} className="opacity-0 group-hover:opacity-50 transition-opacity" />}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        className="border border-blue-400 rounded px-1.5 py-0.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-36 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button onClick={save} disabled={saving} className="text-green-600 hover:text-green-700 p-0.5"><Check size={13} /></button>
      <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 p-0.5"><X size={13} /></button>
    </span>
  );
}

// ── Inline select cell ────────────────────────────────────────────────────────

function SelectCell<T extends string>({
  value, options, onSave, disabled, renderOption,
}: {
  value: T;
  options: T[];
  onSave: (v: T) => Promise<void>;
  disabled?: boolean;
  renderOption?: (v: T) => string;
}) {
  const [saving, setSaving] = useState(false);

  async function handle(v: T) {
    if (v === value) return;
    setSaving(true);
    await onSave(v);
    setSaving(false);
  }

  return (
    <div className="relative inline-flex items-center gap-1">
      <select
        value={value}
        onChange={(e) => handle(e.target.value as T)}
        disabled={disabled || saving}
        className="appearance-none pr-5 text-[11px] font-medium border-0 bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((o) => (
          <option key={o} value={o}>{renderOption ? renderOption(o) : o}</option>
        ))}
      </select>
      {!disabled && <ChevronDown size={10} className="absolute right-0 pointer-events-none text-gray-400" />}
    </div>
  );
}

// Controlled date input that commits on blur. Uncontrolled `defaultValue` +
// `onChange` was eating partial picks — onChange only fires on a fully valid
// date, so closing the calendar mid-pick left the DB null while the field
// looked filled.
function PeriodEndInput({ value, onCommit }: { value: string | null; onCommit: (v: string) => void }) {
  const initial = value ? value.slice(0, 10) : '';
  const [draft, setDraft] = useState(initial);
  const lastCommittedRef = useRef(initial);

  useEffect(() => {
    setDraft(initial);
    lastCommittedRef.current = initial;
  }, [initial]);

  function commit() {
    if (draft === lastCommittedRef.current) return;
    lastCommittedRef.current = draft;
    onCommit(draft);
  }

  return (
    <input
      type="date"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
      className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}

// ── Filter / sort helpers ─────────────────────────────────────────────────────

type SortKey = 'name' | 'plan' | 'status' | 'period' | 'clients';
type RoleFilter = 'all' | 'user' | 'staff' | 'super_admin';
type PlanFilter = 'all' | PlanOption | 'none';
type StatusFilter = 'all' | StatusOption | 'none';

function FilterChipGroup<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { v: T; l: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
      <div className="flex gap-1 flex-wrap">
        {options.map(({ v, l }) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`text-[11px] px-2 py-1 rounded-md font-medium transition-colors ${
              value === v
                ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function SortableTh({
  label, sortKey, current, dir, onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: 'asc' | 'desc';
  onClick: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        className={`flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${
          active ? 'text-gray-700 dark:text-gray-200' : ''
        }`}
      >
        {label}
        {active
          ? (dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)
          : <ArrowUpDown size={11} className="opacity-30" />}
      </button>
    </th>
  );
}

// ── Unified Users Tab ─────────────────────────────────────────────────────────

function UsersTab({ isSuperAdmin, isStaff }: { isSuperAdmin: boolean; isStaff: boolean }) {
  const canManage = isSuperAdmin || isStaff; // can edit subscriptions & names
  const [users, setUsers] = useState<UnifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const showToast = useToastStore((s) => s.showToast);

  // Search / filter / sort
  const [searchQ, setSearchQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Close the kebab menu on any click outside or on Escape.
  useEffect(() => {
    if (!openMenuId) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!menuContainerRef.current || !target) return;
      if (!menuContainerRef.current.contains(target)) setOpenMenuId(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenuId(null); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenuId]);

  const load = useCallback(async () => {
    setLoading(true);
    const [profileRes, subRes, clientRes] = await Promise.all([
      supabase.from('user_profiles').select('*').order('display_name'),
      supabase.from('subscriptions').select('*'),
      supabase.from('clients').select('user_id'),
    ]);

    const subMap = new Map(
      (subRes.data ?? []).map((s) => [s.user_id, s]),
    );

    // Count active clients per user from the real clients table
    const activeClientMap = new Map<string, number>();
    for (const c of clientRes.data ?? []) {
      if (c.user_id) activeClientMap.set(c.user_id, (activeClientMap.get(c.user_id) ?? 0) + 1);
    }

    setUsers(
      (profileRes.data ?? []).map((p) => {
        const sub = subMap.get(p.id) ?? null;
        return {
          id: p.id,
          role: p.role as UserRole,
          displayName: p.display_name,
          subId: sub?.id ?? null,
          plan: (sub?.plan as PlanOption) ?? null,
          status: (sub?.status as StatusOption) ?? null,
          trialStartedAt: sub?.trial_started_at ?? null,
          currentPeriodEnd: sub?.current_period_end ?? null,
          clientsCreated: sub?.clients_created ?? 0,
          activeClients: activeClientMap.get(p.id) ?? 0,
        };
      }),
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Role ──────────────────────────────────────────────────────────────────

  async function updateRole(id: string, roleValue: string) {
    // Empty string means "normal user" → store as null in DB
    const role = (roleValue || null) as UserRole | null;
    const { error } = await supabase.from('user_profiles').update({ role }).eq('id', id);
    if (error) {
      showToast('Failed to update role. Please try again.', 'error');
      return;
    }
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: role as UserRole } : u));
  }

  async function updateName(id: string, displayName: string) {
    await supabase.from('user_profiles').update({ display_name: displayName }).eq('id', id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, displayName } : u));
  }

  // ── Subscription helpers ──────────────────────────────────────────────────

  // Always upsert by user_id — works whether a subscription row exists or not,
  // and avoids relying on RLS letting the admin read other users' sub IDs.
  async function upsertSub(userId: string, patch: Record<string, unknown>) {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
    if (error) {
      console.error('[upsertSub]', error);
      showToast('Failed to update subscription. Please try again.', 'error');
      return;
    }
    // Optimistically update local state
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const updated = { ...u };
        if ('plan' in patch) updated.plan = patch.plan as PlanOption;
        if ('status' in patch) updated.status = patch.status as StatusOption;
        if ('current_period_end' in patch) updated.currentPeriodEnd = patch.current_period_end as string | null;
        if ('trial_started_at' in patch) updated.trialStartedAt = patch.trial_started_at as string;
        if ('clients_created' in patch) updated.clientsCreated = patch.clients_created as number;
        // If this was a new sub (subId was null), mark it as created
        if (updated.subId == null) updated.subId = userId; // placeholder until reload
        return updated;
      }),
    );
  }

  async function handlePlanChange(u: UnifiedUser, plan: PlanOption) {
    const patch: Record<string, unknown> = { plan };
    // Auto-fill a sensible period end when promoting to a Pro plan if none is set —
    // prevents the wall from firing because admin forgot the date field.
    if ((plan === 'pro_monthly' || plan === 'pro_yearly') && !u.currentPeriodEnd) {
      const days = plan === 'pro_yearly' ? 365 : 30;
      const next = new Date();
      next.setDate(next.getDate() + days);
      patch.current_period_end = next.toISOString();
    }
    await upsertSub(u.id, patch);
  }

  async function handleStatusChange(u: UnifiedUser, status: StatusOption) {
    await upsertSub(u.id, { status });
  }

  async function handlePeriodEndChange(u: UnifiedUser, value: string) {
    await upsertSub(u.id, { current_period_end: value || null });
  }

  // Extend the paid-through date by N days. If the current period is already in
  // the future, stack the renewal on top of it so we don't accidentally shorten
  // a customer's window. Otherwise extend from today.
  async function handleExtend(u: UnifiedUser, days: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = u.currentPeriodEnd ? new Date(u.currentPeriodEnd) : null;
    const base = current && current > today ? current : today;
    const next = new Date(base);
    next.setDate(next.getDate() + days);
    await upsertSub(u.id, { current_period_end: next.toISOString() });
  }

  // Apply search, filters, then sort. Keep the original list intact for counts.
  const visibleUsers = useMemo(() => {
    let list = users;

    const q = searchQ.trim().toLowerCase();
    if (q) {
      list = list.filter((u) =>
        (u.displayName ?? '').toLowerCase().includes(q) ||
        u.id.toLowerCase().startsWith(q),
      );
    }

    if (roleFilter !== 'all') {
      list = list.filter((u) =>
        roleFilter === 'user' ? (!u.role || u.role === 'user') : u.role === roleFilter,
      );
    }

    if (planFilter !== 'all') {
      list = list.filter((u) => planFilter === 'none' ? u.plan == null : u.plan === planFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter((u) => statusFilter === 'none' ? u.status == null : u.status === statusFilter);
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'name':    return ((a.displayName ?? '').localeCompare(b.displayName ?? '')) * dir;
        case 'plan':    return ((a.plan ?? '').localeCompare(b.plan ?? '')) * dir;
        case 'status':  return ((a.status ?? '').localeCompare(b.status ?? '')) * dir;
        case 'period': {
          const av = a.currentPeriodEnd ? new Date(a.currentPeriodEnd).getTime() : 0;
          const bv = b.currentPeriodEnd ? new Date(b.currentPeriodEnd).getTime() : 0;
          return (av - bv) * dir;
        }
        case 'clients': return (a.activeClients - b.activeClients) * dir;
      }
    });
  }, [users, searchQ, roleFilter, planFilter, statusFilter, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  }

  const filtersActive =
    !!searchQ.trim() || roleFilter !== 'all' || planFilter !== 'all' || statusFilter !== 'all';

  function clearFilters() {
    setSearchQ('');
    setRoleFilter('all');
    setPlanFilter('all');
    setStatusFilter('all');
  }

  if (loading) return <Loader />;

  return (
    <div ref={menuContainerRef} className="flex flex-col gap-3">

      {/* Toolbar: search + filter chips */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search by name or ID…"
            className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {searchQ && (
            <button
              onClick={() => setSearchQ('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <FilterChipGroup<RoleFilter>
            label="Role"
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { v: 'all',         l: 'All' },
              { v: 'user',        l: 'Users' },
              { v: 'staff',       l: 'Staff' },
              { v: 'super_admin', l: 'Super Admin' },
            ]}
          />
          <FilterChipGroup<PlanFilter>
            label="Plan"
            value={planFilter}
            onChange={setPlanFilter}
            options={[
              { v: 'all',         l: 'All' },
              { v: 'trial',       l: 'Trial' },
              { v: 'pro_monthly', l: 'Monthly' },
              { v: 'pro_yearly',  l: 'Yearly' },
              { v: 'none',        l: 'No plan' },
            ]}
          />
          <FilterChipGroup<StatusFilter>
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { v: 'all',     l: 'All' },
              { v: 'active',  l: 'Active' },
              { v: 'expired', l: 'Expired' },
              { v: 'none',    l: 'No status' },
            ]}
          />
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop / tablet table ─────────────────────────────────────── */}
      <div className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <SortableTh label="Name"       sortKey="name"    current={sortKey} dir={sortDir} onClick={toggleSort} />
                <Th>Role</Th>
                <SortableTh label="Plan"       sortKey="plan"    current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableTh label="Status"     sortKey="status"  current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableTh label="Period End" sortKey="period"  current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableTh label="Clients"    sortKey="clients" current={sortKey} dir={sortDir} onClick={toggleSort} />
                {canManage && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {visibleUsers.map((u) => {
                const canEdit = canManage && u.role !== 'super_admin';
                return (
                  <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {(u.displayName ?? '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <EditableText
                            value={u.displayName ?? ''}
                            onSave={(v) => updateName(u.id, v)}
                            disabled={!canEdit}
                          />
                          <p className="text-[10px] text-gray-400 font-mono">{u.id.slice(0, 16)}…</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {canEdit && isSuperAdmin ? (
                        <select
                          value={u.role ?? ''}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        >
                          <option value="">User</option>
                          <option value="staff">Staff</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <RoleBadge role={u.role} />
                      )}
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3">
                      {canManage ? (
                        <div className="relative inline-flex items-center gap-1">
                          <select
                            value={u.plan ?? 'trial'}
                            onChange={(e) => handlePlanChange(u, e.target.value as PlanOption)}
                            className="appearance-none pr-5 text-[11px] font-medium border-0 bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                          >
                            {PLAN_OPTIONS.map((p) => (
                              <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-0 pointer-events-none text-gray-400" />
                        </div>
                      ) : (
                        <PlanBadge plan={u.plan ?? 'trial'} />
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {u.status && canManage ? (
                        <SelectCell<StatusOption>
                          value={u.status}
                          options={[...STATUS_OPTIONS]}
                          renderOption={(v) => v === 'active' ? 'Active' : 'Expired'}
                          onSave={(v) => handleStatusChange(u, v)}
                        />
                      ) : u.status ? (
                        <StatusBadge status={u.status} />
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>

                    {/* Period End */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.subId && canManage ? (
                        <PeriodEndInput
                          value={u.currentPeriodEnd}
                          onCommit={(v) => handlePeriodEndChange(u, v)}
                        />
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{fmt(u.currentPeriodEnd)}</span>
                      )}
                    </td>

                    {/* Clients */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{u.activeClients}</span>
                      {u.subId && u.clientsCreated !== u.activeClients && (
                        <span className="block text-[10px] text-gray-400 dark:text-gray-500" title="Trial counter (includes deleted)">
                          {u.clientsCreated} ever
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    {canManage && (
                      <td className="px-2 py-3 w-10 text-right relative">
                        {u.subId && (
                          <>
                            <button
                              onClick={() => setOpenMenuId((prev) => (prev === u.id ? null : u.id))}
                              title="Subscription actions"
                              aria-label="Open subscription actions"
                              aria-haspopup="menu"
                              aria-expanded={openMenuId === u.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {openMenuId === u.id && (
                              <div
                                role="menu"
                                className="absolute right-2 top-full mt-1 z-30 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl py-1 text-left"
                              >
                                <button
                                  role="menuitem"
                                  onClick={() => { handleExtend(u, 30); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors font-semibold"
                                >
                                  <CalendarPlus size={12} /> Extend +30 days
                                </button>
                                <button
                                  role="menuitem"
                                  onClick={() => { handleExtend(u, 365); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors font-semibold"
                                >
                                  <CalendarPlus size={12} /> Extend +1 year
                                </button>
                                <div className="my-1 border-t border-gray-100 dark:border-gray-700/60" />
                                <button
                                  role="menuitem"
                                  onClick={() => { upsertSub(u.id, { trial_started_at: new Date().toISOString() }); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                                >
                                  <RefreshCw size={12} /> Reset trial to today
                                </button>
                                <button
                                  role="menuitem"
                                  onClick={() => { upsertSub(u.id, { clients_created: 0 }); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                                >
                                  <RefreshCw size={12} /> Reset clients counter
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                    {users.length === 0 ? 'No users yet.' : 'No users match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-400 dark:text-gray-500">
          {filtersActive
            ? `${visibleUsers.length} of ${users.length} user${users.length !== 1 ? 's' : ''}`
            : `${users.length} user${users.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* ── Mobile cards ────────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-2.5">
        {visibleUsers.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500 rounded-xl border border-gray-200 dark:border-gray-700">
            {users.length === 0 ? 'No users yet.' : 'No users match your filters.'}
          </div>
        )}
        {visibleUsers.map((u) => {
          const canEdit = canManage && u.role !== 'super_admin';
          return (
            <div
              key={u.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-3.5 flex flex-col gap-3"
            >
              {/* Header — avatar, name, role, kebab */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {(u.displayName ?? '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <EditableText
                    value={u.displayName ?? ''}
                    onSave={(v) => updateName(u.id, v)}
                    disabled={!canEdit}
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    <RoleBadge role={u.role} />
                    <p className="text-[10px] text-gray-400 font-mono truncate">{u.id.slice(0, 12)}…</p>
                  </div>
                </div>
                {canManage && u.subId && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId((prev) => (prev === u.id ? null : u.id))}
                      title="Subscription actions"
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === u.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === u.id && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full mt-1 z-30 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl py-1 text-left"
                      >
                        <button role="menuitem" onClick={() => { handleExtend(u, 30); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 font-semibold">
                          <CalendarPlus size={12} /> Extend +30 days
                        </button>
                        <button role="menuitem" onClick={() => { handleExtend(u, 365); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 font-semibold">
                          <CalendarPlus size={12} /> Extend +1 year
                        </button>
                        <div className="my-1 border-t border-gray-100 dark:border-gray-700/60" />
                        <button role="menuitem" onClick={() => { upsertSub(u.id, { trial_started_at: new Date().toISOString() }); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                          <RefreshCw size={12} /> Reset trial to today
                        </button>
                        <button role="menuitem" onClick={() => { upsertSub(u.id, { clients_created: 0 }); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60">
                          <RefreshCw size={12} /> Reset clients counter
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Field grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Plan</span>
                  {canManage ? (
                    <div className="relative inline-flex items-center gap-1">
                      <select
                        value={u.plan ?? 'trial'}
                        onChange={(e) => handlePlanChange(u, e.target.value as PlanOption)}
                        className="appearance-none pr-5 text-xs font-medium border-0 bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 rounded text-gray-800 dark:text-gray-100"
                      >
                        {PLAN_OPTIONS.map((p) => (
                          <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-0 pointer-events-none text-gray-400" />
                    </div>
                  ) : (
                    <PlanBadge plan={u.plan ?? 'trial'} />
                  )}
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Status</span>
                  {u.status && canManage ? (
                    <SelectCell<StatusOption>
                      value={u.status}
                      options={[...STATUS_OPTIONS]}
                      renderOption={(v) => v === 'active' ? 'Active' : 'Expired'}
                      onSave={(v) => handleStatusChange(u, v)}
                    />
                  ) : u.status ? (
                    <StatusBadge status={u.status} />
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                  )}
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Period End</span>
                  {u.subId && canManage ? (
                    <PeriodEndInput
                      value={u.currentPeriodEnd}
                      onCommit={(v) => handlePeriodEndChange(u, v)}
                    />
                  ) : (
                    <span className="text-xs text-gray-600 dark:text-gray-300">{fmt(u.currentPeriodEnd)}</span>
                  )}
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Clients</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{u.activeClients}</span>
                  {u.subId && u.clientsCreated !== u.activeClients && (
                    <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">/ {u.clientsCreated} ever</span>
                  )}
                </div>

                {canEdit && isSuperAdmin && (
                  <div className="col-span-2">
                    <span className="block text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Role</span>
                    <select
                      value={u.role ?? ''}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="">User</option>
                      <option value="staff">Staff</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <p className="px-1 py-1 text-xs text-gray-400 dark:text-gray-500">
          {filtersActive
            ? `${visibleUsers.length} of ${users.length} user${users.length !== 1 ? 's' : ''}`
            : `${users.length} user${users.length !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  );
}

// ── Clients Tab ───────────────────────────────────────────────────────────────

function ClientsTab({ isSuperAdmin, isStaff }: { isSuperAdmin: boolean; isStaff: boolean }) {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = useUserStore((s) => s.userId);
  const showConfirm = useConfirmStore((s) => s.showConfirm);

  const load = useCallback(async () => {
    setLoading(true);
    const [clientRes, profileRes] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('user_profiles').select('id, display_name'),
    ]);
    const profileMap = new Map((profileRes.data ?? []).map((p) => [p.id, p.display_name]));
    setClients(
      (clientRes.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email ?? null,
        phone: c.phone ?? null,
        age: c.age ?? null,
        userId: c.user_id ?? null,
        ownerName: c.user_id ? (profileMap.get(c.user_id) ?? 'Unknown') : '—',
        createdAt: c.created_at,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateClientName(id: string, name: string) {
    await supabase.from('clients').update({ name }).eq('id', id);
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, name } : c));
  }

  function deleteClient(id: string, name: string) {
    showConfirm({
      title: 'Delete Client',
      message: `Are you sure you want to delete "${name}"?`,
      variant: 'danger',
      onConfirm: async () => {
        await supabase.from('clients').delete().eq('id', id);
        setClients((prev) => prev.filter((c) => c.id !== id));
      },
    });
  }

  const canEditClient = (c: AdminClient) =>
    isSuperAdmin || isStaff || c.userId === currentUserId;

  if (loading) return <Loader />;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Age</Th>
              <Th>Owner</Th>
              <Th>Created</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  <EditableText
                    value={c.name}
                    onSave={(v) => updateClientName(c.id, v)}
                    disabled={!canEditClient(c)}
                  />
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.age ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                    {c.ownerName}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs">{fmt(c.createdAt)}</td>
                <td className="px-4 py-3">
                  {canEditClient(c) && (
                    <button
                      onClick={() => deleteClient(c.id, c.name)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete client"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">No clients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-400 dark:text-gray-500">
        {clients.length} client{clients.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {children}
    </th>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'users',    label: 'Users',       icon: Users     },
  { id: 'clients',  label: 'All Clients', icon: UserCheck },
  { id: 'payments', label: 'Payments',    icon: Receipt   },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users');
  const isSuperAdmin = useUserStore((s) => s.isSuperAdmin)();
  const canAccessAdmin = useUserStore((s) => s.canAccessAdmin)();
  const role = useUserStore((s) => s.role);
  const isStaff = role === 'staff';

  if (!canAccessAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Shield size={24} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Access denied</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
          <Shield size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Admin Panel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isSuperAdmin ? 'Full control — users, subscriptions, and clients.' : isStaff ? 'Staff access — manage subscriptions and clients.' : 'Read-only view of all users and clients.'}
            <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
              {role === 'super_admin' ? 'Super Admin' : 'Staff'}
            </span>
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'users'    && <UsersTab    isSuperAdmin={isSuperAdmin} isStaff={isStaff} />}
      {tab === 'clients'  && <ClientsTab  isSuperAdmin={isSuperAdmin} isStaff={isStaff} />}
      {tab === 'payments' && <PaymentsTab />}

    </div>
  );
}

// ── Payments Tab ──────────────────────────────────────────────────────────────

const PLAN_DAYS: Record<'pro_monthly' | 'pro_yearly', number> = {
  pro_monthly: 30,
  pro_yearly:  365,
};

function PaymentsTab() {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileMap, setProfileMap] = useState<Map<string, string | null>>(new Map());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const showToast = useToastStore((s) => s.showToast);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, profileRes] = await Promise.all([
      listAllPaymentProofs(),
      supabase.from('user_profiles').select('id, display_name'),
    ]);
    setProofs(list);
    setProfileMap(new Map((profileRes.data ?? []).map((p) => [p.id, p.display_name])));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openPreview(p: PaymentProof) {
    const url = await signPaymentProofUrl(p.storagePath);
    if (!url) {
      showToast('Could not load receipt.', 'error');
      return;
    }
    setPreviewUrl(url);
  }

  // Approve. Stack on top of the user's existing paid window if it's still in the
  // future, so a renewal paid early doesn't shorten the remaining time.
  async function approve(p: PaymentProof) {
    setActionId(p.id);
    try {
      const { data: subRow } = await supabase
        .from('subscriptions')
        .select('current_period_end')
        .eq('user_id', p.userId)
        .maybeSingle();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const existing = subRow?.current_period_end ? new Date(subRow.current_period_end) : null;
      const base = existing && existing > today ? existing : today;
      const next = new Date(base);
      next.setDate(next.getDate() + PLAN_DAYS[p.requestedPlan]);
      await approvePaymentProof(p.id, next.toISOString(), null);
      showToast('Payment approved.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Approval failed.', 'error');
    } finally {
      setActionId(null);
    }
  }

  async function reject(p: PaymentProof) {
    const note = window.prompt('Reason for rejection (shown to the trainer):', '');
    if (note === null) return;
    setActionId(p.id);
    try {
      await rejectPaymentProof(p.id, note.trim() || null);
      showToast('Payment rejected.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Rejection failed.', 'error');
    } finally {
      setActionId(null);
    }
  }

  if (loading) return <Loader />;

  const visible = filter === 'pending' ? proofs.filter((p) => p.status === 'pending') : proofs;
  const pendingCount = proofs.filter((p) => p.status === 'pending').length;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/60 dark:bg-gray-800/40">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            All
          </button>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <Th>Trainer</Th>
              <Th>Method</Th>
              <Th>Amount</Th>
              <Th>Plan</Th>
              <Th>Reference</Th>
              <Th>Submitted</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {visible.map((p) => {
              const trainerName = profileMap.get(p.userId) ?? p.userId.slice(0, 8) + '…';
              const busy = actionId === p.id;
              return (
                <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{trainerName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {p.method === 'vodafone_cash' ? 'Vodafone Cash' : p.method === 'instapay' ? 'Instapay' : 'Other'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {p.amountPaid != null ? `${p.amountPaid} EGP` : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PlanBadge plan={p.requestedPlan} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={p.referenceNote ?? ''}>
                    {p.referenceNote || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs">{fmt(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      p.status === 'pending'  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                      p.status === 'approved' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                                                 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openPreview(p)}
                        title="View receipt"
                        className="text-[11px] px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                        View
                      </button>
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approve(p)}
                            disabled={busy}
                            className="text-[11px] px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-semibold disabled:opacity-50">
                            <Check size={11} className="inline -mt-0.5" /> Approve
                          </button>
                          <button
                            onClick={() => reject(p)}
                            disabled={busy}
                            className="text-[11px] px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold disabled:opacity-50">
                            <X size={11} className="inline -mt-0.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                  {filter === 'pending' ? 'No pending payments.' : 'No payments yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white">
              <X size={16} />
            </button>
            {/\.pdf($|\?)/i.test(previewUrl) ? (
              <iframe src={previewUrl} className="w-[80vw] h-[85vh] rounded-lg bg-white" title="Receipt" />
            ) : (
              <img src={previewUrl} alt="Receipt" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
