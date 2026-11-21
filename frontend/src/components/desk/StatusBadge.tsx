import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { statusLabel, type TicketPriority, type TicketStatus } from "@/lib/tickets";

const statusColors = {
  new: "bg-status-new text-status-new-foreground",
  open: "bg-status-open text-status-foreground",
  pending: "bg-status-pending text-status-foreground",
  hold: "bg-status-hold text-status-foreground",
  solved: "bg-status-solved text-status-foreground",
  closed: "bg-status-solved text-status-foreground",
} satisfies Record<TicketStatus, string>;

const pill = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  { variants: { status: statusColors } },
);

const letter = cva(
  "inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-[11px] font-bold",
  { variants: { status: statusColors } },
);

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return <span className={cn(pill({ status }), className)}>{statusLabel[status]}</span>;
}

/** Compact one-letter status square used in lists (N, O, P, H, S, C). */
export function StatusLetter({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <span className={cn(letter({ status }), className)} title={statusLabel[status]}>
      {statusLabel[status][0]}
    </span>
  );
}

const priorityText = cva("text-sm", {
  variants: {
    priority: {
      low: "text-muted-foreground",
      normal: "text-foreground",
      high: "font-semibold text-priority-high",
      urgent: "font-semibold text-priority-urgent",
    } satisfies Record<TicketPriority, string>,
  },
});

export function PriorityText({ priority, children }: { priority: TicketPriority; children: string }) {
  return <span className={priorityText({ priority })}>{children}</span>;
}

export function Tag({ children, onRemove }: { children: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-tag px-2 py-0.5 text-xs font-semibold text-tag-foreground">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer leading-none text-muted-foreground hover:text-foreground"
          aria-label={`Remove tag ${children}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
