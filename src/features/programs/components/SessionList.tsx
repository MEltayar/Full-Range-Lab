import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ProgramExercise, Session } from '../../../types';
import SessionCard from './SessionCard';

interface SessionListProps {
  sessions: Session[];
  onUpdateLabel: (sessionId: string, label: string) => void;
  onUpdateDayOfWeek: (sessionId: string, dayOfWeek: number | undefined) => void;
  onDeleteSession: (sessionId: string) => void;
  onAddExercise: (sessionId: string) => void;
  onUpdateParams: (
    sessionId: string,
    programExerciseId: string,
    params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'weightKg' | 'restSeconds' | 'notes'>>
  ) => void;
  onRemoveExercise: (sessionId: string, programExerciseId: string) => void;
  onReorder: (sessionId: string, oldIndex: number, newIndex: number) => void;
  onReorderSessions: (oldIndex: number, newIndex: number) => void;
}

interface SortableSessionWrapperProps {
  session: Session;
  children: React.ReactNode;
}

function SortableSessionWrapper({ session, children }: SortableSessionWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: session.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-start gap-1"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-4 p-1 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Drag to reorder session"
        tabIndex={-1}
      >
        <GripVertical size={16} />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export default function SessionList({
  sessions,
  onUpdateLabel,
  onUpdateDayOfWeek,
  onDeleteSession,
  onAddExercise,
  onUpdateParams,
  onRemoveExercise,
  onReorder,
  onReorderSessions,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
        No sessions yet — click Add Session to begin
      </p>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sessions.findIndex((s) => s.id === active.id);
    const newIndex = sessions.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderSessions(oldIndex, newIndex);
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sessions.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SortableSessionWrapper key={session.id} session={session}>
              <SessionCard
                session={session}
                onUpdateLabel={(label) => onUpdateLabel(session.id, label)}
                onUpdateDayOfWeek={(dow) => onUpdateDayOfWeek(session.id, dow)}
                onDelete={() => onDeleteSession(session.id)}
                onAddExercise={() => onAddExercise(session.id)}
                onUpdateParams={(peId, params) => onUpdateParams(session.id, peId, params)}
                onRemoveExercise={(peId) => onRemoveExercise(session.id, peId)}
                onReorder={(oldIndex, newIndex) => onReorder(session.id, oldIndex, newIndex)}
              />
            </SortableSessionWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
