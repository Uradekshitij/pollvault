const API_BASE = import.meta.env.VITE_BACKEND_URL;

async function jsonResponse(res) {
  const text = await res.text();
  if (!text) return null; // ✅ prevents JSON parse crash
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// CREATE POLL
export async function createPoll(question, options, creatorFingerprint) {
  const res = await fetch(`${API_BASE}/api/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, options, creatorFingerprint }),
  });

  const data = await jsonResponse(res);

  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }

  // normalize Mongo _id → id
  if (data?.poll?._id) {
    data.poll.id = data.poll._id.toString();
  }

  return data;
}

// GET SINGLE POLL
export async function getPoll(id) {
  const res = await fetch(`${API_BASE}/api/polls/${id}`);
  const data = await jsonResponse(res);

  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }

  if (data?.poll?._id) {
    data.poll.id = data.poll._id.toString();
  }

  if (Array.isArray(data?.options)) {
    data.options = data.options.map((o) => ({
      ...o,
      id: o._id ? o._id.toString() : undefined,
    }));
  }

  return data;
}

// GET ALL POLLS
export async function getAllPolls() {
  const res = await fetch(`${API_BASE}/api/polls`);
  const data = await jsonResponse(res);

  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }

  return (data?.polls || []).map((p) => ({
    ...p,
    id: p._id ? p._id.toString() : undefined,
  }));
}

// GET VOTES
export async function getVotes(id) {
  const res = await fetch(`${API_BASE}/api/polls/${id}/votes`);
  const data = await jsonResponse(res);

  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }

  return data;
}

// VOTE
export async function vote(pollId, optionId, fingerprint) {
  const res = await fetch(`${API_BASE}/api/votes/${pollId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      option_id: optionId,
      voter_fingerprint: fingerprint,
    }),
  });

  const data = await jsonResponse(res);

  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }

  return data;
}

// DELETE POLL
export async function deletePoll(id, fingerprint, adminKey) {
  const payload = {};
  if (fingerprint) payload.fingerprint = fingerprint;
  if (adminKey) payload.adminKey = adminKey;

  const res = await fetch(`${API_BASE}/api/polls/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await jsonResponse(res);

  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }

  return data;
}
