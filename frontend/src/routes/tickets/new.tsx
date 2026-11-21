import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/desk/AppShell";
import { NewTicketForm } from "@/components/desk/NewTicketForm";

export const Route = createFileRoute("/tickets/new")({
  head: () => ({
    meta: [
      { title: "New ticket — Mini Desk" },
      { name: "description", content: "Create a support ticket for a customer in Mini Desk." },
      { property: "og:title", content: "New ticket — Mini Desk" },
      { property: "og:description", content: "Create a support ticket for a customer in Mini Desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewTicketPage,
});

// Route modules must export this component for TanStack Router's file-based routing.
// eslint-disable-next-line react-refresh/only-export-components
function NewTicketPage() {
  return (
    <AppShell
      title={
        <span className="flex items-center gap-2">
          <Link to="/" className="text-muted-foreground hover:text-foreground" aria-label="Back to views">
            <ArrowLeft className="size-4" />
          </Link>
          New ticket
        </span>
      }
    >
      <div className="h-full overflow-y-auto lg:overflow-hidden">
        <NewTicketForm />
      </div>
    </AppShell>
  );
}
