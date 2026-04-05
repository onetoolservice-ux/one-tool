/**
 * Task Planner Store — GTD-lite system
 * Inbox → Clarify → Organize (Projects/Areas) → Do
 * Local-first: all data in localStorage
 */

const STORAGE_KEY = 'otsd-task-planner';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TaskPriority = 'high' | 'normal' | 'someday';
export type TaskStatus = 'todo' | 'inprogress' | 'done' | 'dropped';

export interface Task {
  id: string;
  title: string;
  notes: string;
  projectId: string | null;   // null = no project
  areaId: string | null;      // null = no area
  priority: TaskPriority;
  status: TaskStatus;
  isInbox: boolean;           // true = not yet processed/organized
  isToday: boolean;           // explicitly committed to today
  scheduledDate: string | null; // YYYY-MM-DD: when you plan to work on it
  deadline: string | null;      // YYYY-MM-DD: actual hard due date
  waitingFor: string | null;    // person/thing you're waiting on
  tags: string[];
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  areaId: string | null;
  color: string;
  isSomeday: boolean;         // true = Someday/Maybe project
  createdAt: string;
}

export interface Area {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface WeeklyReviewEntry {
  id: string;
  weekStart: string;          // YYYY-MM-DD (Monday)
  completedCount: number;
  droppedCount: number;
  note: string;
  createdAt: string;
}

export interface TaskStore {
  tasks: Task[];
  projects: Project[];
  areas: Area[];
  weeklyReviews: WeeklyReviewEntry[];
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_AREAS: Area[] = [
  { id: 'area-work', name: 'Work', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: 'area-personal', name: 'Personal', color: '#10b981', createdAt: new Date().toISOString() },
  { id: 'area-health', name: 'Health', color: '#f59e0b', createdAt: new Date().toISOString() },
];

function emptyStore(): TaskStore {
  return { tasks: [], projects: [], areas: DEFAULT_AREAS, weeklyReviews: [] };
}

// ── Persistence ───────────────────────────────────────────────────────────────

export function loadTaskStore(): TaskStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<TaskStore>;
    return {
      tasks: parsed.tasks ?? [],
      projects: parsed.projects ?? [],
      areas: parsed.areas?.length ? parsed.areas : DEFAULT_AREAS,
      weeklyReviews: parsed.weeklyReviews ?? [],
    };
  } catch {
    return emptyStore();
  }
}

export function saveTaskStore(store: TaskStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event('otsd-task-store-updated'));
  } catch { /* storage full */ }
}

