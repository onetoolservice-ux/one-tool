"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Inbox, Sun, CalendarDays, FolderOpen, ClipboardCheck,
  ChevronDown, ChevronRight, Trash2, Check, Clock, AlertTriangle,
  X, Edit3, Tag, Flag, ArrowRight, RotateCcw, UserCheck,
  Star, Circle, CheckCircle2, Loader2, Calendar, StickyNote,
  ChevronLeft, BarChart3, Archive, Layers
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadTaskStore, saveTaskStore, onTaskStoreUpdate,
  createTask, updateTask, completeTask, dropTask, deleteTask,
  rescheduleTask, processInboxTask, createProject, deleteProject, createArea,
  getInboxTasks, getTodayTasks, getOverdueTasks, getUpcomingTasks,
  getWaitingForTasks, getProjectTasks, getSomedayTasks,
  getWeeklyReviewStats, getWeekStart,
  todayStr, overdueAgeDays, isOverdue,
  type TaskStore, type Task, type Project, type Area, type TaskPriority, type TaskStatus,
} from './task-store';

// ── Constants ─────────────────────────────────────────────────────────────────

const PROJECT_COLORS = [
  '#6366f1','#3b82f6','#10b981','#f59e0b','#f97316',
  '#ec4899','#8b5cf6','#06b6d4','#ef4444','#84cc16',
];

const AREA_COLORS = [
  '#64748b','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444',
];

type View = 'inbox' | 'today' | 'upcoming' | 'projects' | 'waiting' | 'someday' | 'weekly-review';

// ── Small helpers ─────────────────────────────────────────────────────────────

