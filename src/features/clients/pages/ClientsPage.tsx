import { useEffect, useMemo, useState } from 'react';
import { UsersRound, Activity, CalendarDays } from 'lucide-react';
import { useClientStore } from '../../../store/clientStore';
import { useProgramStore } from '../../../store/programStore';
import { usePlanStore } from '../../../store/planStore';
import { useClientActivityStore } from '../../../store/clientActivityStore';
import { useToastStore } from '../../../store/toastStore';
import { useConfirmStore } from '../../../store/confirmStore';
import { LockedButton } from '../../../components/UpgradeLock';
import type { Client } from '../../../types';
import ClientSearch from '../components/ClientSearch';
import ClientList from '../components/ClientList';
import ClientModal from '../components/ClientModal';

export default function ClientsPage() {
  const initializeFromDB = useClientStore((s) => s.initializeFromDB);
  const isLoaded = useClientStore((s) => s.isLoaded);
  const searchTerm = useClientStore((s) => s.searchTerm);
  const allClients = useClientStore((s) => s.clients);
  const addClient = useClientStore((s) => s.addClient);
  const updateClient = useClientStore((s) => s.updateClient);
  const deleteClient = useClientStore((s) => s.deleteClient);
  const showToast = useToastStore((s) => s.showToast);
  const showConfirm = useConfirmStore((s) => s.showConfirm);

  const initializePrograms = useProgramStore((s) => s.initializeFromDB);
  const programs = useProgramStore((s) => s.programs);

  const loadActivity     = useClientActivityStore((s) => s.load);
  const recentClientIds  = useClientActivityStore((s) => s.recentClientIds);

  const clients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term ? allClients.filter((c) => c.name.toLowerCase().includes(term)) : allClients;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [allClients, searchTerm]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    initializeFromDB();
    initializePrograms();
    loadActivity();
  }, [initializeFromDB, initializePrograms, loadActivity]);

  // ── Stats ─────────────────────────────────────────────────
  const programCountByClient = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of programs) map.set(p.clientId, (map.get(p.clientId) ?? 0) + 1);
    return map;
  }, [programs]);

  const activeClientIds = useMemo(
    () => new Set(programs.filter((p) => p.status === 'active').map((p) => p.clientId)),
    [programs],
  );

  const newThisMonth = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(1); cutoff.setHours(0, 0, 0, 0);
    return allClients.filter((c) => new Date(c.createdAt) >= cutoff).length;
  }, [allClients]);

  // ── Handlers ──────────────────────────────────────────────
  function handleEdit(client: Client) {
    setSelectedClient(client);
    setModalOpen(true);
  }

  function handleDelete(client: Client) {
    showConfirm({
      title: 'Delete Client',
      message: `Are you sure you want to delete "${client.name}"? This cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteClient(client.id);
        } catch {
          showToast('Failed to delete client. Please try again.', 'error');
        }
      },
    });
  }

  async function handleSave(data: Omit<Client, 'id' | 'createdAt'>) {
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, data);
      } else {
        await addClient(data);
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      showToast(msg, 'error');
    }
  }

  const isPlanLoaded = usePlanStore((s) => s.isLoaded);
  const clientLimitReached = usePlanStore((s) => s.clientLimitReached());
  const addBlocked = !isPlanLoaded || clientLimitReached;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and manage your client roster.</p>
        </div>
        <LockedButton
          locked={addBlocked}
          feature="unlimited clients"
          onClick={() => { setSelectedClient(null); setModalOpen(true); }}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0 self-start sm:self-auto"
        >
          + Add Client
        </LockedButton>
      </div>

      {/* ── Work area card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Stats strip */}
        {isLoaded && allClients.length > 0 && (
          <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
            {[
              { icon: UsersRound, value: allClients.length,   label: 'Total clients'   },
              { icon: Activity,   value: activeClientIds.size, label: 'Active programs' },
              { icon: CalendarDays, value: newThisMonth,      label: 'New this month'  },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 text-center sm:text-left items-center">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-orange-500 dark:text-orange-400" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{value}</p>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <ClientSearch />
        </div>

        {/* Client list */}
        <div className="p-4">
          <ClientList
            clients={clients}
            isLoaded={isLoaded}
            searchTerm={searchTerm}
            programCountByClient={programCountByClient}
            activeClientIds={activeClientIds}
            recentlyActiveClientIds={recentClientIds}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <ClientModal
        client={selectedClient}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
