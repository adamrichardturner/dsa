import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const tracePad = 5;
const borderDrawEasing = Easing.bezier(0.65, 0, 0.35, 1);

interface OutlineGeometry {
  readonly head: number;
  readonly length: number;
  readonly path: string;
  readonly stroke: number;
}

const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Rounded rectangle centered on the gap border. The path starts at the top
 * center so the stroke closes on a straight edge. Length is slightly long so
 * the dash fully covers the join.
 */
const outlineGeometry = (
  width: number,
  height: number,
  borderRadius: number,
  borderWidth: number,
): OutlineGeometry => {
  const stroke = borderWidth + 0.5;
  const left = round(tracePad + stroke / 2);
  const top = round(tracePad + stroke / 2);
  const right = Math.max(left, round(tracePad + width - stroke / 2));
  const bottom = Math.max(top, round(tracePad + height - stroke / 2));
  const boxWidth = right - left;
  const boxHeight = bottom - top;
  const corner = round(Math.min(Math.max(0, borderRadius - stroke / 2), boxWidth / 2, boxHeight / 2));
  const length = round(2 * (boxWidth + boxHeight - 4 * corner) + 2 * Math.PI * corner + 1.5);
  const head = round(Math.min(22, Math.max(8, length * 0.12)));
  const midX = round((left + right) / 2);

  if (boxWidth <= 0 || boxHeight <= 0) {
    return { head: 0, length: 1, path: "M 0 0", stroke };
  }
  if (corner < 0.5) {
    return {
      head,
      length,
      path: `M ${midX} ${top} H ${right} V ${bottom} H ${left} V ${top} H ${midX}`,
      stroke,
    };
  }

  const arc = (x: number, y: number): string => `A ${corner} ${corner} 0 0 1 ${round(x)} ${round(y)}`;
  return {
    head,
    length,
    path: [
      `M ${midX} ${top}`,
      `H ${round(right - corner)}`,
      arc(right, top + corner),
      `V ${round(bottom - corner)}`,
      arc(right - corner, bottom),
      `H ${round(left + corner)}`,
      arc(left, bottom - corner),
      `V ${round(top + corner)}`,
      arc(left + corner, top),
      `H ${midX}`,
    ].join(" "),
    stroke,
  };
};

const drawDuration = (length: number): number => Math.round(Math.min(1180, Math.max(860, length * 2.2)));

/**
 * Draws the success border around a gap. A soft halo and a short highlight
 * lead the stroke, then fade so the settled state is a clean border.
 */
export function GapOutline({
  animate,
  borderRadius,
  borderWidth,
  color,
  delay,
  height,
  width,
}: {
  readonly animate: boolean;
  readonly borderRadius: number;
  readonly borderWidth: number;
  readonly color: string;
  readonly delay: number;
  readonly height: number;
  readonly width: number;
}) {
  const geometry = outlineGeometry(width, height, borderRadius, borderWidth);
  const progress = useSharedValue(animate ? 0 : 1);
  const span = useSharedValue(geometry.length);
  const head = useSharedValue(geometry.head);
  const [started, setStarted] = useState(false);
  span.value = geometry.length;
  head.value = geometry.head;

  if (!started) {
    setStarted(true);
    progress.value = animate
      ? withDelay(
          delay,
          withTiming(1, {
            duration: drawDuration(geometry.length),
            easing: borderDrawEasing,
            reduceMotion: ReduceMotion.System,
          }),
        )
      : 1;
  }

  const borderProps = useAnimatedProps(() => ({
    strokeDashoffset: span.value * (1 - progress.value),
  }));
  const haloProps = useAnimatedProps(() => {
    const reveal = Math.min(1, progress.value / 0.08);
    const settle = progress.value < 0.7 ? 1 : Math.max(0, (1 - progress.value) / 0.3);
    return {
      opacity: reveal * settle * 0.28,
      strokeDashoffset: span.value * (1 - progress.value),
    };
  });
  const sheenProps = useAnimatedProps(() => {
    const distance = span.value;
    const tip = head.value;
    const drawn = distance * progress.value;
    const reveal = Math.min(1, progress.value / 0.1);
    const settle = progress.value < 0.86 ? 1 : Math.max(0, (1 - progress.value) / 0.14);
    return {
      opacity: reveal * settle * 0.7,
      strokeDashoffset: distance + tip * 2 - drawn,
    };
  });

  const canvasHeight = height + tracePad * 2;
  const canvasWidth = width + tracePad * 2;
  const hiddenOffset = animate ? geometry.length : 0;

  return (
    <View pointerEvents="none" style={[styles.trace, { height: canvasHeight, width: canvasWidth }]}>
      <Svg height={canvasHeight} width={canvasWidth}>
        <AnimatedPath
          animatedProps={haloProps}
          d={geometry.path}
          fill="none"
          opacity={0}
          stroke={color}
          strokeDasharray={`${geometry.length} ${geometry.length}`}
          strokeDashoffset={hiddenOffset}
          strokeLinejoin="round"
          strokeWidth={geometry.stroke + 3.5}
        />
        <AnimatedPath
          animatedProps={borderProps}
          d={geometry.path}
          fill="none"
          stroke={color}
          strokeDasharray={`${geometry.length} ${geometry.length}`}
          strokeDashoffset={hiddenOffset}
          strokeLinejoin="round"
          strokeWidth={geometry.stroke}
        />
        <AnimatedPath
          animatedProps={sheenProps}
          d={geometry.path}
          fill="none"
          opacity={0}
          stroke="#FFFFFF"
          strokeDasharray={`${geometry.head} ${geometry.length}`}
          strokeDashoffset={geometry.length + geometry.head * 2}
          strokeLinecap="round"
          strokeWidth={geometry.stroke}
        />
      </Svg>
    </View>
  );
}

export function CompleteTick({
  animate,
  color,
}: {
  readonly animate: boolean;
  readonly color: string;
}) {
  const progress = useSharedValue(animate ? 0 : 1);
  const [started, setStarted] = useState(false);
  if (animate && !started) {
    setStarted(true);
    progress.value = withTiming(1, { duration: 640, easing: Easing.out(Easing.cubic) });
  }
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: 63 * (1 - progress.value),
  }));
  const tickProps = useAnimatedProps(() => {
    const amount = Math.min(1, Math.max(0, (progress.value - 0.28) / 0.72));
    return {
      strokeDashoffset: 24 * (1 - amount),
    };
  });

  return (
    <Animated.View
      accessibilityLabel="Exercise complete"
      accessibilityRole="image"
      entering={animate ? ZoomIn.springify().damping(14).stiffness(180) : undefined}
    >
      <Svg height={26} viewBox="0 0 26 26" width={26}>
        <Circle cx={13} cy={13} fill={color} opacity={0.16} r={11} />
        <AnimatedCircle
          animatedProps={ringProps}
          cx={13}
          cy={13}
          fill="none"
          r={10}
          stroke={color}
          strokeDasharray="63"
          strokeLinecap="round"
          strokeWidth={2}
        />
        <AnimatedPath
          animatedProps={tickProps}
          d="M7.1 13.2 L11.1 17.1 L18.8 9"
          fill="none"
          stroke={color}
          strokeDasharray="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  trace: {
    left: -tracePad,
    position: "absolute",
    top: -tracePad,
  },
});