function fmtDate(d: string): string {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function fmtDateFull(d: string): string {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function groupByDate(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};
  tasks.forEach(t => {
    const key = t.scheduledDate ?? t.deadline ?? 'no-date';
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return groups;
}

function getPriorityColor(p: TaskPriority) {
  if (p === 'high') return 'text-red-500';
  if (p === 'someday') return 'text-slate-400';
  return 'text-blue-400';
}

function getPriorityLabel(p: TaskPriority) {
  if (p === 'high') return 'High';
  if (p === 'someday') return 'Someday';
  return 'Normal';
}

// ── Quick Capture Input ───────────────────────────────────────────────────────

function QuickCapture({ onAdd }: { onAdd: (title: string) => void }) {
  const [val, setVal] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal('');
    ref.current?.focus();
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Capture a task… press Enter"
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        autoFocus
      />
      <button
        onClick={submit}
        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-1"
      >
        <Plus size={15} /> Add
      </button>
    </div>
  );
}

// ── Task Row ──────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: Task;
  store: TaskStore;
  onComplete: (id: string) => void;
  onDrop: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  showProject?: boolean;
}

function TaskRow({ task, store, onComplete, onDrop, onEdit, onDelete, showProject }: TaskRowProps) {
  const [completing, setCompleting] = useState(false);
  const overdue = isOverdue(task);
  const ageDays = overdue ? overdueAgeDays(task) : 0;
  const project = task.projectId ? store.projects.find(p => p.id === task.projectId) : null;

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => {
      onComplete(task.id);
      setCompleting(false);
    }, 400);
  };

  return (
    <div className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all ${
      completing ? 'opacity-0 scale-95' : 'opacity-100'
    } hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700`}>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        className={`mt-0.5 flex-shrink-0 transition-colors ${
          completing ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500'
        }`}
      >
        {completing ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {task.title}
          </span>

          {/* Priority flag */}
          {task.priority === 'high' && (
            <Flag size={12} className="text-red-500 flex-shrink-0" />
          )}

          {/* Overdue badge */}
          {overdue && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle size={10} /> {ageDays}d overdue
            </span>
          )}

          {/* Deadline */}
          {task.deadline && !overdue && (
            <span className="text-xs text-orange-500 flex items-center gap-1">
              <Flag size={10} /> {fmtDate(task.deadline)}
            </span>
          )}

          {/* Scheduled */}
          {task.scheduledDate && !task.deadline && !overdue && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock size={10} /> {fmtDate(task.scheduledDate)}
            </span>
          )}

          {/* Waiting for */}
          {task.waitingFor && (
            <span className="text-xs text-purple-500 flex items-center gap-1">
              <UserCheck size={10} /> {task.waitingFor}
            </span>
          )}

          {/* Project chip */}
          {showProject && project && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: project.color + '22', color: project.color }}>
              {project.name}
            </span>
          )}
        </div>

        {task.notes && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{task.notes}</p>
        )}
      </div>

      {/* Actions (show on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(task)} className="p-1 text-slate-400 hover:text-indigo-500 rounded">
          <Edit3 size={14} />
        </button>
        <button onClick={() => onDrop(task.id)} className="p-1 text-slate-400 hover:text-orange-500 rounded">
          <Archive size={14} />
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1 text-slate-400 hover:text-red-500 rounded">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Task Edit Panel ───────────────────────────────────────────────────────────

function TaskEditPanel({
  task, store, onSave, onClose, onComplete, onDrop, onDelete
}: {
  task: Task; store: TaskStore;
  onSave: (id: string, changes: Partial<Task>) => void;
  onClose: () => void;
  onComplete: (id: string) => void;
  onDrop: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [scheduledDate, setScheduledDate] = useState(task.scheduledDate ?? '');
  const [deadline, setDeadline] = useState(task.deadline ?? '');
  const [projectId, setProjectId] = useState(task.projectId ?? '');
  const [areaId, setAreaId] = useState(task.areaId ?? '');
  const [waitingFor, setWaitingFor] = useState(task.waitingFor ?? '');
  const [isInbox, setIsInbox] = useState(task.isInbox);
  const [isToday, setIsToday] = useState(task.isToday);

  const save = () => {
    onSave(task.id, {
      title, notes, priority,
      scheduledDate: scheduledDate || null,
      deadline: deadline || null,
      projectId: projectId || null,
      areaId: areaId || null,
      waitingFor: waitingFor || null,
      isInbox, isToday,
    });
    onClose();
  };

  const overdue = isOverdue(task);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Edit Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {overdue && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">
                This task is {overdueAgeDays(task)} day(s) overdue. Reschedule or drop it.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="someday">Someday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Project</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No project</option>
                {store.projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Scheduled date <span className="font-normal text-slate-400">(when you'll work on it)</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Deadline <span className="font-normal text-slate-400">(actual hard due date)</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Area</label>
              <select
                value={areaId}
                onChange={e => setAreaId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No area</option>
                {store.areas.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Waiting for</label>
              <input
                value={waitingFor}
                onChange={e => setWaitingFor(e.target.value)}
                placeholder="Person or dependency"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={isToday} onChange={e => setIsToday(e.target.checked)} className="rounded" />
              Do today
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={isInbox} onChange={e => setIsInbox(e.target.checked)} className="rounded" />
              Keep in inbox
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => { onComplete(task.id); onClose(); }}
              className="px-3 py-1.5 text-sm rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 flex items-center gap-1"
            >
              <Check size={14} /> Done
            </button>
            <button
              onClick={() => { onDrop(task.id); onClose(); }}
              className="px-3 py-1.5 text-sm rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 flex items-center gap-1"
            >
              <Archive size={14} /> Drop
            </button>
            <button
              onClick={() => { onDelete(task.id); onClose(); }}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center gap-1"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
          <button
            onClick={save}
            className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inbox View ────────────────────────────────────────────────────────────────

function InboxView({ store, onUpdate }: { store: TaskStore; onUpdate: (s: TaskStore) => void }) {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const tasks = getInboxTasks(store);

  const addTask = (title: string) => {
    onUpdate(createTask(store, { title, isInbox: true }));
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Inbox size={20} className="text-indigo-500" /> Inbox
          {tasks.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              {tasks.length}
            </span>
          )}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Capture everything. Process later. No fields required.</p>
      </div>

      <QuickCapture onAdd={addTask} />

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Inbox size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Inbox is clear. Great job processing!</p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">{tasks.length} item{tasks.length !== 1 ? 's' : ''} to process</span>
            <span className="text-xs text-slate-400">Click edit to clarify & organize →</span>
          </div>
          {tasks.map(t => (
            <TaskRow
              key={t.id}
              task={t}
              store={store}
              onComplete={id => onUpdate(completeTask(store, id))}
              onDrop={id => onUpdate(dropTask(store, id))}
              onEdit={setEditTask}
              onDelete={id => onUpdate(deleteTask(store, id))}
              showProject
            />
          ))}
        </div>
      )}

      {editTask && (
        <TaskEditPanel
          task={editTask}
          store={store}
          onSave={(id, changes) => onUpdate(updateTask(store, id, changes))}
          onClose={() => setEditTask(null)}
          onComplete={id => onUpdate(completeTask(store, id))}
          onDrop={id => onUpdate(dropTask(store, id))}
          onDelete={id => onUpdate(deleteTask(store, id))}
        />
      )}
    </div>
  );
}

// ── Today View ────────────────────────────────────────────────────────────────

function TodayView({ store, onUpdate }: { store: TaskStore; onUpdate: (s: TaskStore) => void }) {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const tasks = getTodayTasks(store);
  const overdueTasks = getOverdueTasks(store).filter(t => !tasks.find(td => td.id === t.id));

  const allTasks = [...overdueTasks, ...tasks];
  const highCount = allTasks.filter(t => t.priority === 'high').length;
  const totalCount = allTasks.length;

  // Workload indicator
  const workloadLevel = totalCount >= 12 ? 'red' : totalCount >= 7 ? 'amber' : 'green';

  const addTask = (title: string) => {
    onUpdate(createTask(store, { title, isInbox: false, isToday: true, scheduledDate: todayStr() }));
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Sun size={20} className="text-amber-500" />
          Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h2>

        {/* Workload reality check */}
        <div className={`mt-2 flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg w-fit ${
          workloadLevel === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' :
          workloadLevel === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
          'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
        }`}>
          {workloadLevel === 'red' && <AlertTriangle size={12} />}
          {workloadLevel === 'amber' && <Clock size={12} />}
          {workloadLevel === 'green' && <Check size={12} />}
          <span>
            {totalCount} task{totalCount !== 1 ? 's' : ''} today
            {workloadLevel === 'red' && ' — overloaded, consider dropping some'}
            {workloadLevel === 'amber' && ' — heavy day, stay focused'}
            {workloadLevel === 'green' && ' — realistic plan'}
          </span>
        </div>
      </div>

      <QuickCapture onAdd={addTask} />

      {/* Overdue tasks first */}
      {overdueTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">Overdue — decide: do, reschedule, or drop</span>
          </div>
          <div className="space-y-1 border-l-2 border-red-300 dark:border-red-700 pl-3">
            {overdueTasks.map(t => (
              <TaskRow
                key={t.id}
                task={t}
                store={store}
                onComplete={id => onUpdate(completeTask(store, id))}
                onDrop={id => onUpdate(dropTask(store, id))}
                onEdit={setEditTask}
                onDelete={id => onUpdate(deleteTask(store, id))}
                showProject
              />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && overdueTasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Sun size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nothing committed for today yet.</p>
          <p className="text-xs mt-1">Add tasks above or mark inbox items as "do today".</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.map(t => (
            <TaskRow
              key={t.id}
              task={t}
              store={store}
              onComplete={id => onUpdate(completeTask(store, id))}
              onDrop={id => onUpdate(dropTask(store, id))}
              onEdit={setEditTask}
              onDelete={id => onUpdate(deleteTask(store, id))}
              showProject
            />
          ))}
        </div>
      )}

      {editTask && (
        <TaskEditPanel
          task={editTask}
          store={store}
          onSave={(id, changes) => onUpdate(updateTask(store, id, changes))}
          onClose={() => setEditTask(null)}
          onComplete={id => onUpdate(completeTask(store, id))}
          onDrop={id => onUpdate(dropTask(store, id))}
          onDelete={id => onUpdate(deleteTask(store, id))}
        />
      )}
    </div>
  );
}

// ── Upcoming View ─────────────────────────────────────────────────────────────

function UpcomingView({ store, onUpdate }: { store: TaskStore; onUpdate: (s: TaskStore) => void }) {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const tasks = getUpcomingTasks(store);
  const grouped = groupByDate(tasks);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <CalendarDays size={20} className="text-sky-500" /> Upcoming
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Tasks scheduled in the next 14 days.</p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No upcoming tasks scheduled.</p>
          <p className="text-xs mt-1">Set a scheduled date on tasks to see them here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {fmtDateFull(date)}
                </span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                <span className="text-xs text-slate-400">{grouped[date].length}</span>
              </div>
              <div className="space-y-1">
                {grouped[date].map(t => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    store={store}
                    onComplete={id => onUpdate(completeTask(store, id))}
                    onDrop={id => onUpdate(dropTask(store, id))}
                    onEdit={setEditTask}
                    onDelete={id => onUpdate(deleteTask(store, id))}
                    showProject
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editTask && (
        <TaskEditPanel
          task={editTask}
          store={store}
          onSave={(id, changes) => onUpdate(updateTask(store, id, changes))}
          onClose={() => setEditTask(null)}
          onComplete={id => onUpdate(completeTask(store, id))}
          onDrop={id => onUpdate(dropTask(store, id))}
          onDelete={id => onUpdate(deleteTask(store, id))}
        />
      )}
    </div>
  );
}

// ── Projects View ─────────────────────────────────────────────────────────────

function ProjectsView({ store, onUpdate }: { store: TaskStore; onUpdate: (s: TaskStore) => void }) {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [newProjectArea, setNewProjectArea] = useState('');
  const [showNewArea, setShowNewArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaColor, setNewAreaColor] = useState(AREA_COLORS[0]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [addTaskTitle, setAddTaskTitle] = useState('');

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    onUpdate(createProject(store, { name: newProjectName.trim(), color: newProjectColor, areaId: newProjectArea || null }));
    setNewProjectName(''); setShowNewProject(false);
  };

  const addArea = () => {
    if (!newAreaName.trim()) return;
    onUpdate(createArea(store, { name: newAreaName.trim(), color: newAreaColor }));
    setNewAreaName(''); setShowNewArea(false);
  };

  const addTaskToProject = (projectId: string) => {
    if (!addTaskTitle.trim()) return;
    onUpdate(createTask(store, { title: addTaskTitle.trim(), projectId, isInbox: false }));
    setAddTaskTitle(''); setSelectedProjectId(null);
  };

  // Group projects by area
  const noAreaProjects = store.projects.filter(p => !p.areaId && !p.isSomeday);
  const areaProjects = store.areas.map(area => ({
    area,
    projects: store.projects.filter(p => p.areaId === area.id && !p.isSomeday),
  })).filter(g => g.projects.length > 0);

  const renderProject = (project: Project) => {
    const tasks = getProjectTasks(store, project.id);
    const expanded = expandedProjects.has(project.id);
    const doneCount = store.tasks.filter(t => t.projectId === project.id && t.status === 'done').length;

    return (
      <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
          onClick={() => toggleProject(project.id)}
        >
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: project.color }} />
          <span className="font-medium text-sm text-slate-800 dark:text-slate-200 flex-1">{project.name}</span>
          <span className="text-xs text-slate-400">{tasks.length} active · {doneCount} done</span>
          {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>

        {expanded && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-2 py-2">
            {/* Add task to project */}
            {selectedProjectId === project.id ? (
              <div className="flex gap-2 mb-2 px-2">
                <input
                  value={addTaskTitle}
                  onChange={e => setAddTaskTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTaskToProject(project.id); if (e.key === 'Escape') setSelectedProjectId(null); }}
                  placeholder="Task title…"
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={() => addTaskToProject(project.id)} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg">Add</button>
                <button onClick={() => setSelectedProjectId(null)} className="px-2 py-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X size={14} /></button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedProjectId(project.id)}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 px-2 py-1 mb-1"
              >
                <Plus size={12} /> Add task
              </button>
            )}

            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 px-2 py-2">No active tasks in this project.</p>
            ) : (
              <div className="space-y-1">
                {tasks.map(t => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    store={store}
                    onComplete={id => onUpdate(completeTask(store, id))}
                    onDrop={id => onUpdate(dropTask(store, id))}
                    onEdit={setEditTask}
                    onDelete={id => onUpdate(deleteTask(store, id))}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-end pt-1 px-2">
              <button
                onClick={() => onUpdate(deleteProject(store, project.id))}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 size={11} /> Delete project
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FolderOpen size={20} className="text-violet-500" /> Projects & Areas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Areas are ongoing responsibilities. Projects have a finish line.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNewArea(true)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1">
            <Layers size={12} /> Area
          </button>
          <button onClick={() => setShowNewProject(true)} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
            <Plus size={12} /> Project
          </button>
        </div>
      </div>

      {/* New Project Form */}
      {showNewProject && (
        <div className="mb-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-3">New Project</p>
          <div className="flex gap-2 mb-3">
            <input
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addProject()}
              placeholder="Project name"
              autoFocus
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newProjectArea}
              onChange={e => setNewProjectArea(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="">No area</option>
              {store.areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {PROJECT_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewProjectColor(c)}
                className={`w-5 h-5 rounded-full transition-transform ${newProjectColor === c ? 'ring-2 ring-offset-1 ring-indigo-500 scale-125' : ''}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addProject} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
            <button onClick={() => setShowNewProject(false)} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* New Area Form */}
      {showNewArea && (
        <div className="mb-4 p-4 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20">
          <p className="text-xs font-medium text-violet-700 dark:text-violet-400 mb-3">New Area</p>
          <div className="flex gap-2 mb-3">
            <input
              value={newAreaName}
              onChange={e => setNewAreaName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addArea()}
              placeholder="Area name (e.g. Work, Health, Family)"
              autoFocus
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
            {AREA_COLORS.map(c => (
              <button key={c} onClick={() => setNewAreaColor(c)} className={`w-5 h-5 rounded-full ${newAreaColor === c ? 'ring-2 ring-offset-1 ring-violet-500 scale-125' : ''}`} style={{ background: c }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addArea} className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700">Create</button>
            <button onClick={() => setShowNewArea(false)} className="px-3 py-1.5 text-sm text-slate-500 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {store.projects.length === 0 && store.areas.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No projects yet. Create one to organize your tasks.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Projects not in any area */}
          {noAreaProjects.length > 0 && (
            <div className="space-y-2">
              {noAreaProjects.map(renderProject)}
            </div>
          )}

          {/* Projects grouped by area */}
          {areaProjects.map(({ area, projects }) => (
            <div key={area.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: area.color }} />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{area.name}</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="space-y-2 pl-3">
                {projects.map(renderProject)}
              </div>
            </div>
          ))}

          {/* Areas with no projects */}
          {store.areas.filter(a => !areaProjects.find(g => g.area.id === a.id)).map(area => (
            <div key={area.id} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: area.color }} />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{area.name}</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              <span className="text-xs text-slate-400">no projects</span>
            </div>
          ))}
        </div>
      )}

      {editTask && (
        <TaskEditPanel
          task={editTask}
          store={store}
          onSave={(id, changes) => onUpdate(updateTask(store, id, changes))}
          onClose={() => setEditTask(null)}
          onComplete={id => onUpdate(completeTask(store, id))}
          onDrop={id => onUpdate(dropTask(store, id))}
          onDelete={id => onUpdate(deleteTask(store, id))}
        />
      )}
    </div>
  );
}

