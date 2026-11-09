/**
 * Authoritative Time & Anti-Cheat Synchronization Service
 * 
 * Prevents device clock manipulation (advancing date to fake streaks or
 * rewinding date to revive broken streaks or tamper with post timestamps).
 * 
 * Architecture:
 * 1. Network Time Protocol (NTP) / Server HTTP Date Calibration
 * 2. Monotonic High-Water Mark Guard (Anti-Rollback Detection)
 * 3. Authoritative Date/Time Providers used across the entire application
 */

const OFFSET_STORAGE_KEY = 'visulingo_server_offset_ms';
const LAST_TRUSTED_TS_KEY = 'visulingo_last_trusted_ts';
const CLOCK_TAMPERED_EVENT = 'visulingo_clock_tampered';

let serverOffsetMs = 0;
let isTampered = false;

// Initialize offset from localStorage if available
try {
  const savedOffset = localStorage.getItem(OFFSET_STORAGE_KEY);
  if (savedOffset !== null) {
    const parsed = parseInt(savedOffset, 10);
    if (!isNaN(parsed)) {
      serverOffsetMs = parsed;
    }
  }
} catch {
  serverOffsetMs = 0;
}

/**
 * Calibrate local time offset against an authoritative server timestamp (in ms).
 * serverOffset = trueServerTime - localDeviceTime
 */
export function syncServerOffset(serverTimeMs: number): void {
  if (typeof serverTimeMs !== 'number' || isNaN(serverTimeMs) || serverTimeMs <= 0) {
    return;
  }

  const clientNow = Date.now();
  const newOffset = serverTimeMs - clientNow;

  serverOffsetMs = newOffset;
  try {
    localStorage.setItem(OFFSET_STORAGE_KEY, newOffset.toString());
  } catch {}

  // After syncing with server, check and update monotonic record
  validateMonotonicity(serverTimeMs);
}

/**
 * Validate that time moves monotonically forward.
 * If user winds their device clock backwards significantly, detect tampering.
 */
function validateMonotonicity(authoritativeMs: number): boolean {
  try {
    const rawLast = localStorage.getItem(LAST_TRUSTED_TS_KEY);
    const lastTrusted = rawLast !== null ? parseInt(rawLast, 10) : 0;

    // 60-second tolerance for small network latency / NTP server adjustments
    const ROLLBACK_TOLERANCE_MS = 60 * 1000;

    if (lastTrusted > 0 && authoritativeMs < lastTrusted - ROLLBACK_TOLERANCE_MS) {
      if (!isTampered) {
        isTampered = true;
        console.warn(
          `[Anti-Cheat] Cảnh báo: Phát hiện thiết bị lùi thời gian (${new Date(
            authoritativeMs
          ).toLocaleString()} < ${new Date(lastTrusted).toLocaleString()})`
        );
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent(CLOCK_TAMPERED_EVENT, {
              detail: { authoritativeMs, lastTrusted },
            })
          );
        }
      }
      return false;
    }

    // Normal forward progression: update high-water mark
    isTampered = false;
    const updatedHighWater = Math.max(lastTrusted, authoritativeMs);
    localStorage.setItem(LAST_TRUSTED_TS_KEY, updatedHighWater.toString());
    return true;
  } catch {
    return true;
  }
}

/**
 * Returns the authoritative current timestamp in milliseconds (server-calibrated).
 */
export function getAuthoritativeNow(): number {
  const clientNow = Date.now();
  const authoritative = clientNow + serverOffsetMs;
  validateMonotonicity(authoritative);
  return authoritative;
}

/**
 * Returns a Date object representing the authoritative current time.
 */
export function getAuthoritativeDate(): Date {
  return new Date(getAuthoritativeNow());
}

/**
 * Format an authoritative date as YYYY-MM-DD
 */
export function getAuthoritativeDateString(date?: Date): string {
  const targetDate = date || getAuthoritativeDate();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format yesterday's date string based on authoritative time
 */
export function getAuthoritativeYesterdayString(): string {
  const d = getAuthoritativeDate();
  d.setDate(d.getDate() - 1);
  return getAuthoritativeDateString(d);
}

/**
 * Check if device clock tampering/rollback has been detected
 */
export function isClockTampered(): boolean {
  return isTampered;
}

/**
 * Actively fetch authoritative time from the backend server
 */
export async function fetchServerTime(): Promise<number> {
  try {
    const res = await fetch('/api/auth/time');
    if (res.ok) {
      const data = await res.json();
      if (typeof data.timestamp === 'number') {
        syncServerOffset(data.timestamp);
        return data.timestamp;
      }
      if (data.serverTime) {
        const ms = new Date(data.serverTime).getTime();
        syncServerOffset(ms);
        return ms;
      }
    }
  } catch {
    // Fallback: try /health
    try {
      const healthRes = await fetch('/health');
      const dateHeader = healthRes.headers.get('date');
      if (dateHeader) {
        const ms = new Date(dateHeader).getTime();
        if (!isNaN(ms)) {
          syncServerOffset(ms);
          return ms;
        }
      }
    } catch {}
  }
  return getAuthoritativeNow();
}

// Auto-fetch on browser load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchServerTime().catch(() => {});
  }, 500);
}