export function onTaskStoreUpdate(cb: () => void): () => void {
  window.addEventListener('otsd-task-store-updated', cb);
  return () => window.removeEventListener('otsd-task-store-updated', cb);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function uid(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function isOverdue(task: Task): boolean {
  if (task.status === 'done' || task.status === 'dropped') return false;
  const ref = task.deadline ?? task.scheduledDate;
  if (!ref) return false;
  return ref < todayStr();
}

export function overdueAgeDays(task: Task): number {
  const ref = task.deadline ?? task.scheduledDate;
  if (!ref) return 0;
  return daysBetween(ref, todayStr());
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function createTask(store: TaskStore, partial: Partial<Task>): TaskStore {
  const now = new Date().toISOString();
  const task: Task = {
    id: uid(),
    title: '',
    notes: '',
    projectId: null,
    areaId: null,
    priority: 'normal',
    status: 'todo',
    isInbox: true,
    isToday: false,
    scheduledDate: null,
    deadline: null,
    waitingFor: null,
    tags: [],
    createdAt: now,
    completedAt: null,
    updatedAt: now,
    ...partial,
  };
  return { ...store, tasks: [task, ...store.tasks] };
}

export function updateTask(store: TaskStore, id: string, changes: Partial<Task>): TaskStore {
  return {
    ...store,
    tasks: store.tasks.map(t =>
      t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t
    ),
  };
}

export function completeTask(store: TaskStore, id: string): TaskStore {
  return updateTask(store, id, {
    status: 'done',
    completedAt: new Date().toISOString(),
    isToday: false,
  });
}

export function dropTask(store: TaskStore, id: string): TaskStore {
  return updateTask(store, id, { status: 'dropped' });
}

export function deleteTask(store: TaskStore, id: string): TaskStore {
  return { ...store, tasks: store.tasks.filter(t => t.id !== id) };
}

export function rescheduleTask(store: TaskStore, id: string, date: string | null): TaskStore {
  return updateTask(store, id, { scheduledDate: date, status: 'todo' });
}

export function processInboxTask(
  store: TaskStore,
  id: string,
  changes: Partial<Task>
): TaskStore {
  return updateTask(store, id, { ...changes, isInbox: false });
}

// ── Project / Area CRUD ───────────────────────────────────────────────────────

export function createProject(store: TaskStore, partial: Partial<Project>): TaskStore {
  const project: Project = {
    id: uid(),
    name: '',
    areaId: null,
    color: '#6366f1',
    isSomeday: false,
    createdAt: new Date().toISOString(),
    ...partial,
  };
  return { ...store, projects: [...store.projects, project] };
}

export function deleteProject(store: TaskStore, id: string): TaskStore {
  return {
    ...store,
    projects: store.projects.filter(p => p.id !== id),
    tasks: store.tasks.map(t => t.projectId === id ? { ...t, projectId: null } : t),
  };
}

export function createArea(store: TaskStore, partial: Partial<Area>): TaskStore {
  const area: Area = {
    id: uid(),
    name: '',
    color: '#64748b',
    createdAt: new Date().toISOString(),
    ...partial,
  };
  return { ...store, areas: [...store.areas, area] };
}

// ── Derived Views ─────────────────────────────────────────────────────────────

export function getInboxTasks(store: TaskStore): Task[] {
  return store.tasks.filter(t => t.isInbox && t.status !== 'done' && t.status !== 'dropped');
}

export function getTodayTasks(store: TaskStore): Task[] {
  const today = todayStr();
  return store.tasks.filter(t => {
    if (t.status === 'done' || t.status === 'dropped' || t.isInbox) return false;
    return t.isToday || t.scheduledDate === today || (t.deadline === today);
  });
}

export function getOverdueTasks(store: TaskStore): Task[] {
  return store.tasks.filter(t => !t.isInbox && isOverdue(t));
}

export function getUpcomingTasks(store: TaskStore): Task[] {
  const today = todayStr();
  const in14 = new Date();
  in14.setDate(in14.getDate() + 14);
  const limit = in14.toISOString().split('T')[0];
  return store.tasks.filter(t => {
    if (t.status === 'done' || t.status === 'dropped' || t.isInbox) return false;
    const ref = t.scheduledDate ?? t.deadline;
    if (!ref) return false;
    return ref > today && ref <= limit;
  });
}

export function getWaitingForTasks(store: TaskStore): Task[] {
  return store.tasks.filter(t =>
    t.waitingFor && t.status !== 'done' && t.status !== 'dropped'
  );
}

export function getProjectTasks(store: TaskStore, projectId: string): Task[] {
  return store.tasks.filter(t =>
    t.projectId === projectId && t.status !== 'done' && t.status !== 'dropped'
  );
}

export function getSomedayTasks(store: TaskStore): Task[] {
  return store.tasks.filter(t =>
    t.priority === 'someday' && !t.isInbox && t.status !== 'done' && t.status !== 'dropped'
  );
}

// ── Weekly Review ─────────────────────────────────────────────────────────────

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function getWeeklyReviewStats(store: TaskStore) {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const completedThisWeek = store.tasks.filter(t =>
    t.completedAt && t.completedAt >= weekStart && t.completedAt < weekEndStr
  );

  const slippingTasks = store.tasks.filter(t => {
    if (t.status === 'done' || t.status === 'dropped' || t.isInbox) return false;
    if (!t.scheduledDate && !t.deadline) return false;
    const ref = t.deadline ?? t.scheduledDate!;
    return ref < weekEndStr && overdueAgeDays(t) >= 3;
  });

  return {
    weekStart,
    completedThisWeek,
    slippingTasks,
    inboxCount: getInboxTasks(store).length,
    waitingCount: getWaitingForTasks(store).length,
  };
}
