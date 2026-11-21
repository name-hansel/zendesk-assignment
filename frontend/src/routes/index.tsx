import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, RefreshCw, Search } from "lucide-react";

import { AppShell } from "@/components/desk/AppShell";
import { PriorityText, StatusLetter } from "@/components/desk/StatusBadge";
import { UserAvatar } from "@/components/desk/UserAvatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { updateTicket, useTickets } from "@/lib/ticket-store";
import {
  formatDate,
  getPerson,
  isViewId,
  priorityLabel,
  searchTickets,
  statusLabel,
  ticketViews,
  ticketsForView,
  type ViewId,
} from "@/lib/tickets";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { view?: ViewId } =>
    isViewId(search["view"]) ? { view: search["view"] } : {},
  head: () => ({
    meta: [
      { title: "Views — Mini Desk" },
      { name: "description", content: "Triage, filter and work through your support tickets in Mini Desk." },
      { property: "og:title", content: "Views — Mini Desk" },
      { property: "og:description", content: "Triage, filter and work through your support tickets in Mini Desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TicketListPage,
});

function TicketListPage() {
  const { view = "your-unsolved" } = Route.useSearch();
  const navigate = useNavigate();
  const tickets = useTickets();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const counts = useMemo(
    () => Object.fromEntries(ticketViews.map((v) => [v.id, ticketsForView(tickets, v.id).length])),
    [tickets],
  );
  const rows = useMemo(
    () => searchTickets(ticketsForView(tickets, view), query),
    [tickets, view, query],
  );
  const activeView = ticketViews.find((v) => v.id === view) ?? ticketViews[0];

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const bulkSolve = () => {
    selected.forEach((id) => updateTicket(id, { status: "solved" }));
    setSelected(new Set());
  };

  return (
    <AppShell title="Views">
      <div className="flex h-full">
        {/* Views panel */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r bg-panel md:block">
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <h2 className="text-base font-semibold">Views</h2>
            <RefreshCw className="size-4 text-muted-foreground" />
          </div>
          <ul className="px-2">
            {ticketViews.map((v) => (
              <li key={v.id}>
                <Link
                  to="/"
                  search={{ view: v.id }}
                  onClick={() => setSelected(new Set())}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-hover",
                    v.id === view && "bg-selected font-semibold",
                  )}
                >
                  <span className="truncate">{v.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{counts[v.id] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Ticket table */}
        <section className="flex min-w-0 flex-1 flex-col bg-card">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b px-6 pb-4 pt-5">
            <div>
              <h1 className="text-xl font-semibold">{activeView.label}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {rows.length} {rows.length === 1 ? "ticket" : "tickets"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter this view"
                  className="h-9 w-56 rounded-md border border-input bg-card pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </label>
              <Button variant="basic" size="sm" className="h-9">
                <Filter /> Filter
              </Button>
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-3 border-b bg-accent px-6 py-2 text-sm">
              <span className="font-semibold">{selected.size} selected</span>
              <Button size="sm" onClick={bulkSolve}>
                Mark as solved
              </Button>
              <Button size="sm" variant="subtle" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-card text-xs font-semibold text-muted-foreground">
                <tr className="border-b">
                  <th className="w-14 py-3 pl-6 pr-4">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(v) =>
                        setSelected(v ? new Set(rows.map((r) => r.id)) : new Set())
                      }
                      aria-label="Select all tickets"
                    />
                  </th>
                  <th className="w-28 py-3">Status</th>
                  <th className="py-3">Subject</th>
                  <th className="py-3">Requester</th>
                  <th className="py-3">Requested</th>
                  <th className="py-3">Priority</th>
                  <th className="py-3 pr-6">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const requester = getPerson(t.requesterId);
                  const assignee = getPerson(t.assigneeId);
                  const isSelected = selected.has(t.id);
                  return (
                    <tr
                      key={t.id}
                      onClick={() =>
                        navigate({ to: "/tickets/$ticketId", params: { ticketId: String(t.id) } })
                      }
                      className={cn(
                        "cursor-pointer border-b transition-colors hover:bg-hover",
                        isSelected && "bg-accent",
                      )}
                    >
                      <td className="py-3 pl-6 pr-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggle(t.id)}
                          aria-label={`Select ticket ${t.id}`}
                        />
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-2">
                          <StatusLetter status={t.status} />
                          <span className="text-muted-foreground">{statusLabel[t.status]}</span>
                        </span>
                      </td>
                      <td className="max-w-md py-3 pr-4">
                        <Link
                          to="/tickets/$ticketId"
                          params={{ ticketId: String(t.id) }}
                          className="block truncate font-semibold text-foreground hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.subject}
                        </Link>
                        <span className="text-xs text-muted-foreground">#{t.id}</span>
                      </td>
                      <td className="py-3 pr-4">
                        {requester && (
                          <span className="inline-flex items-center gap-2">
                            <UserAvatar name={requester.name} size="xs" />
                            {requester.name}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="py-3 pr-4">
                        <PriorityText priority={t.priority}>{priorityLabel[t.priority]}</PriorityText>
                      </td>
                      <td className="py-3 pr-6">
                        {assignee ? (
                          assignee.name
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground">
                      No tickets in this view. Nice work!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
