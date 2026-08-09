import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { NewTicketDialog } from "./new-ticket-dialog";
import { Bug } from "lucide-react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Bug className="size-4 text-primary" />
            <span className="font-mono text-sm font-semibold tracking-tight">LIFEDESK</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/">Board</NavLink>
            <NavLink to="/manage">Projects &amp; Tags</NavLink>
          </nav>
          <div className="ml-auto">
            <NewTicketDialog />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-sm px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "bg-accent text-foreground" }}
    >
      {children}
    </Link>
  );
}