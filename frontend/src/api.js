const API_BASE = import.meta.env.VITE_API_BASE || "";

async function jsonResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function createPoll(question, options, creatorFingerprint) {
  const res = await fetch(`${API_BASE}/api/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, options, creatorFingerprint }),
  });
  if (!res.ok) throw new Error((await jsonResponse(res))?.error || res.statusText);
  const data = await res.json();
  // normalize Mongo _id to id for convenience
  if (data.poll && data.poll._id) {
    data.poll.id = data.poll._id.toString();
  }
  return data;
}

export async function getPoll(id) {
  const res = await fetch(`${API_BASE}/api/polls/${id}`);
  if (!res.ok) throw new Error((await jsonResponse(res))?.error || res.statusText);
  const data = await res.json();
  if (data.poll && data.poll._id) {
    data.poll.id = data.poll._id.toString();
  }
  if (data.options && Array.isArray(data.options)) {
    data.options = data.options.map((o) => ({
      ...o,
      id: o._id ? o._id.toString() : undefined,
    }));
  }
  return data;
}

// fetch list of all polls (home page)
export async function getAllPolls() {
  const res = await fetch(`${API_BASE}/api/polls`);
  if (!res.ok) throw new Error((await jsonResponse(res))?.error || res.statusText);
  const { polls } = await res.json();
  return polls.map(p => ({
    ...p,
    id: p._id ? p._id.toString() : undefined,
  }));
}

export async function getVotes(id) {
  const res = await fetch(`${API_BASE}/api/polls/${id}/votes`);
  if (!res.ok) throw new Error((await jsonResponse(res))?.error || res.statusText);
  return res.json();
}

export async function vote(pollId, optionId, fingerprint) {
  const res = await fetch(`${API_BASE}/api/votes/${pollId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option_id: optionId, voter_fingerprint: fingerprint }),
  });
  if (!res.ok) throw new Error((await jsonResponse(res))?.error || res.statusText);
  return res.json();
}

export async function deletePoll(id, fingerprint, adminKey) {
  const payload = {};
  if (fingerprint) payload.fingerprint = fingerprint;
  if (adminKey) payload.adminKey = adminKey;
  const res = await fetch(`${API_BASE}/api/polls/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await jsonResponse(res))?.error || res.statusText);
  return res.json();
}