// ── Waiting For View ──────────────────────────────────────────────────────────

function WaitingForView({ store, onUpdate }: { store: TaskStore; onUpdate: (s: TaskStore) => void }) {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const tasks = getWaitingForTasks(store);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <UserCheck size={20} className="text-purple-500" /> Waiting For
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Tasks delegated or blocked on someone/something else.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <UserCheck size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nothing waiting. Edit a task and set "Waiting for" to track it here.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.map(t => (
            <TaskRow
              key={t.id}
              task={t}
              store={store}
              onComplete={id => onUpdate(completeTask(store, id))}
              onDrop={id => onUpdate(dropTask(store, id))}
              onEdit={setEditTask}
              onDelete={id => onUpdate(deleteTask(store, id))}
              showProject
            />
          ))}
        </div>
      )}

      {editTask && (
        <TaskEditPanel
          task={editTask}
          store={store}
          onSave={(id, changes) => onUpdate(updateTask(store, id, changes))}
          onClose={() => setEditTask(null)}
          onComplete={id => onUpdate(completeTask(store, id))}
          onDrop={id => onUpdate(dropTask(store, id))}
          onDelete={id => onUpdate(deleteTask(store, id))}
        />
      )}
    </div>
  );
}

// ── Someday View ──────────────────────────────────────────────────────────────

