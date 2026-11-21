import { useEffect, useSyncExternalStore } from "react";

import {
  createTicket as createTicketRequest,
  getTicket as getTicketRequest,
  listTickets,
  type ApiTicket,
  type ApiUser,
} from "./api/tickets";
import {
  CURRENT_AGENT_ID,
  getPerson,
  people,
  registerPerson,
  seedTickets,
  type NewTicketInput,
  type Person,
  type Ticket,
  type TicketComment,
  type TicketStatus,
} from "./tickets";

export type TicketLoadStatus = "idle" | "loading" | "ready" | "error";

type TicketStoreSnapshot = {
  tickets: Ticket[];
  status: TicketLoadStatus;
  error: string | null;
  hasApiData: boolean;
  usingFallback: boolean;
};

const initialSnapshot: TicketStoreSnapshot = {
  tickets: [],
  status: "idle",
  error: null,
  hasApiData: false,
  usingFallback: false,
};

let snapshot = initialSnapshot;
let pendingLoad: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(nextSnapshot: TicketStoreSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function toPerson(user: ApiUser): Person {
  return {
    id: user.id,
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role === "AGENT" ? "agent" : "end-user",
    phone: user.phoneNumber ?? undefined,
  };
}

function toTicket(record: ApiTicket): Ticket {
  const customer = toPerson(record.customer);
  registerPerson(customer);
  const agent = record.agent ? toPerson(record.agent) : null;
  if (agent) registerPerson(agent);

  const status = toTicketStatus(record.status);
  const comment: TicketComment = {
    id: `${record.id}-description`,
    authorId: customer.id,
    body: record.description,
    public: true,
    createdAt: record.createdAt,
  };

  return {
    id: record.id,
    subject: record.subject,
    status,
    priority: "normal",
    type: "question",
    channel: "web",
    requesterId: customer.id,
    assigneeId: agent?.id ?? null,
    group: "Support",
    tags: [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    comments: [comment],
  };
}

function toTicketStatus(status: ApiTicket["status"]): TicketStatus {
  switch (status) {
    case "OPEN":
      return "open";
    case "PENDING":
      return "pending";
    case "SOLVED":
      return "solved";
    case "CLOSED":
      return "closed";
  }
}

export function loadTickets(): Promise<void> {
  if (pendingLoad) return pendingLoad;

  emit({ ...snapshot, status: "loading", error: null });
  pendingLoad = listTickets()
    .then((records) => {
      const loadedTickets = records.map(toTicket);
      const loadedIds = new Set(loadedTickets.map((ticket) => ticket.id));
      const localTickets = snapshot.usingFallback
        ? []
        : snapshot.tickets.filter((ticket) => !loadedIds.has(ticket.id));
      emit({
        tickets: [...localTickets, ...loadedTickets],
        status: "ready",
        error: null,
        hasApiData: true,
        usingFallback: false,
      });
    })
    .catch((error: unknown) => {
      const usingFallback = !snapshot.hasApiData;
      emit({
        ...snapshot,
        tickets: usingFallback ? seedTickets : snapshot.tickets,
        status: "error",
        error: error instanceof Error ? error.message : "Unable to load tickets.",
        usingFallback,
      });
    })
    .finally(() => {
      pendingLoad = null;
    });

  return pendingLoad;
}

export async function loadTicket(id: string): Promise<Ticket> {
  const ticket = toTicket(await getTicketRequest(id));
  emit({
    ...snapshot,
    tickets: [ticket, ...snapshot.tickets.filter((existing) => existing.id !== ticket.id)],
  });
  return ticket;
}

export function useTicketStore() {
  const current = useSyncExternalStore(subscribe, () => snapshot, () => initialSnapshot);

  useEffect(() => {
    if (current.status === "idle") void loadTickets();
  }, [current.status]);

  return { ...current, reloadTickets: loadTickets };
}

export function updateTicket(id: Ticket["id"], patch: Partial<Omit<Ticket, "id" | "comments">>) {
  const tickets = snapshot.tickets.map((ticket) =>
    ticket.id === id ? { ...ticket, ...patch, updatedAt: new Date().toISOString() } : ticket,
  );
  emit({ ...snapshot, tickets });
}

export function addComment(id: Ticket["id"], body: string, isPublic: boolean) {
  const now = new Date().toISOString();
  const comment: TicketComment = {
    id: `cm-${Date.now()}`,
    authorId: CURRENT_AGENT_ID,
    body,
    public: isPublic,
    createdAt: now,
  };
  const tickets = snapshot.tickets.map((ticket) =>
    ticket.id === id
      ? { ...ticket, comments: [...ticket.comments, comment], updatedAt: now }
      : ticket,
  );
  emit({ ...snapshot, tickets });
}

export async function createTicket(input: NewTicketInput): Promise<Ticket> {
  const requester = getPerson(input.requesterId);
  if (!requester) throw new Error("The selected requester could not be found.");

  const existingCustomer = people.find(
    (person) =>
      person.role === "end-user" &&
      person.email.toLowerCase() === requester.email.toLowerCase() &&
      person.userId,
  );
  const customerId = existingCustomer?.userId;
  const request = {
    subject: input.subject.trim(),
    description: input.description.trim(),
    ...(customerId
      ? { customerId }
      : {
          customer: {
            name: requester.name,
            email: requester.email,
            phoneNumber: requester.phone ?? null,
          },
        }),
  };

  const ticket = toTicket(await createTicketRequest(request));
  const existingTickets = snapshot.usingFallback ? [] : snapshot.tickets;
  emit({
    ...snapshot,
    tickets: [ticket, ...existingTickets.filter((existing) => existing.id !== ticket.id)],
    status: "ready",
    error: null,
    hasApiData: true,
    usingFallback: false,
  });
  return ticket;
}
