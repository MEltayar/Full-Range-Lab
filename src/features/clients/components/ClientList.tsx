import { UsersRound } from 'lucide-react';
import type { Client } from '../../../types';
import ClientCard from './ClientCard';

interface ClientListProps {
  clients: Client[];
  isLoaded: boolean;
  searchTerm: string;
  programCountByClient: Map<string, number>;
  activeClientIds: Set<string>;
  recentlyActiveClientIds?: Set<string>;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

export default function ClientList({
  clients, isLoaded, searchTerm,
  programCountByClient, activeClientIds, recentlyActiveClientIds,
  onEdit, onDelete,
}: ClientListProps) {
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading clients…</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto">
          <UsersRound size={28} className={searchTerm.trim() ? 'text-gray-400 dark:text-gray-500' : 'text-orange-500 dark:text-orange-400'} />
        </div>
        <div>
          {searchTerm.trim() ? (
            <>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No clients found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No clients yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first client to get started</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          programCount={programCountByClient.get(client.id) ?? 0}
          hasActiveProgram={activeClientIds.has(client.id)}
          recentlyActive={recentlyActiveClientIds?.has(client.id) ?? false}
          onEdit={onEdit ? () => onEdit(client) : undefined}
          onDelete={onDelete ? () => onDelete(client) : undefined}
        />
      ))}
    </div>
  );
}
