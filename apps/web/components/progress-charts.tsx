"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { formatDay } from "@/components/admin-format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalyticsView } from "@/lib/types";

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };

const activityConfig = {
  submissions: { label: "Submissions", color: "var(--chart-2)" },
  passes: { label: "Passes", color: "var(--chart-1)" },
} satisfies ChartConfig;

const topicConfig = {
  solved: { label: "Solved", color: "var(--chart-1)" },
  remaining: { label: "Still open", color: "var(--chart-4)" },
} satisfies ChartConfig;

const difficultyColors: Record<string, string> = {
  easy: "var(--chart-1)",
  medium: "var(--chart-2)",
  open: "var(--chart-4)",
};

const dayLabel = (label: string): string => formatDay(label);

const activityScale = (days: AnalyticsView["activity"]): number => {
  let peak = 1;
  for (const day of days) {
    if (day.submissions > peak) {
      peak = day.submissions;
    }
  }
  return peak;
};

const axisTicks = (scale: number): number[] | undefined => {
  if (scale > 8) {
    return undefined;
  }
  const values: number[] = [];
  for (let value = 0; value <= scale; value += 1) {
    values.push(value);
  }
  return values;
};

const activityDetail = (activeDays: number, streak: number): string => {
  if (activeDays === 0) {
    return "No submissions in the last 30 days.";
  }
  const days = activeDays === 1 ? "1 active day" : `${activeDays} active days`;
  if (streak === 0) {
    return `${days} in the last 30.`;
  }
  const streakLabel =
    streak === 1 ? "a 1-day streak" : `a ${streak}-day streak`;
  return `${days} in the last 30, and ${streakLabel}.`;
};

function TopicChart({ analytics }: { readonly analytics: AnalyticsView }) {
  const rows = analytics.topics.map((topic) => ({
    topic: topic.topic,
    solved: topic.solved,
    remaining: topic.total - topic.solved,
  }));
  let scale = 1;
  for (const row of rows) {
    const total = row.solved + row.remaining;
    if (total > scale) {
      scale = total;
    }
  }
  const tall = rows.length > 8;

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardDescription>Exercises solved in each topic</CardDescription>
        <CardTitle>Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          id="progress-topics"
          config={topicConfig}
          className={tall ? "h-[36rem]" : undefined}
        >
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ left: 8, right: 16, top: 8 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              domain={[0, scale]}
              ticks={axisTicks(scale)}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
            />
            <YAxis
              type="category"
              dataKey="topic"
              width={176}
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="solved"
              stackId="topic"
              fill="var(--color-solved)"
              radius={[4, 0, 0, 4]}
            />
            <Bar
              dataKey="remaining"
              stackId="topic"
              fill="var(--color-remaining)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function DifficultyChart({ analytics }: { readonly analytics: AnalyticsView }) {
  if (analytics.problemsSolved === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Easy and medium</CardDescription>
          <CardTitle>Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The split appears once an exercise passes.
          </p>
          <ul className="space-y-2">
            {analytics.difficulties.map((row) => (
              <li
                key={row.difficulty}
                className="flex items-center justify-between text-sm"
              >
                <span>{row.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  0/{row.total}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  const configRecord: Record<string, { label: string; color: string }> = {};
  const slices: { key: string; count: number; fill: string }[] = [];
  for (const row of analytics.difficulties) {
    if (row.solved === 0) {
      continue;
    }
    const color = difficultyColors[row.difficulty] ?? "var(--chart-3)";
    configRecord[row.difficulty] = { label: `${row.label} solved`, color };
    slices.push({
      key: row.difficulty,
      count: row.solved,
      fill: `var(--color-${row.difficulty})`,
    });
  }
  const open = analytics.problemsTotal - analytics.problemsSolved;
  if (open > 0) {
    const color = difficultyColors.open ?? "var(--chart-4)";
    configRecord.open = { label: "Still open", color };
    slices.push({ key: "open", count: open, fill: "var(--color-open)" });
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>Passes, and what is still open</CardDescription>
        <CardTitle>Difficulty</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChartContainer
          id="progress-difficulty"
          config={configRecord}
          className="mx-auto h-56 max-w-sm"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={slices}
              dataKey="count"
              nameKey="key"
              innerRadius={52}
              outerRadius={80}
              strokeWidth={2}
              stroke="var(--card)"
            />
          </PieChart>
        </ChartContainer>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {analytics.difficulties.map((row) => (
            <li key={row.difficulty}>
              {row.label}{" "}
              <span className="tabular-nums">
                {row.solved}/{row.total}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ProgressCharts({
  analytics,
}: {
  readonly analytics: AnalyticsView;
}) {
  if (analytics.topics.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 lg:self-start">
        <CardHeader>
          <CardDescription>
            {activityDetail(analytics.activeDays, analytics.streak)}
          </CardDescription>
          <CardTitle>Last 30 days</CardTitle>
        </CardHeader>
        {analytics.activeDays === 0 ? null : (
          <CardContent>
            <ChartContainer id="progress-activity" config={activityConfig}>
              <BarChart
                data={[...analytics.activity]}
                margin={{ left: 0, right: 8, top: 8 }}
              >
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
                  domain={[0, activityScale(analytics.activity)]}
                  ticks={axisTicks(activityScale(analytics.activity))}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  tick={axisTick}
                />
                <ChartTooltip
                  content={<ChartTooltipContent labelFormatter={dayLabel} />}
                />
                <Bar
                  dataKey="submissions"
                  fill="var(--color-submissions)"
                  radius={4}
                />
                <Bar dataKey="passes" fill="var(--color-passes)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        )}
      </Card>
      <DifficultyChart analytics={analytics} />
      <TopicChart analytics={analytics} />
    </section>
  );
}
