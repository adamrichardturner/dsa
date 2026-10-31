import { useCallback, useEffect, useRef } from "react";
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { infinityPath, infinityPathLength } from "../../../web/components/infinity-path";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const drawEasing = Easing.bezier(0.45, 0, 0.2, 1);

export function InfinityMark({
  size,
  color,
  draw = false,
  reduceMotion = false,
  onDrawFinished,
}: {
  readonly size: number;
  readonly color: string;
  readonly draw?: boolean;
  readonly reduceMotion?: boolean;
  readonly onDrawFinished?: () => void;
}) {
  const offset = useSharedValue(draw && !reduceMotion ? infinityPathLength : 0);
  const started = useRef(false);
  const signalled = useRef(false);
  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: offset.value,
    };
  });

  const notify = useCallback(() => {
    if (signalled.current) {
      return;
    }
    signalled.current = true;
    if (onDrawFinished === undefined) {
      return;
    }
    onDrawFinished();
  }, [onDrawFinished]);

  useEffect(() => {
    if (!draw || started.current) {
      return;
    }
    started.current = true;
    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are written from effects
      offset.value = 0;
      notify();
      return;
    }
    offset.value = withDelay(
      1000,
      withTiming(
        0,
        {
          duration: 500,
          easing: drawEasing,
          reduceMotion: ReduceMotion.Never,
        },
        (finished) => {
          if (finished !== true) {
            return;
          }
          runOnJS(notify)();
        },
      ),
    );
  }, [draw, notify, offset, reduceMotion]);

  if (!draw) {
    return (
      <Svg accessible={false} height={size} viewBox="0 0 500 500" width={size}>
        <Path
          d={infinityPath}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={54}
        />
      </Svg>
    );
  }

  return (
    <Svg accessible={false} height={size} viewBox="0 0 500 500" width={size}>
      <AnimatedPath
        animatedProps={animatedProps}
        d={infinityPath}
        fill="none"
        stroke={color}
        strokeDasharray={infinityPathLength}
        strokeDashoffset={reduceMotion ? 0 : infinityPathLength}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={54}
      />
    </Svg>
  );
}
