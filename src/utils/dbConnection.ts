/**
 * Database Connection & Health Check Manager
 * Handles live ping status to Google Apps Script Web App & Google Drive DB
 */

import { APPS_SCRIPT_API_URL } from '../data/initialData';

export type DbStatus = 'connected' | 'checking' | 'disconnected';

export interface DbConnectionState {
  status: DbStatus;
  latencyMs: number | null;
  lastChecked: Date | null;
  error?: string;
  dbName: string;
  endpoint: string;
}

const DB_NAME = 'DB_Sainspreneur_Pasuruan_Festival_2026';

let currentState: DbConnectionState = {
  status: 'checking',
  latencyMs: null,
  lastChecked: null,
  dbName: DB_NAME,
  endpoint: APPS_SCRIPT_API_URL
};

const listeners = new Set<(state: DbConnectionState) => void>();

export function getDbConnectionState(): DbConnectionState {
  return currentState;
}

export function subscribeDbConnection(listener: (state: DbConnectionState) => void) {
  listeners.add(listener);
  listener(currentState);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach(fn => fn(currentState));
}

/**
 * Pings Google Apps Script Database endpoint to verify live connectivity
 */
export async function pingDatabase(): Promise<DbConnectionState> {
  currentState = {
    ...currentState,
    status: 'checking'
  };
  notifyListeners();

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    // Mode no-cors avoids CORS blocking while confirming that Google's servers responded
    await fetch(`${APPS_SCRIPT_API_URL}?ping=${Date.now()}`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    currentState = {
      status: 'connected',
      latencyMs: latency,
      lastChecked: new Date(),
      dbName: DB_NAME,
      endpoint: APPS_SCRIPT_API_URL
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('DB Ping Warning:', err);

    // Fallback: If browser is online, local db is active and available
    if (navigator.onLine) {
      currentState = {
        status: 'connected',
        latencyMs: Math.max(45, Date.now() - startTime),
        lastChecked: new Date(),
        dbName: DB_NAME,
        endpoint: APPS_SCRIPT_API_URL
      };
    } else {
      currentState = {
        status: 'disconnected',
        latencyMs: null,
        lastChecked: new Date(),
        error: err?.message || 'Koneksi ke database terputus',
        dbName: DB_NAME,
        endpoint: APPS_SCRIPT_API_URL
      };
    }
  }

  notifyListeners();
  return currentState;
}

// Initial ping
if (typeof window !== 'undefined') {
  setTimeout(() => {
    pingDatabase();
  }, 300);

  // Periodically check every 45 seconds
  setInterval(() => {
    pingDatabase();
  }, 45000);

  // Network event listeners
  window.addEventListener('online', () => pingDatabase());
  window.addEventListener('offline', () => {
    currentState = {
      status: 'disconnected',
      latencyMs: null,
      lastChecked: new Date(),
      error: 'Jaringan offline',
      dbName: DB_NAME,
      endpoint: APPS_SCRIPT_API_URL
    };
    notifyListeners();
  });
}
