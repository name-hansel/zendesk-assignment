export type ApiUser = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: "AGENT" | "CUSTOMER";
};

export type ApiTicket = {
  id: string;
  subject: string;
  description: string;
  customer: ApiUser;
  agent: ApiUser | null;
  status: "OPEN" | "PENDING" | "SOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

export type CreateApiTicketRequest = {
  subject: string;
  description: string;
  customerId?: string;
  customer?: {
    name: string;
    email: string;
    phoneNumber: string | null;
  };
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export class TicketApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "TicketApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.text();
    throw new TicketApiError(readErrorMessage(body, response.status), response.status);
  }

  return response.json() as Promise<T>;
}

function readErrorMessage(body: string, status: number): string {
  if (body) {
    try {
      const payload: unknown = JSON.parse(body);
      if (payload && typeof payload === "object" && "message" in payload) {
        const message = payload.message;
        if (typeof message === "string" && message.trim()) return message;
      }
    } catch {
      return body;
    }

    return body;
  }

  return `Ticket request failed with status ${status}.`;
}

export async function listTickets(): Promise<ApiTicket[]> {
  const tickets = await request<ApiTicket[]>("/api/tickets");
  if (!Array.isArray(tickets)) {
    throw new TicketApiError("The tickets endpoint returned an invalid response.");
  }
  return tickets;
}

export async function listAgents(): Promise<ApiUser[]> {
  const users = await request<ApiUser[]>("/api/users?role=AGENT");
  if (!Array.isArray(users)) {
    throw new TicketApiError("The users endpoint returned an invalid response.");
  }
  return users.filter((user) => user.role === "AGENT");
}

export function getTicket(id: string): Promise<ApiTicket> {
  return request<ApiTicket>(`/api/tickets/${encodeURIComponent(id)}`);
}

export function createTicket(requestBody: CreateApiTicketRequest): Promise<ApiTicket> {
  return request<ApiTicket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}
