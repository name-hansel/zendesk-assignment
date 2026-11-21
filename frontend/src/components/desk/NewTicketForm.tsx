import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Mail, Paperclip, Phone, Smile, Tag as TagIcon, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { StatusLetter, Tag } from "@/components/desk/StatusBadge";
import { UserAvatar } from "@/components/desk/UserAvatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createTicket, useTicketStore } from "@/lib/ticket-store";
import {
  agents,
  channelLabel,
  CURRENT_AGENT_ID,
  formatDate,
  getPerson,
  groups,
  priorityLabel,
  statusLabel,
  typeLabel,
  validateNewTicket,
  type Channel,
  type NewTicketErrors,
  type TicketPriority,
  type TicketType,
} from "@/lib/tickets";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <span className="field-label">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function NewTicketForm() {
  const navigate = useNavigate();
  const {
    tickets,
    status: ticketLoadStatus,
    error: ticketLoadError,
    usingFallback,
  } = useTicketStore();

  const requesterId = CURRENT_AGENT_ID; // demo "logged-in" user
  const [assigneeId, setAssigneeId] = useState<string>(CURRENT_AGENT_ID);
  const [group, setGroup] = useState<string>("Support");
  const [type, setType] = useState<TicketType>("question");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [channel, setChannel] = useState<Channel>("email");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<NewTicketErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clearError = (key: keyof NewTicketErrors) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const requester = getPerson(requesterId);
  const requesterTickets = tickets.filter((t) => t.requesterId === requesterId).slice(0, 4);

  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase().replace(/\s+/g, "_");
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagDraft("");
  };

  const submit = async () => {
    const found = validateNewTicket({ subject, description, requesterId });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    let ticket: Awaited<ReturnType<typeof createTicket>>;
    try {
      ticket = await createTicket({
        subject,
        description,
        requesterId,
        assigneeId: assigneeId === "none" ? null : assigneeId,
        group,
        type,
        priority,
        channel,
        tags,
        status: "open",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create ticket.";
      setSubmitError(message);
      toast.error("Could not create ticket", { description: message });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    toast.success(`Ticket #${ticket.id} created`, {
      description: `Submitted as ${statusLabel[ticket.status]}`,
    });
    void navigate({ to: "/tickets/$ticketId", params: { ticketId: String(ticket.id) } });
  };

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_340px]">
      {/* Left: properties */}
      <aside className="overflow-y-auto border-b bg-panel lg:border-b-0 lg:border-r">
        <div className="space-y-5 border-b p-5">
          <Field label="Requester">
            <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-muted px-3 text-sm">
              {requester && <UserAvatar name={requester.name} size="xs" />}
              <span className="truncate">{requester?.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">You</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Filled in from the signed-in user.</p>
          </Field>
          <Field label="Assignee">
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="h-10 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {group}/{a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="space-y-5 p-5">
          <Field label="Group">
            <Select value={group} onValueChange={setGroup}>
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
          <Field label="Channel">
            <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
              <SelectTrigger className="h-10 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(channelLabel).map(([k, label]) => (
                  <SelectItem key={k} value={k}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tags">
            <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-card px-2 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
              {tags.map((tag) => (
                <Tag key={tag} onRemove={() => setTags(tags.filter((t) => t !== tag))}>
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
                placeholder={tags.length ? "" : "Add tag"}
                className="min-w-16 flex-1 bg-transparent text-sm outline-none"
                aria-label="Add tag"
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={type} onValueChange={(v) => setType(v as TicketType)}>
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
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
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
        </div>
      </aside>

      {/* Middle: subject + description */}
      <section className="flex min-h-[520px] flex-col bg-card">
        <div className="border-b px-6 py-4">
          <label htmlFor="subject" className="sr-only">
            Subject
          </label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              clearError("subject");
            }}
            placeholder="Subject"
            aria-invalid={Boolean(errors.subject)}
            className="w-full bg-transparent text-lg font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
          />
          {errors.subject && <p className="mt-1 text-xs font-medium text-destructive">{errors.subject}</p>}
          <p className="mt-1 text-sm text-muted-foreground">
            New ticket via {channelLabel[channel]}
            {requester ? ` · for ${requester.name}` : ""}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-6 pt-3">
            <span className="border-b-2 border-primary px-2 pb-1.5 text-sm font-semibold">Description</span>
            {requester && <span className="text-xs text-muted-foreground">To: {requester.name}</span>}
          </div>
          <label htmlFor="description" className="sr-only">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError("description");
            }}
            placeholder="Describe the customer's request…"
            aria-invalid={Boolean(errors.description)}
            className={cn(
              "block w-full flex-1 resize-none bg-transparent px-6 py-3 text-sm outline-none placeholder:text-muted-foreground",
              errors.description && "placeholder:text-destructive",
            )}
          />
          {errors.description && (
            <p className="px-6 text-xs font-medium text-destructive">{errors.description}</p>
          )}
          {submitError && (
            <p role="alert" className="px-6 text-xs font-medium text-destructive">{submitError}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-1">
            <Button variant="subtle" size="icon" aria-label="Insert emoji">
              <Smile />
            </Button>
            <Button variant="subtle" size="icon" aria-label="Attach file">
              <Paperclip />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="subtle">
              <Link to="/">Cancel</Link>
            </Button>
            <Button onClick={submit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </div>
      </section>

      {/* Right: requester context */}
      <aside className="hidden overflow-y-auto border-l bg-card xl:block">
        {requester ? (
          <>
            <div className="border-b p-5">
              <div className="flex items-center gap-3">
                <UserAvatar name={requester.name} size="lg" />
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{requester.name}</h2>
                  {requester.organization && (
                    <p className="text-xs text-muted-foreground">{requester.organization}</p>
                  )}
                </div>
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                <InfoRow icon={<Mail />}>{requester.email}</InfoRow>
                {requester.phone && <InfoRow icon={<Phone />}>{requester.phone}</InfoRow>}
                {requester.tags && requester.tags.length > 0 && (
                  <InfoRow icon={<TagIcon />}>
                    <span className="flex flex-wrap gap-1.5">
                      {requester.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </span>
                  </InfoRow>
                )}
              </dl>
            </div>
            <div className="py-4">
              <h3 className="px-5 pb-2 text-base font-semibold">Recent tickets</h3>
              {ticketLoadStatus === "error" && (
                <p role="alert" className="px-5 text-sm text-destructive">
                  {usingFallback
                    ? `Could not connect to tickets; showing sample data. ${ticketLoadError}`
                    : `Could not refresh tickets. ${ticketLoadError}`}
                </p>
              )}
              {ticketLoadStatus !== "error" && requesterTickets.length === 0 && (
                <p className="px-5 text-sm text-muted-foreground">No previous tickets.</p>
              )}
              <ol>
                {requesterTickets.map((t) => (
                  <li key={t.id} className="flex gap-3 px-5 py-3">
                    <StatusLetter status={t.status} className="mt-0.5" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{t.subject}</span>
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(t.updatedAt)} · #{t.id}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
            <UserPlus className="size-8 text-muted-foreground" />
            <p className="text-sm font-semibold">No requester yet</p>
            <p className="text-sm text-muted-foreground">
              Pick a customer to see their details and recent tickets here.
            </p>
          </div>
        )}
      </aside>
    </div>
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
