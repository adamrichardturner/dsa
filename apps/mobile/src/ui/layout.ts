import { useWindowDimensions, type ViewStyle } from "react-native";

/**
 * Screen classes for iPhone, the iPhone Duo and iPad.
 *
 * - compact: an iPhone, or the Duo folded (466 pt).
 * - regular: the Duo open (669 pt), an iPad in Split View, or an iPad mini.
 * - expansive: a full-width iPad (from 900 pt), where a lesson's reading and
 *   its exercise sit side by side.
 */
export type SizeClass = "compact" | "regular" | "expansive";

export interface Layout {
  readonly width: number;
  readonly sizeClass: SizeClass;
  /** Horizontal padding for screen content. */
  readonly gutter: number;
  /** Columns for card lists such as the course and the articles. */
  readonly columns: number;
  /** True when a lesson shows the reading beside the exercise. */
  readonly split: boolean;
}

const sizeClassFor = (width: number): SizeClass => {
  if (width >= 900) {
    return "expansive";
  }
  if (width >= 600) {
    return "regular";
  }
  return "compact";
};

export function useLayout(): Layout {
  const { width } = useWindowDimensions();
  const sizeClass = sizeClassFor(width);
  return {
    width,
    sizeClass,
    gutter: sizeClass === "compact" ? 24 : 40,
    columns: sizeClass === "compact" ? 1 : 2,
    split: sizeClass === "expansive",
  };
}

/** Readable measures for a single column of content, in points. */
export const measure = {
  form: 560,
  text: 720,
  wide: 1080,
} as const;

/**
 * A centred column for a ScrollView's contentContainerStyle: the screen's
 * gutter, capped at `maxWidth` so long lines stay readable on an iPad.
 */
export const frame = (layout: Layout, maxWidth: number): ViewStyle => ({
  alignSelf: "center",
  maxWidth: maxWidth + layout.gutter * 2,
  paddingHorizontal: layout.gutter,
  width: "100%",
});

/** Splits items into rows of `columns`, so a grid's cells share each row evenly. */
export const rowsOf = <T>(items: readonly T[], columns: number): T[][] => {
  const size = Math.max(1, columns);
  const rows: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    rows.push(items.slice(start, start + size));
  }
  return rows;
};