function SomedayView({ store, onUpdate }: { store: TaskStore; onUpdate: (s: TaskStore) => void }) {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const tasks = getSomedayTasks(store);

  const addTask = (title: string) => {
    onUpdate(createTask(store, { title, isInbox: false, priority: 'someday' }));
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Archive size={20} className="text-slate-400" /> Someday / Maybe
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Ideas and tasks you don't want to lose but won't act on soon.</p>
      </div>

      <QuickCapture onAdd={addTask} />

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Archive size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Parking lot is empty.</p>
          <p className="text-xs mt-1">Capture low-priority ideas here to keep your inbox clean.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.map(t => (
            <TaskRow
              key={t.id}
              task={t}
              store={store}
              onComplete={id => onUpdate(completeTask(store, id))}
              onDrop={id => onUpdate(dropTask(store, id))}
              onEdit={setEditTask}
              onDelete={id => onUpdate(deleteTask(store, id))}
              showProject
            />
          ))}
        </div>
      )}

      {editTask && (
        <TaskEditPanel
          task={editTask}
          store={store}
          onSave={(id, changes) => onUpdate(updateTask(store, id, changes))}
          onClose={() => setEditTask(null)}
          onComplete={id => onUpdate(completeTask(store, id))}
          onDrop={id => onUpdate(dropTask(store, id))}
          onDelete={id => onUpdate(deleteTask(store, id))}
        />
      )}
    </div>
  );
}

