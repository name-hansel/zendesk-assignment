// Ticket domain model + sample data. Shapes mirror the Zendesk Ticketing API
// (status/priority/type values) so a live data source can replace the seed later.

export type TicketStatus = "new" | "open" | "pending" | "hold" | "solved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketType = "question" | "incident" | "problem" | "task";
export type Channel = "email" | "whatsapp" | "chat" | "web" | "phone";

export interface Person {
  id: string;
  name: string;
  email: string;
  role: "agent" | "end-user";
  phone?: string;
  tags?: string[];
  organization?: string;
}

export interface TicketComment {
  id: string;
  authorId: string;
  body: string;
  public: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  channel: Channel;
  requesterId: string;
  assigneeId: string | null;
  group: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
}

export const CURRENT_AGENT_ID = "u-alex";

export const people: Person[] = [
  { id: "u-alex", name: "Alex Knapp", email: "alex@minidesk.io", role: "agent" },
  { id: "u-priya", name: "Priya Shah", email: "priya@minidesk.io", role: "agent" },
  { id: "u-marco", name: "Marco Rossi", email: "marco@minidesk.io", role: "agent" },
  {
    id: "c-riley",
    name: "Riley Green",
    email: "rgreen@work.com",
    phone: "+1 (415) 123-4567",
    role: "end-user",
    tags: ["premium", "priority shopping"],
    organization: "Green & Co.",
  },
  { id: "c-jordan", name: "Jordan Lee", email: "jordan.lee@mail.com", role: "end-user", tags: ["new customer"] },
  { id: "c-sam", name: "Sam Carter", email: "sam@carterdesign.co", phone: "+44 20 7946 0958", role: "end-user", organization: "Carter Design" },
  { id: "c-mia", name: "Mia Chen", email: "mia.chen@outlook.com", role: "end-user", tags: ["vip"] },
  { id: "c-daniel", name: "Daniel Okafor", email: "d.okafor@fastmail.com", role: "end-user" },
  { id: "c-hannah", name: "Hannah Weber", email: "hannah@weber.de", phone: "+49 30 901820", role: "end-user", tags: ["wholesale"], organization: "Weber GmbH" },
  { id: "c-luis", name: "Luis Ortega", email: "luis.ortega@gmail.com", role: "end-user" },
  { id: "c-aisha", name: "Aisha Khan", email: "aisha.k@protonmail.com", role: "end-user", tags: ["premium"] },
];

export const agents = people.filter((p) => p.role === "agent");
export const groups = ["Support", "Billing", "Shipping"] as const;

export function getPerson(id: string | null | undefined): Person | undefined {
  if (!id) return undefined;
  return people.find((p) => p.id === id);
}

let commentSeq = 0;
const c = (authorId: string, body: string, createdAt: string, isPublic = true): TicketComment => ({
  id: `cm-${++commentSeq}`,
  authorId,
  body,
  public: isPublic,
  createdAt,
});

