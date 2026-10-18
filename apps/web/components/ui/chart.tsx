"use client";

import * as React from "react";
import { cn } from "cn";
import { ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipContentProps } from "recharts";

export interface ChartConfig {
  readonly [key: string]: {
    readonly label: string;
    readonly color: string;
  };
}

const ChartContext = React.createContext<ChartConfig | null>(null);

const useChart = (): ChartConfig => {
  const config = React.useContext(ChartContext);
  if (config === null) {
    throw new Error("useChart must be used within a ChartContainer");
  }
  return config;
};

const chartRules = (config: ChartConfig): string => {
  const rules: string[] = [];
  for (const key of Object.keys(config)) {
    const item = config[key];
    if (item === undefined) {
      continue;
    }
    rules.push(`--color-${key}: ${item.color};`);
  }
  return rules.join("");
};

export function ChartContainer({
  id,
  className,
  config,
  children,
}: {
  readonly id: string;
  readonly className?: string;
  readonly config: ChartConfig;
  readonly children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}) {
  return (
    <ChartContext.Provider value={config}>
      <div className="space-y-3">
        <div
          data-chart={id}
          className={cn(
            "flex h-64 w-full justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-surface]:outline-none",
            className,
          )}
        >
          <style>{`[data-chart="${id}"] { ${chartRules(config)} }`}</style>
          <ResponsiveContainer
            initialDimension={{ width: 320, height: 200 }}
            width="100%"
            height="100%"
          >
            {children}
          </ResponsiveContainer>
        </div>
        <ChartLegend />
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = Tooltip;

const seriesKey = (dataKey: unknown, name: unknown, config: ChartConfig): string => {
  const fromKey = typeof dataKey === "string" || typeof dataKey === "number" ? String(dataKey) : "";
  const fromName = typeof name === "string" || typeof name === "number" ? String(name) : "";
  if (config[fromKey] !== undefined) {
    return fromKey;
  }
  if (config[fromName] !== undefined) {
    return fromName;
  }
  if (fromKey.length > 0) {
    return fromKey;
  }
  return fromName;
};

const seriesText = (value: unknown): string | null => {
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
};

const tooltipHeading = (
  label: TooltipContentProps["label"],
  hideLabel: boolean,
  labelFormatter?: (label: string) => string,
): string | null => {
  if (hideLabel) {
    return null;
  }
  if (typeof label === "number") {
    return label.toLocaleString();
  }
  if (typeof label !== "string") {
    return null;
  }
  if (labelFormatter !== undefined) {
    return labelFormatter(label);
  }
  return label;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  labelFormatter,
}: {
  readonly active?: boolean;
  readonly payload?: TooltipContentProps["payload"];
  readonly label?: TooltipContentProps["label"];
  readonly hideLabel?: boolean;
  readonly labelFormatter?: (label: string) => string;
}) {
  const config = useChart();
  if (active !== true || payload === undefined || payload.length === 0) {
    return null;
  }

  const rows: { key: string; label: string; value: string; color: string }[] = [];
  for (const item of payload) {
    if (item.type === "none") {
      continue;
    }
    const key = seriesKey(item.dataKey, item.name, config);
    const value = seriesText(item.value);
    if (key.length === 0 || value === null) {
      continue;
    }
    const configured = config[key];
    const name = typeof item.name === "string" ? item.name : key;
    const color = item.color ?? `var(--color-${key})`;
    rows.push({
      key,
      label: configured?.label ?? name,
      value,
      color,
    });
  }

  if (rows.length === 0) {
    return null;
  }

  const heading = tooltipHeading(label, hideLabel, labelFormatter);

  return (
    <div className="grid min-w-36 gap-1.5 rounded-lg bg-popover px-2.5 py-2 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10">
      {heading !== null ? <p className="font-medium">{heading}</p> : null}
      <ul className="grid gap-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 shrink-0 rounded-[2px]" style={{ background: row.color }} />
              {row.label}
            </span>
            <span className="font-medium tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartLegend() {
  const config = useChart();
  const keys = Object.keys(config);

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {keys.map((key) => {
        const item = config[key];
        if (item === undefined) {
          return null;
        }
        return (
          <li key={key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px]" style={{ background: `var(--color-${key})` }} />
            {item.label}
          </li>
        );
      })}
    </ul>
  );
}
