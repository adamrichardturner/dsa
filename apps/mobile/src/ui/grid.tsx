import { Fragment, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { rowsOf } from "@/ui/layout";

/**
 * Lays items out in rows of `columns`. Each cell in a row is the same width
 * and the row is as tall as its tallest cell; a short last row keeps empty
 * cells so its items line up with the rows above. One column is a plain list.
 */
export function Grid<T>({
  items,
  columns,
  gap,
  keyOf,
  render,
}: {
  readonly items: readonly T[];
  readonly columns: number;
  readonly gap: number;
  readonly keyOf: (item: T) => string;
  readonly render: (item: T, index: number) => ReactNode;
}) {
  if (columns <= 1) {
    return (
      <View style={{ gap }}>
        {items.map((item, index) => (
          <Fragment key={keyOf(item)}>{render(item, index)}</Fragment>
        ))}
      </View>
    );
  }
  const rows = rowsOf(items, columns);
  return (
    <View style={{ gap }}>
      {rows.map((row, rowIndex) => {
        const blanks = columns - row.length;
        return (
          <View key={keyOf(row[0] as T)} style={[styles.row, { gap }]}>
            {row.map((item, cellIndex) => (
              <View key={keyOf(item)} style={styles.cell}>
                {render(item, rowIndex * columns + cellIndex)}
              </View>
            ))}
            {Array.from({ length: blanks }, (_, blank) => (
              <View key={`blank-${blank}`} style={styles.cell} />
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "stretch",
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
});
