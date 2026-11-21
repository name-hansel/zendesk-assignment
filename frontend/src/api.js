const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function getJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${path} responded with ${response.status}`);
  }
  return response.json();
}

export const fetchTickets = () => getJson('/api/tickets');
export const fetchUsers = () => getJson('/api/users');
