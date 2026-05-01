import type { LoggedSet } from '../../../types';

interface LoggedSetTableProps {
  sets: LoggedSet[];
}

export default function LoggedSetTable({ sets }: LoggedSetTableProps) {
  if (sets.length === 0) {
    return <p className="text-xs text-gray-400 italic">No sets logged.</p>;
  }
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
      <table className="w-full text-xs">
        <thead className="bg-gray-100 dark:bg-gray-800/60">
          <tr className="text-gray-500 dark:text-gray-400">
            <th className="font-medium text-left px-2 py-1 w-8">#</th>
            <th className="font-medium text-center px-2 py-1">Weight</th>
            <th className="font-medium text-center px-2 py-1">Reps</th>
            <th className="font-medium text-center px-2 py-1 w-12">RPE</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {sets.map((s, i) => (
            <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
              <td className="px-2 py-1 text-gray-500 dark:text-gray-400">{i + 1}</td>
              <td className="px-2 py-1 text-center text-gray-900 dark:text-gray-100 font-medium">
                {s.weightKg !== undefined ? `${s.weightKg} kg` : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-2 py-1 text-center text-gray-900 dark:text-gray-100 font-medium">
                {s.reps !== undefined ? s.reps : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-2 py-1 text-center text-gray-500 dark:text-gray-400">
                {s.rpe !== undefined ? s.rpe : <span className="text-gray-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
