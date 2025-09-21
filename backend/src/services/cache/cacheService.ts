type UrgencyClassification = "triage" | "red" | "orange" | "yellow" | "green" | "blue";

export interface RealtimeCache {
  current_state: Record<UrgencyClassification, { count: number; avg_time: number }>;
  in_triage: number;
  last_days: Record<string, number>;
  total_people: number;
  last_update: string;
  last10Appointments: { called_at: string }[];
}

let cache: RealtimeCache = {
  current_state: { triage: {count:0, avg_time:0}, red: {count:0, avg_time:0}, orange: {count:0, avg_time:0}, yellow: {count:0, avg_time:0}, green: {count:0, avg_time:0}, blue: {count:0, avg_time:0} },
  in_triage: 0,
  last_days: { Sunday:0, Monday:0, Tuesday:0, Wednesday:0, Thursday:0, Friday:0, Saturday:0 },
  total_people: 0,
  last_update: new Date().toISOString(),
  last10Appointments: []
};

const listeners: ((data: RealtimeCache) => void)[] = [];

export const cacheService = {
  getCache: () => cache,

  updateCache: (partial: Partial<RealtimeCache>) => {
    cache = { ...cache, ...partial };
    listeners.forEach(fn => fn(cache));
  },

  addLastAppointment: () => {
    const now = new Date().toISOString();
    let updated = [...cache.last10Appointments, { called_at: now }];
    if(updated.length > 10) updated = updated.slice(updated.length - 10);
    cacheService.updateCache({ last10Appointments: updated });
  },

  onUpdate: (fn: (data: RealtimeCache) => void) => listeners.push(fn)
};