// ── Weekly Review View ────────────────────────────────────────────────────────

function WeeklyReviewView({ store, onUpdate }: { store: TaskStore; onUpdate: (s: TaskStore) => void }) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const stats = getWeeklyReviewStats(store);

  const saveReview = () => {
    const review = {
      id: `wr-${Date.now()}`,
      weekStart: stats.weekStart,
      completedCount: stats.completedThisWeek.length,
      droppedCount: store.tasks.filter(t => t.status === 'dropped').length,
      note,
      createdAt: new Date().toISOString(),
    };
    onUpdate({ ...store, weeklyReviews: [...store.weeklyReviews, review] });
    setSaved(true);
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <ClipboardCheck size={20} className="text-emerald-500" /> Weekly Review
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Week of {new Date(stats.weekStart + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Completed', value: stats.completedThisWeek.length, color: 'emerald' },
          { label: 'Inbox items', value: stats.inboxCount, color: 'indigo' },
          { label: 'Slipping', value: stats.slippingTasks.length, color: 'red' },
          { label: 'Waiting', value: stats.waitingCount, color: 'purple' },
        ].map(stat => (
          <div key={stat.label} className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 border border-${stat.color}-100 dark:border-${stat.color}-800`}>
            <p className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Completed this week */}
      {stats.completedThisWeek.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500" /> Completed this week
          </h3>
          <div className="space-y-1">
            {stats.completedThisWeek.map(t => (
              <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-400 line-through">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slipping tasks */}
      {stats.slippingTasks.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-500" /> Kept slipping — decide what to do
          </h3>
          <div className="space-y-1">
            {stats.slippingTasks.map(t => (
              <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/10">
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{t.title}</span>
                <span className="text-xs text-red-400">{overdueAgeDays(t)}d overdue</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review note */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Weekly note (optional)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="What went well? What kept slipping? Any patterns?"
          rows={4}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      {saved ? (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle2 size={16} /> Review saved.
        </div>
      ) : (
        <button
          onClick={saveReview}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium"
        >
          Save Review
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TaskPlanner() {
  const [store, setStore] = useState<TaskStore>({ tasks: [], projects: [], areas: [], weeklyReviews: [] });
  const [view, setView] = useState<View>('inbox');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStore(loadTaskStore());
    setLoaded(true);
    return onTaskStoreUpdate(() => setStore(loadTaskStore()));
  }, []);

  const handleUpdate = useCallback((newStore: TaskStore) => {
    setStore(newStore);
    saveTaskStore(newStore);
  }, []);

  const inboxCount = loaded ? getInboxTasks(store).length : 0;
  const todayOverdueCount = loaded ? getTodayTasks(store).length + getOverdueTasks(store).length : 0;
  const waitingCount = loaded ? getWaitingForTasks(store).length : 0;

  const navItems: { id: View; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox size={16} />, badge: inboxCount },
    { id: 'today', label: 'Today', icon: <Sun size={16} />, badge: todayOverdueCount },
    { id: 'upcoming', label: 'Upcoming', icon: <CalendarDays size={16} /> },
    { id: 'projects', label: 'Projects', icon: <FolderOpen size={16} /> },
    { id: 'waiting', label: 'Waiting', icon: <UserCheck size={16} />, badge: waitingCount },
    { id: 'someday', label: 'Someday', icon: <Archive size={16} /> },
    { id: 'weekly-review', label: 'Weekly Review', icon: <ClipboardCheck size={16} /> },
  ];

  if (!loaded) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        title="Task Planner"
        subtitle="Capture everything. Organize clearly. Get things done."
        icon={<ClipboardCheck size={20} className="text-white" />}
        color="bg-gradient-to-r from-indigo-600 to-violet-600"
      />

      <div className="w-full px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Sidebar Nav */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-0.5 sticky top-6">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    view === item.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      view === item.id
                        ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
            {view === 'inbox' && <InboxView store={store} onUpdate={handleUpdate} />}
            {view === 'today' && <TodayView store={store} onUpdate={handleUpdate} />}
            {view === 'upcoming' && <UpcomingView store={store} onUpdate={handleUpdate} />}
            {view === 'projects' && <ProjectsView store={store} onUpdate={handleUpdate} />}
            {view === 'waiting' && <WaitingForView store={store} onUpdate={handleUpdate} />}
            {view === 'someday' && <SomedayView store={store} onUpdate={handleUpdate} />}
            {view === 'weekly-review' && <WeeklyReviewView store={store} onUpdate={handleUpdate} />}
          </div>
        </div>
      </div>
    </div>
  );
}
