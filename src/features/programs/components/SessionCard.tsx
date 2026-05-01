import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useConfirmStore } from '../../../store/confirmStore';
import type { ProgramExercise, Session } from '../../../types';
import SortableExerciseList from './SortableExerciseList';

// Display order matches the diet day picker (Saturday first).
// `dow` is the `Date.getDay()` index (0=Sun…6=Sat).
const WEEKDAYS: { dow: number; name: string }[] = [
  { dow: 6, name: 'Saturday'  },
  { dow: 0, name: 'Sunday'    },
  { dow: 1, name: 'Monday'    },
  { dow: 2, name: 'Tuesday'   },
  { dow: 3, name: 'Wednesday' },
  { dow: 4, name: 'Thursday'  },
  { dow: 5, name: 'Friday'    },
];

interface SessionCardProps {
  session: Session;
  onUpdateLabel: (label: string) => void;
  onUpdateDayOfWeek: (dayOfWeek: number | undefined) => void;
  onDelete: () => void;
  onAddExercise: () => void;
  onUpdateParams: (
    programExerciseId: string,
    params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'weightKg' | 'restSeconds' | 'notes'>>
  ) => void;
  onRemoveExercise: (programExerciseId: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

export default function SessionCard({
  session,
  onUpdateLabel,
  onUpdateDayOfWeek,
  onDelete,
  onAddExercise,
  onUpdateParams,
  onRemoveExercise,
  onReorder,
}: SessionCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [label, setLabel] = useState(session.label);
  const showConfirm = useConfirmStore((s) => s.showConfirm);

  const selectValue = session.dayOfWeek === undefined ? '__custom__' : String(session.dayOfWeek);

  function commitLabel() {
    const trimmed = label.trim();
    if (trimmed !== session.label) onUpdateLabel(trimmed);
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
          aria-label={expanded ? 'Collapse session' : 'Expand session'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <select
            value={selectValue}
            onChange={(e) => {
              const v = e.target.value;
              onUpdateDayOfWeek(v === '__custom__' ? undefined : Number(v));
            }}
            className="text-sm font-semibold bg-transparent border-0 focus:outline-none text-gray-900 dark:text-gray-100 cursor-pointer pr-1"
          >
            {WEEKDAYS.map(({ dow, name }) => (
              <option key={dow} value={dow}>{name}</option>
            ))}
            <option value="__custom__">Custom…</option>
          </select>

          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={commitLabel}
            placeholder="Push, Upper Body, …"
            className="text-sm bg-transparent border-b border-transparent focus:border-orange-500 focus:outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0 flex-1"
          />
        </div>

        <button
          onClick={() => showConfirm({
            title: 'Delete Session',
            message: `Delete "${session.label || 'this session'}" and all its exercises?`,
            variant: 'danger',
            onConfirm: onDelete,
          })}
          className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
          aria-label={`Delete session ${session.label}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4 flex flex-col gap-3">
          <SortableExerciseList
            exercises={session.exercises}
            onUpdateParams={onUpdateParams}
            onRemove={onRemoveExercise}
            onReorder={onReorder}
          />

          <button
            onClick={onAddExercise}
            className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <Plus size={14} />
            Add Exercise
          </button>
        </div>
      )}
    </div>
  );
}
