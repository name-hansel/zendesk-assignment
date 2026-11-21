// Sample real-time support metrics for the dashboard. Swap for live data later.
import { groups } from "./tickets";

export const brands = ["Mini Desk", "Mini Desk Pro"] as const;
export type GroupFilter = "all" | (typeof groups)[number];
export type BrandFilter = "all" | (typeof brands)[number];

export interface Metric {
  value: number;
  delta: number;
}

export interface DashboardData {
  newTickets: Metric;
  openTickets: Metric;
  solvedTickets: Metric;
  satisfaction: Metric; // percent, one decimal
  agentsOnline: number;
  agentsOffline: number;
  trend: { day: string; created: number; solved: number }[];
}

const base = {
  newTickets: { value: 60, delta: -65 },
  openTickets: { value: 101, delta: -117 },
  solvedTickets: { value: 39, delta: -62 },
  satisfaction: { value: 90.7, delta: 0 },
  agentsOnline: 30,
  agentsOffline: 42,
  trend: [
    { day: "13", created: 145, solved: 150 },
    { day: "14", created: 130, solved: 155 },
    { day: "15", created: 165, solved: 170 },
    { day: "16", created: 215, solved: 175 },
    { day: "17", created: 230, solved: 250 },
    { day: "18", created: 245, solved: 255 },
    { day: "19", created: 220, solved: 210 },
    { day: "20", created: 160, solved: 480 },
  ],
};

const groupShare: Record<GroupFilter, number> = { all: 1, Support: 0.5, Billing: 0.3, Shipping: 0.2 };
const brandShare: Record<BrandFilter, number> = { all: 1, "Mini Desk": 0.6, "Mini Desk Pro": 0.4 };
const satisfactionByGroup: Record<GroupFilter, number> = { all: 90.7, Support: 92.1, Billing: 87.4, Shipping: 89.8 };

const scale = (n: number, f: number) => Math.round(n * f);

export function getDashboardData(group: GroupFilter, brand: BrandFilter): DashboardData {
  const f = groupShare[group] * brandShare[brand];
  const m = (metric: Metric): Metric => ({ value: scale(metric.value, f), delta: scale(metric.delta, f) });
  return {
    newTickets: m(base.newTickets),
    openTickets: m(base.openTickets),
    solvedTickets: m(base.solvedTickets),
    satisfaction: { value: satisfactionByGroup[group], delta: base.satisfaction.delta },
    agentsOnline: scale(base.agentsOnline, groupShare[group]),
    agentsOffline: scale(base.agentsOffline, groupShare[group]),
    trend: base.trend.map((d) => ({ day: d.day, created: scale(d.created, f), solved: scale(d.solved, f) })),
  };
}

/** Zero and increases read as "up" (green ▲); decreases read as "down" (red ▼). */
export function deltaDirection(delta: number): "up" | "down" {
  return delta < 0 ? "down" : "up";
}
