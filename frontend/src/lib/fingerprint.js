// Anti-abuse mechanism #1: Browser fingerprint
// Generates a simple but effective fingerprint from browser properties
// This prevents voting multiple times from the same browser
export function generateFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown',
  ];
  
  const raw = components.join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Anti-abuse mechanism #2: localStorage tracking
// Stores voted poll IDs to prevent re-voting even if fingerprint changes slightly
const VOTED_KEY = 'pollvault_voted';

export function hasVotedLocally(pollId) {
  try {
    const voted = JSON.parse(localStorage.getItem(VOTED_KEY) || '{}');
    return !!voted[pollId];
  } catch {
    return false;
  }
}

export function markVotedLocally(pollId) {
  try {
    const voted = JSON.parse(localStorage.getItem(VOTED_KEY) || '{}');
    voted[pollId] = Date.now();
    localStorage.setItem(VOTED_KEY, JSON.stringify(voted));
  } catch {
    // Ignore storage errors
  }
}
