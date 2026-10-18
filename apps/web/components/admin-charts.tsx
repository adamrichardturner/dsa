"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDay } from "@/components/admin-format";
import type { AdminOverview } from "@/lib/types";

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };

const signupConfig = {
  signups: { label: "New accounts", color: "var(--chart-1)" },
} satisfies ChartConfig;

const activityConfig = {
  submissions: { label: "Submissions", color: "var(--chart-2)" },
  passes: { label: "Passes", color: "var(--chart-1)" },
} satisfies ChartConfig;

const topicConfig = {
  attempters: { label: "Attempted", color: "var(--chart-2)" },
  solvers: { label: "Solved at least one", color: "var(--chart-1)" },
} satisfies ChartConfig;

const progressConfig = {
  count: { label: "Accounts", color: "var(--chart-3)" },
} satisfies ChartConfig;

const authColors: Record<string, string> = {
  password: "var(--chart-1)",
  google: "var(--chart-2)",
  github: "var(--chart-3)",
  mixed: "var(--chart-4)",
};

const dayLabel = (label: string): string => formatDay(label);

export function AdminCharts({ overview }: { readonly overview: AdminOverview }) {
  const authConfigRecord: Record<string, { label: string; color: string }> = {};
  const authSlices: { method: string; label: string; count: number; fill: string }[] = [];
  for (const slice of overview.authMethods) {
    const color = authColors[slice.method] ?? "var(--chart-5)";
    authConfigRecord[slice.method] = { label: slice.label, color };
    authSlices.push({
      method: slice.method,
      label: slice.label,
      count: slice.count,
      fill: `var(--color-${slice.method})`,
    });
  }
  const authConfig: ChartConfig = authConfigRecord;

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardDescription>Last 30 days</CardDescription>
          <CardTitle>New accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer id="admin-signups" config={signupConfig}>
            <BarChart data={[...overview.series]} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tick={axisTick}
                tickFormatter={formatDay}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={28}
                tick={axisTick}
              />
              <ChartTooltip content={<ChartTooltipContent labelFormatter={dayLabel} />} />
              <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Last 30 days</CardDescription>
          <CardTitle>Submissions and passes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer id="admin-activity" config={activityConfig}>
            <BarChart data={[...overview.series]} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tick={axisTick}
                tickFormatter={formatDay}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={axisTick} />
              <ChartTooltip content={<ChartTooltipContent labelFormatter={dayLabel} />} />
              <Bar dataKey="submissions" fill="var(--color-submissions)" radius={4} />
              <Bar dataKey="passes" fill="var(--color-passes)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>How people sign in</CardDescription>
          <CardTitle>Sign-in methods</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer id="admin-auth" config={authConfig} className="mx-auto h-56 max-w-sm">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={authSlices}
                dataKey="count"
                nameKey="method"
                innerRadius={52}
                outerRadius={80}
                strokeWidth={2}
                stroke="var(--card)"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Share of exercises solved</CardDescription>
          <CardTitle>Course progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer id="admin-progress" config={progressConfig}>
            <BarChart
              data={[...overview.progress]}
              layout="vertical"
              margin={{ left: 8, right: 8, top: 8 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis
                type="category"
                dataKey="label"
                width={88}
                tickLine={false}
                axisLine={false}
                tick={axisTick}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardDescription>Accounts that touched each topic</CardDescription>
          <CardTitle>Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer id="admin-topics" config={topicConfig} className="h-[32rem]">
            <BarChart
              data={[...overview.topics]}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 8 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis
                type="category"
                dataKey="topic"
                width={148}
                tickLine={false}
                axisLine={false}
                tick={axisTick}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="attempters" fill="var(--color-attempters)" radius={4} />
              <Bar dataKey="solvers" fill="var(--color-solvers)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}
