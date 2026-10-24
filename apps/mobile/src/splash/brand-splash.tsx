import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { InfinityMark } from "@/splash/infinity-mark";
import { useTheme } from "@/theme/theme";

const markSize = 148;

export function BrandSplash({
  sessionReady,
  onFinished,
}: {
  readonly sessionReady: boolean;
  readonly onFinished: () => void;
}) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [drawn, setDrawn] = useState(false);
  const dismissed = useRef(false);
  const opacity = useSharedValue(1);
  const veil = useAnimatedStyle(() => {
    return { opacity: opacity.value };
  });
  const markDrawn = useCallback(() => {
    setDrawn(true);
  }, []);

  useEffect(() => {
    let active = true;
    const apply = (enabled: boolean) => {
      if (!active) {
        return;
      }
      setReduceMotion(enabled);
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(apply);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", apply);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!drawn || !sessionReady || reduceMotion === null || dismissed.current) {
      return;
    }
    dismissed.current = true;
    if (reduceMotion) {
      onFinished();
      return;
    }
    opacity.value = withTiming(
      0,
      {
        duration: 360,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.Never,
      },
      (finished) => {
        if (finished !== true) {
          return;
        }
        runOnJS(onFinished)();
      },
    );
  }, [drawn, onFinished, opacity, reduceMotion, sessionReady]);

  const mark =
    reduceMotion === null ? (
      <View style={styles.markSlot} />
    ) : (
      <InfinityMark
        color={colors.foreground}
        draw
        onDrawFinished={markDrawn}
        reduceMotion={reduceMotion}
        size={markSize}
      />
    );

  return (
    <Animated.View
      accessibilityViewIsModal
      pointerEvents="auto"
      style={[styles.veil, { backgroundColor: colors.background }, veil]}
    >
      <View style={styles.center}>
        <View style={styles.block}>
          {mark}
          <Text style={[styles.title, { color: colors.foreground }]}>Data Structures and Algorithms</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFill,
    elevation: 20,
    zIndex: 20,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  block: {
    alignItems: "center",
    gap: 28,
    maxWidth: 360,
  },
  markSlot: {
    height: markSize,
    width: markSize,
  },
  title: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 34,
    textAlign: "center",
  },
});
