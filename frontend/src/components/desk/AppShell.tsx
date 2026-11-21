import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BarChart3, Bell, Inbox, Search, Settings, Users } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { CURRENT_AGENT_ID, getPerson } from "@/lib/tickets";

const navItemClass =
  "flex size-10 items-center justify-center rounded-md text-nav-foreground transition-colors hover:bg-nav-active hover:text-primary-foreground";

export function AppShell({ title, children }: { title: ReactNode; children: ReactNode }) {
  const me = getPerson(CURRENT_AGENT_ID);
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <nav
        aria-label="Main"
        className="flex w-16 shrink-0 flex-col items-center gap-2 bg-nav py-3"
      >
        <Link
          to="/"
          className="mb-3 flex size-9 items-center justify-center rounded-md bg-primary-foreground text-sm font-black text-nav"
          aria-label="Mini Desk home"
        >
          md
        </Link>
        <Link
          to="/"
          className={navItemClass}
          activeProps={{ className: "bg-nav-active text-primary-foreground" }}
          activeOptions={{ exact: true, includeSearch: false }}
          aria-label="Views"
          title="Views"
        >
          <Inbox className="size-5" />
        </Link>
        <span className={navItemClass} title="Customers (coming soon)" aria-disabled>
          <Users className="size-5" />
        </span>
        <Link
          to="/dashboard"
          className={navItemClass}
          activeProps={{ className: "bg-nav-active text-primary-foreground" }}
          aria-label="Reporting dashboard"
          title="Reporting"
        >
          <BarChart3 className="size-5" />
        </Link>
        <span className={`${navItemClass} mt-auto`} title="Admin (coming soon)" aria-disabled>
          <Settings className="size-5" />
        </span>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-4 border-b bg-card px-4">
          <div className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</div>
          <label className="relative hidden w-64 md:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search tickets"
              className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="button"
            className="relative cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-status-open" />
          </button>
          {me && <UserAvatar name={me.name} size="sm" />}
        </header>
        <main className="min-h-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