export const seedTickets: Ticket[] = [
  {
    id: 1201,
    subject: "Conversation with Riley Green",
    status: "open",
    priority: "normal",
    type: "problem",
    channel: "whatsapp",
    requesterId: "c-riley",
    assigneeId: "u-alex",
    group: "Support",
    tags: ["vip", "order", "delivery"],
    createdAt: "2026-11-21T06:40:00Z",
    updatedAt: "2026-11-21T07:12:00Z",
    comments: [
      c("c-riley", "Hi! My order #48213 says delivered but I can't find it anywhere.", "2026-11-21T06:40:00Z"),
      c("u-alex", "Sorry about that, Riley. I've checked with the courier — it was left at the side door. Could you take a look?", "2026-11-21T06:52:00Z"),
      c("u-alex", "Courier confirmed drop-off photo. Customer is premium — offer a discount code if still missing.", "2026-11-21T06:53:00Z", false),
      c("c-riley", "Found it, thank you! Could you send me an email receipt for my records?", "2026-11-21T07:12:00Z"),
    ],
  },
  {
    id: 1202,
    subject: "Charged twice for my annual subscription",
    status: "new",
    priority: "urgent",
    type: "incident",
    channel: "email",
    requesterId: "c-mia",
    assigneeId: null,
    group: "Billing",
    tags: ["billing", "refund"],
    createdAt: "2026-11-21T05:58:00Z",
    updatedAt: "2026-11-21T05:58:00Z",
    comments: [
      c("c-mia", "Hello,\n\nI was charged $240 twice this morning for the annual plan. Please refund the duplicate charge as soon as possible.\n\nThanks,\nMia", "2026-11-21T05:58:00Z"),
    ],
  },
  {
    id: 1203,
    subject: "How do I change the shipping address on an order?",
    status: "pending",
    priority: "low",
    type: "question",
    channel: "chat",
    requesterId: "c-jordan",
    assigneeId: "u-alex",
    group: "Shipping",
    tags: ["address-change"],
    createdAt: "2026-11-20T16:20:00Z",
    updatedAt: "2026-11-20T16:45:00Z",
    comments: [
      c("c-jordan", "I moved last week — can I still change where my order ships?", "2026-11-20T16:20:00Z"),
      c("u-alex", "Absolutely! Please reply with the new address and I'll update it before it leaves the warehouse.", "2026-11-20T16:45:00Z"),
    ],
  },
  {
    id: 1204,
    subject: "Bulk pricing for 500+ units",
    status: "open",
    priority: "high",
    type: "question",
    channel: "web",
    requesterId: "c-hannah",
    assigneeId: "u-priya",
    group: "Billing",
    tags: ["wholesale", "sales-lead"],
    createdAt: "2026-11-20T10:05:00Z",
    updatedAt: "2026-11-21T04:30:00Z",
    comments: [
      c("c-hannah", "We'd like a quote for 500–800 units per quarter. Do you offer tiered pricing?", "2026-11-20T10:05:00Z"),
      c("u-priya", "Looping in sales for a custom quote.", "2026-11-21T04:30:00Z", false),
    ],
  },
  {
    id: 1205,
    subject: "App crashes when uploading a photo",
    status: "open",
    priority: "high",
    type: "incident",
    channel: "email",
    requesterId: "c-daniel",
    assigneeId: "u-alex",
    group: "Support",
    tags: ["bug", "ios"],
    createdAt: "2026-11-19T21:14:00Z",
    updatedAt: "2026-11-21T03:02:00Z",
    comments: [
      c("c-daniel", "Every time I try to attach a photo to my profile on iOS 19, the app closes.", "2026-11-19T21:14:00Z"),
      c("u-alex", "Thanks Daniel — which app version are you on? You can find it under Settings → About.", "2026-11-20T08:10:00Z"),
      c("c-daniel", "Version 4.12.1", "2026-11-21T03:02:00Z"),
    ],
  },
  {
    id: 1206,
    subject: "Missing item in my package",
    status: "hold",
    priority: "normal",
    type: "problem",
    channel: "phone",
    requesterId: "c-luis",
    assigneeId: "u-marco",
    group: "Shipping",
    tags: ["warehouse"],
    createdAt: "2026-11-18T14:30:00Z",
    updatedAt: "2026-11-20T11:00:00Z",
    comments: [
      c("c-luis", "Called in: package arrived with only 2 of 3 items.", "2026-11-18T14:30:00Z"),
      c("u-marco", "Waiting on warehouse to confirm packing record.", "2026-11-20T11:00:00Z", false),
    ],
  },
  {
    id: 1207,
    subject: "Can I upgrade my plan mid-cycle?",
    status: "solved",
    priority: "low",
    type: "question",
    channel: "chat",
    requesterId: "c-sam",
    assigneeId: "u-alex",
    group: "Billing",
    tags: ["plans"],
    createdAt: "2026-11-17T09:00:00Z",
    updatedAt: "2026-11-17T09:25:00Z",
    comments: [
      c("c-sam", "If I upgrade today, do I pay the full price?", "2026-11-17T09:00:00Z"),
      c("u-alex", "You'll only pay the prorated difference for the rest of this cycle.", "2026-11-17T09:20:00Z"),
      c("c-sam", "Perfect, thanks!", "2026-11-17T09:25:00Z"),
    ],
  },
  {
    id: 1208,
    subject: "Password reset email never arrives",
    status: "new",
    priority: "normal",
    type: "problem",
    channel: "web",
    requesterId: "c-aisha",
    assigneeId: null,
    group: "Support",
    tags: ["login"],
    createdAt: "2026-11-21T07:01:00Z",
    updatedAt: "2026-11-21T07:01:00Z",
    comments: [
      c("c-aisha", "I've requested a password reset three times but nothing shows up, not even in spam.", "2026-11-21T07:01:00Z"),
    ],
  },
  {
    id: 1209,
    subject: "Question about sizes",
    status: "pending",
    priority: "normal",
    type: "question",
    channel: "chat",
    requesterId: "c-riley",
    assigneeId: "u-priya",
    group: "Support",
    tags: ["sizing"],
    createdAt: "2026-11-15T09:43:00Z",
    updatedAt: "2026-11-15T10:02:00Z",
    comments: [
      c("c-riley", "Do your jackets run small? I'm usually a medium.", "2026-11-15T09:43:00Z"),
      c("u-priya", "They run true to size — medium should be perfect. Want me to send the size chart?", "2026-11-15T10:02:00Z"),
    ],
  },
  {
    id: 1210,
    subject: "Invoice needs our VAT number",
    status: "closed",
    priority: "low",
    type: "task",
    channel: "email",
    requesterId: "c-hannah",
    assigneeId: "u-priya",
    group: "Billing",
    tags: ["invoice"],
    createdAt: "2026-11-10T12:00:00Z",
    updatedAt: "2026-11-12T08:00:00Z",
    comments: [
      c("c-hannah", "Please reissue invoice INV-2209 with VAT ID DE123456789.", "2026-11-10T12:00:00Z"),
      c("u-priya", "Done — the updated invoice is attached.", "2026-11-11T09:00:00Z"),
    ],
  },
  {
    id: 1211,
    subject: "Return label not working",
    status: "open",
    priority: "urgent",
    type: "incident",
    channel: "whatsapp",
    requesterId: "c-jordan",
    assigneeId: null,
    group: "Shipping",
    tags: ["returns"],
    createdAt: "2026-11-21T06:15:00Z",
    updatedAt: "2026-11-21T06:15:00Z",
    comments: [
      c("c-jordan", "The return label link says 'expired'. My return window closes tomorrow!", "2026-11-21T06:15:00Z"),
    ],
  },
];

