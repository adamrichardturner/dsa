import { useRef } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  Keyframe,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import Svg, { Circle, Path, Rect } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const lineEnter = (delayMs: number) => {
  return new Keyframe({
    0: {
      opacity: 0,
      transform: [{ scaleX: 0 }],
    },
    100: {
      easing: Easing.out(Easing.cubic),
      opacity: 1,
      transform: [{ scaleX: 1 }],
    },
  })
    .duration(720)
    .delay(delayMs);
};

export function SuccessRule({
  animate,
  color,
  delay,
}: {
  readonly animate: boolean;
  readonly color: string;
  readonly delay: number;
}) {
  if (!animate) {
    return <View style={[styles.rule, { backgroundColor: color }]} />;
  }
  return (
    <Animated.View
      entering={lineEnter(delay)}
      style={[styles.rule, { backgroundColor: color, transformOrigin: "left center" }]}
    />
  );
}

export function GapOutline({
  animate,
  color,
  delay,
}: {
  readonly animate: boolean;
  readonly color: string;
  readonly delay: number;
}) {
  const progress = useSharedValue(animate ? 0 : 1);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const started = useRef(false);
  const rectProps = useAnimatedProps(() => {
    const span = 2 * (width.value + height.value);
    return {
      height: Math.max(0, height.value - 3),
      opacity: span === 0 ? 0 : 1,
      strokeDasharray: span,
      strokeDashoffset: span * (1 - progress.value),
      width: Math.max(0, width.value - 3),
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
    height.value = event.nativeEvent.layout.height;
    if (started.current) {
      return;
    }
    started.current = true;
    if (!animate) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 780, easing: Easing.out(Easing.cubic) }),
    );
  };

  return (
    <View onLayout={onLayout} pointerEvents="none" style={styles.outline}>
      <Svg height="100%" width="100%">
        <AnimatedRect
          animatedProps={rectProps}
          fill="none"
          rx={8}
          stroke={color}
          strokeWidth={1.75}
          x={1.5}
          y={1.5}
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
  const started = useRef(false);
  if (animate && !started.current) {
    started.current = true;
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
  rule: {
    borderRadius: 1,
    bottom: 0,
    height: 2,
    left: 0,
    position: "absolute",
    right: 0,
  },
  outline: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
