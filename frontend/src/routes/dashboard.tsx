import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/desk/AppShell";
import { DashCard, MetricValue } from "@/components/desk/MetricCard";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brands, getDashboardData, type BrandFilter, type GroupFilter } from "@/lib/dashboard";
import { groups } from "@/lib/tickets";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Support dashboard — Mini Desk" },
      { name: "description", content: "Live support metrics: new, open and solved tickets, agents online and customer satisfaction." },
      { property: "og:title", content: "Support dashboard — Mini Desk" },
      { property: "og:description", content: "Live support metrics: new, open and solved tickets, agents online and customer satisfaction." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

const chartConfig = {
  created: { label: "Created", color: "var(--chart-created)" },
  solved: { label: "Solved", color: "var(--chart-solved)" },
} satisfies ChartConfig;

function DashboardPage() {
  const [group, setGroup] = useState<GroupFilter>("all");
  const [brand, setBrand] = useState<BrandFilter>("all");
  const data = useMemo(() => getDashboardData(group, brand), [group, brand]);

  return (
    <AppShell title="Reporting">
      <div className="h-full overflow-y-auto bg-panel">
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          <h1 className="text-2xl font-semibold">Support</h1>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-lg">
            <label>
              <span className="field-label">Support - Tickets group</span>
              <Select value={group} onValueChange={(v) => setGroup(v as GroupFilter)}>
                <SelectTrigger className="h-10 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label>
              <span className="field-label">Support - Ticket brand</span>
              <Select value={brand} onValueChange={(v) => setBrand(v as BrandFilter)}>
                <SelectTrigger className="h-10 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <DashCard title="New tickets (30min)">
              <MetricValue value={data.newTickets.value} delta={data.newTickets.delta} />
            </DashCard>
            <DashCard title="Open tickets (30min)">
              <MetricValue value={data.openTickets.value} delta={data.openTickets.delta} />
            </DashCard>
            <DashCard title="Solved tickets (30min)">
              <MetricValue value={data.solvedTickets.value} delta={data.solvedTickets.delta} />
            </DashCard>
            <DashCard title="Satisfaction (today)">
              <MetricValue value={`${data.satisfaction.value.toFixed(1)}%`} delta={data.satisfaction.delta} />
            </DashCard>

            <DashCard
              title="Tickets: Tickets created and solved"
              className="col-span-2 lg:col-span-3 lg:row-span-2"
            >
              <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full lg:h-72">
                <ComposedChart data={data.trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={48} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="created" fill="var(--color-created)" radius={[2, 2, 0, 0]} />
                  <Line
                    dataKey="solved"
                    type="linear"
                    stroke="var(--color-solved)"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </DashCard>

            <DashCard title="Agents online" className="col-span-1">
              <MetricValue value={data.agentsOnline} tone="info" size="md" />
            </DashCard>
            <DashCard title="Agents offline" className="col-span-1">
              <MetricValue value={data.agentsOffline} tone="info" size="md" />
            </DashCard>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Sample data · changes vs. previous 30 minutes</p>
        </div>
      </div>
    </AppShell>
  );
}
