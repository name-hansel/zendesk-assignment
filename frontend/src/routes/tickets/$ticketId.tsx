import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ChevronDown,
  History,
  Mail,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Pencil,
  Phone,
  Smile,
  Tag as TagIcon,
  ThumbsUp,
  NotebookPen,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/desk/AppShell";
import { StatusBadge, StatusLetter, Tag } from "@/components/desk/StatusBadge";
import { UserAvatar } from "@/components/desk/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addComment, updateTicket, useTickets } from "@/lib/ticket-store";
import {
  agents,
  channelLabel,
  formatDate,
  getPerson,
  groups,
  priorityLabel,
  statusLabel,
  typeLabel,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from "@/lib/tickets";

export const Route = createFileRoute("/tickets/$ticketId")({
  head: ({ params }) => ({
    meta: [
      { title: `Ticket #${params.ticketId} — Mini Desk` },
      { name: "description", content: `Conversation, properties and customer context for ticket #${params.ticketId}.` },
      { property: "og:title", content: `Ticket #${params.ticketId} — Mini Desk` },
      { property: "og:description", content: `Conversation, properties and customer context for ticket #${params.ticketId}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TicketPage,
});

function TicketPage() {
  const { ticketId } = Route.useParams();
  const tickets = useTickets();
  const ticket = tickets.find((t) => String(t.id) === ticketId);

  if (!ticket) {
    return (
      <AppShell title="Ticket not found">
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-xl font-semibold">Ticket #{ticketId} doesn't exist</h1>
          <Button asChild variant="basic">
            <Link to="/">Back to views</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={
        <span className="flex items-center gap-2">
          <Link to="/" className="text-muted-foreground hover:text-foreground" aria-label="Back to views">
            <ArrowLeft className="size-4" />
          </Link>
          <StatusLetter status={ticket.status} />
          <span className="truncate">{ticket.subject}</span>
          <span className="font-normal text-muted-foreground">#{ticket.id}</span>
        </span>
      }
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <PropertiesPanel ticket={ticket} />
        <Conversation ticket={ticket} />
        <CustomerPanel ticket={ticket} tickets={tickets} />
      </div>
    </AppShell>
  );
}

/* ------------------------------ Left: properties ------------------------------ */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="field-label">{label}</span>
      {children}
    </div>
  );
}

function PropertiesPanel({ ticket }: { ticket: Ticket }) {
  const requester = getPerson(ticket.requesterId);
  const [tagDraft, setTagDraft] = useState("");

  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase().replace(/\s+/g, "_");
    if (tag && !ticket.tags.includes(tag)) updateTicket(ticket.id, { tags: [...ticket.tags, tag] });
    setTagDraft("");
  };

  return (
    <aside className="hidden overflow-y-auto border-r bg-panel lg:block">
      <div className="space-y-5 border-b p-5">
        <Field label="Requester">
          <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm">
            {requester && <UserAvatar name={requester.name} size="xs" />}
            {requester?.name}
          </div>
        </Field>
        <Field label="Assignee">
          <Select
            value={ticket.assigneeId ?? "none"}
            onValueChange={(v) => updateTicket(ticket.id, { assigneeId: v === "none" ? null : v })}
          >
            <SelectTrigger className="h-10 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {ticket.group}/{a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Followers">
          <input
            placeholder="search name or contact info"
            className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          />
        </Field>
      </div>

      <div className="space-y-5 p-5">
        <Field label="Group">
          <Select value={ticket.group} onValueChange={(v) => updateTicket(ticket.id, { group: v })}>
            <SelectTrigger className="h-10 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Tags">
          <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-card px-2 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
            {ticket.tags.map((tag) => (
              <Tag
                key={tag}
                onRemove={() => updateTicket(ticket.id, { tags: ticket.tags.filter((t) => t !== tag) })}
              >
                {tag}
              </Tag>
            ))}
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder={ticket.tags.length ? "" : "Add tag"}
              className="min-w-16 flex-1 bg-transparent text-sm outline-none"
              aria-label="Add tag"
            />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={ticket.type} onValueChange={(v) => updateTicket(ticket.id, { type: v as TicketType })}>
              <SelectTrigger className="h-10 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabel).map(([k, label]) => (
                  <SelectItem key={k} value={k}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Priority">
            <Select
              value={ticket.priority}
              onValueChange={(v) => updateTicket(ticket.id, { priority: v as TicketPriority })}
            >
              <SelectTrigger className="h-10 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityLabel).map(([k, label]) => (
                  <SelectItem key={k} value={k}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <p className="text-xs text-muted-foreground">
          Created {formatDate(ticket.createdAt)} · Updated {formatDate(ticket.updatedAt)}
        </p>
      </div>
    </aside>
  );
}

/* ----------------------------- Middle: conversation ----------------------------- */

const submitStatuses: TicketStatus[] = ["open", "pending", "hold", "solved"];

function Conversation({ ticket }: { ticket: Ticket }) {
  const requester = getPerson(ticket.requesterId);
  const [mode, setMode] = useState<"public" | "internal">("public");
  const [draft, setDraft] = useState("");
  const [submitStatus, setSubmitStatus] = useState<TicketStatus>(
    ticket.status === "new" ? "open" : ticket.status === "closed" ? "solved" : ticket.status,
  );
  const threadEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ block: "end" });
  }, [ticket.comments.length]);

  const submit = () => {
    const body = draft.trim();
    if (body) addComment(ticket.id, body, mode === "public");
    updateTicket(ticket.id, { status: submitStatus });
    setDraft("");
    toast.success(`Ticket #${ticket.id} updated`, {
      description: `Submitted as ${statusLabel[submitStatus]}`,
    });
  };

  const isClosed = ticket.status === "closed";

  return (
    <section className="flex min-h-0 flex-col bg-card">
      <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{ticket.subject}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            via {channelLabel[ticket.channel]}
            <span className="text-border">|</span>
            <StatusBadge status={ticket.status} />
          </p>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="subtle" size="icon" aria-label="Ticket history">
            <History />
          </Button>
          <Button variant="subtle" size="icon" aria-label="More actions">
            <MoreVertical />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-6 py-4">
        {ticket.comments.map((cm) => {
          const author = getPerson(cm.authorId);
          return (
            <article
              key={cm.id}
              className={cn(
                "flex gap-3 rounded-md p-3",
                !cm.public && "border border-note-border bg-note",
              )}
            >
              {author && <UserAvatar name={author.name} size="md" />}
              <div className="min-w-0 flex-1">
                <header className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm">
                    <span className="font-semibold">{author?.name}</span>{" "}
                    <span className="text-muted-foreground">
                      {cm.public
                        ? author?.role === "agent"
                          ? "replied"
                          : `via ${channelLabel[ticket.channel]}`
                        : "· Internal note"}
                    </span>
                  </p>
                  <time className="text-xs text-muted-foreground">{formatDate(cm.createdAt)}</time>
                </header>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{cm.body}</p>
              </div>
            </article>
          );
        })}
        <div ref={threadEnd} />
      </div>

      {/* Composer */}
      <div className={cn("border-t", mode === "internal" && "bg-note")}>
        <div className="flex items-center justify-between px-6 pt-3">
          <div className="flex gap-1" role="tablist" aria-label="Reply type">
            {(["public", "internal"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "cursor-pointer border-b-2 px-2 pb-1.5 text-sm transition-colors",
                  mode === m
                    ? "border-primary font-semibold text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "public" ? "Public reply" : "Internal note"}
              </button>
            ))}
          </div>
          {mode === "public" && requester && (
            <span className="text-xs text-muted-foreground">To: {requester.name}</span>
          )}
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={isClosed}
          placeholder={
            isClosed
              ? "Closed tickets can't be updated."
              : mode === "public"
                ? `Reply to ${requester?.name ?? "requester"}…`
                : "Add an internal note — only agents can see this."
          }
          rows={4}
          className="block w-full resize-none bg-transparent px-6 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-1">
            <Button variant="subtle" size="icon" aria-label="Insert emoji">
              <Smile />
            </Button>
            <Button variant="subtle" size="icon" aria-label="Attach file">
              <Paperclip />
            </Button>
            <Button variant="subtle" size="icon" aria-label="Thumbs up">
              <ThumbsUp />
            </Button>
          </div>
          <div className="flex">
            <Button onClick={submit} disabled={isClosed} className="rounded-r-none">
              Submit as {statusLabel[submitStatus]}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isClosed}
                  className="rounded-l-none border-l border-primary-foreground/30 px-2"
                  aria-label="Choose status"
                >
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {submitStatuses.map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => setSubmitStatus(s)}>
                    <StatusLetter status={s} />
                    Submit as {statusLabel[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Right: customer ------------------------------ */

function CustomerPanel({ ticket, tickets }: { ticket: Ticket; tickets: Ticket[] }) {
  const requester = getPerson(ticket.requesterId);
  const [note, setNote] = useState("");
  if (!requester) return null;

  const interactions = tickets
    .filter((t) => t.requesterId === requester.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <aside className="hidden overflow-y-auto border-l bg-card xl:block">
      <div className="border-b p-5">
        <div className="flex items-center gap-3">
          <UserAvatar name={requester.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold">{requester.name}</h2>
            {requester.organization && (
              <p className="text-xs text-muted-foreground">{requester.organization}</p>
            )}
          </div>
          <Button variant="subtle" size="icon" aria-label="Edit customer">
            <Pencil />
          </Button>
        </div>
        <dl className="mt-4 space-y-2.5 text-sm">
          <InfoRow icon={<Mail />}>{requester.email}</InfoRow>
          {requester.phone && <InfoRow icon={<Phone />}>{requester.phone}</InfoRow>}
          {ticket.channel === "whatsapp" && <InfoRow icon={<MessageCircle />}>{requester.name}</InfoRow>}
          {requester.tags && requester.tags.length > 0 && (
            <InfoRow icon={<TagIcon />}>
              <span className="flex flex-wrap gap-1.5">
                {requester.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </span>
            </InfoRow>
          )}
          <InfoRow icon={<NotebookPen />}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note"
              rows={2}
              className="w-full resize-none rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
            />
          </InfoRow>
        </dl>
      </div>

      <div className="py-4">
        <h3 className="px-5 pb-2 text-base font-semibold">Interactions</h3>
        <ol className="relative">
          {interactions.map((t) => {
            const current = t.id === ticket.id;
            return (
              <li key={t.id}>
                <Link
                  to="/tickets/$ticketId"
                  params={{ ticketId: String(t.id) }}
                  className={cn(
                    "flex gap-3 px-5 py-3 transition-colors hover:bg-hover",
                    current && "bg-selected hover:bg-selected",
                  )}
                >
                  <StatusLetter status={t.status} className="mt-0.5" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{t.subject}</span>
                    <span className="block text-xs text-muted-foreground">
                      {current ? "Current ticket" : formatDate(t.updatedAt)} · #{t.id}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</dt>
      <dd className="min-w-0 flex-1 break-words">{children}</dd>
    </div>
  );
}
