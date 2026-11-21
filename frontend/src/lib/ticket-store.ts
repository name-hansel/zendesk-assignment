// Tiny in-memory ticket store shared by the list and ticket views.
// Swap this module for real Zendesk-backed queries when connecting live data.
import { useSyncExternalStore } from "react";
import { CURRENT_AGENT_ID, seedTickets, type Ticket, type TicketComment } from "./tickets";

let state: Ticket[] = seedTickets;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useTickets(): Ticket[] {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => seedTickets,
  );
}

export function updateTicket(id: number, patch: Partial<Omit<Ticket, "id" | "comments">>) {
  state = state.map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
  );
  emit();
}

export function addComment(id: number, body: string, isPublic: boolean) {
  const now = new Date().toISOString();
  const comment: TicketComment = {
    id: `cm-${Date.now()}`,
    authorId: CURRENT_AGENT_ID,
    body,
    public: isPublic,
    createdAt: now,
  };
  state = state.map((t) =>
    t.id === id ? { ...t, comments: [...t.comments, comment], updatedAt: now } : t,
  );
  emit();
}