export const UNSOLVED_STATUSES: TicketStatus[] = ["new", "open", "pending", "hold"];
export const isUnsolved = (t: Ticket) => UNSOLVED_STATUSES.includes(t.status);

export const ticketViews = [
  { id: "your-unsolved", label: "Your unsolved tickets" },
  { id: "unassigned", label: "Unassigned tickets" },
  { id: "all-unsolved", label: "All unsolved tickets" },
  { id: "recently-updated", label: "Recently updated tickets" },
  { id: "pending", label: "Pending tickets" },
  { id: "solved", label: "Recently solved tickets" },
] as const;

export type ViewId = (typeof ticketViews)[number]["id"];

export function isViewId(value: unknown): value is ViewId {
  return ticketViews.some((v) => v.id === value);
}

const byUpdatedDesc = (a: Ticket, b: Ticket) => b.updatedAt.localeCompare(a.updatedAt);

export function ticketsForView(tickets: Ticket[], view: ViewId, agentId = CURRENT_AGENT_ID): Ticket[] {
  const filtered = tickets.filter((t) => {
    switch (view) {
      case "your-unsolved":
        return t.assigneeId === agentId && isUnsolved(t);
      case "unassigned":
        return t.assigneeId === null && isUnsolved(t);
      case "all-unsolved":
        return isUnsolved(t);
      case "recently-updated":
        return true;
      case "pending":
        return t.status === "pending";
      case "solved":
        return t.status === "solved" || t.status === "closed";
    }
  });
  return filtered.sort(byUpdatedDesc);
}

export function searchTickets(tickets: Ticket[], query: string): Ticket[] {
  const q = query.trim().toLowerCase();
  if (!q) return tickets;
  return tickets.filter((t) => {
    const requester = getPerson(t.requesterId);
    return (
      t.subject.toLowerCase().includes(q) ||
      String(t.id).includes(q) ||
      (requester?.name.toLowerCase().includes(q) ?? false) ||
      t.tags.some((tag) => tag.includes(q))
    );
  });
}

export const statusLabel: Record<TicketStatus, string> = {
  new: "New",
  open: "Open",
  pending: "Pending",
  hold: "On-hold",
  solved: "Solved",
  closed: "Closed",
};

export const priorityLabel: Record<TicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const typeLabel: Record<TicketType, string> = {
  question: "Question",
  incident: "Incident",
  problem: "Problem",
  task: "Task",
};

export const channelLabel: Record<Channel, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  chat: "Chat",
  web: "Web form",
  phone: "Phone",
};

// Formatted in UTC so server and browser render identical text.
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}
