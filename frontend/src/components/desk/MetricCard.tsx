import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { deltaDirection } from "@/lib/dashboard";

export function DashCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col rounded-md border bg-card shadow-sm", className)}>
      <h2 className="truncate border-b px-3 py-2.5 text-sm font-semibold" title={title}>
        {title}
      </h2>
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-4">{children}</div>
    </section>
  );
}

const valueStyle = cva("leading-none tabular-nums", {
  variants: {
    tone: { default: "text-foreground", info: "text-primary" },
    size: { lg: "text-5xl", md: "text-4xl" },
  },
  defaultVariants: { tone: "default", size: "lg" },
});

const deltaStyle = cva("inline-flex items-center gap-1 text-lg font-medium tabular-nums", {
  variants: { dir: { up: "text-success", down: "text-destructive" } },
});

export function MetricValue({
  value,
  delta,
  tone,
  size,
}: {
  value: string | number;
  delta?: number;
  tone?: "default" | "info";
  size?: "lg" | "md";
}) {
  return (
    <>
      <span className={valueStyle({ tone, size })}>{value}</span>
      {delta !== undefined && (
        <span className="mt-3 w-full max-w-28 border-t pt-1 text-center">
          <span className={deltaStyle({ dir: deltaDirection(delta) })}>
            {delta > 0 ? `+${delta}` : delta}
            <span aria-hidden className="text-sm">
              {deltaDirection(delta) === "down" ? "▼" : "▲"}
            </span>
            <span className="sr-only">{deltaDirection(delta) === "down" ? "decrease" : "increase"}</span>
          </span>
        </span>
      )}
    </>
  );
}
