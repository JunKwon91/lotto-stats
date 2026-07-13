// ============================================================================
// AnimatedSplash — 스플래시 막대 성장 애니메이션 (정적 스플래시 인계)
// ============================================================================
//
// 네이티브 정적 스플래시(react-native-bootsplash)를 이어받아, 로고의 막대 5개가
// 바닥에서 순차로 차오른 뒤 페이드아웃하며 앱으로 넘어간다. 배경·로고 크기(100)는
// 정적 스플래시(manifest #16191f / 100×100 중앙)와 맞춰 인계 시 튀지 않게 한다.
// 로고는 app-logo.svg 기하를 그대로 재구성하되 막대만 애니메이션한다
// ============================================================================

import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

// 정적 스플래시와 동일한 배경·로고 크기 (인계 정합용 상수)
const SPLASH_BG = '#16191F';
const LOGO_SIZE = 100;

// 막대 타이밍 — 왼쪽부터 stagger, 총 ~1.7초에 마무리
const BAR_DURATION = 440;
const DELAYS = [0, 150, 300, 450, 600];
const HOLD = 340;
const FADE_OUT = 320;

interface Bar {
  x: number;
  y: number;
  h: number;
  color: string;
}

// app-logo.svg의 막대 5개(width 2.8·rx 1.4·밑변 y+h≈23.8, 오름차순 높이)
const BARS: Bar[] = [
  { x: 4.76, y: 14.0, h: 9.8, color: '#FBBF24' },
  { x: 8.68, y: 11.2002, h: 12.6, color: '#3B82F6' },
  { x: 12.6, y: 8.40039, h: 15.4, color: '#EF4444' },
  { x: 16.52, y: 6.44043, h: 17.36, color: '#94A3B8' },
  { x: 20.44, y: 4.75977, h: 19.04, color: '#22C55E' },
];
const BAR_W = 2.8;
const BAR_R = 1.4;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// 막대 하나 — 밑변 고정, height를 0→제높이로 키우며 위로 자란다
function GrowBar({ bar, delay }: { bar: Bar; delay: number }) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(
      delay,
      withTiming(1, { duration: BAR_DURATION, easing: Easing.out(Easing.cubic) }),
    );
  }, [p, delay]);

  const animatedProps = useAnimatedProps(() => {
    const baseline = bar.y + bar.h;
    const h = bar.h * p.value;
    return { height: h, y: baseline - h };
  });

  return (
    <AnimatedRect
      x={bar.x}
      width={BAR_W}
      rx={BAR_R}
      fill={bar.color}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export interface AnimatedSplashProps {
  /** 애니메이션·페이드아웃이 끝나면 호출 (오버레이 제거) */
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    // 오버레이가 화면을 덮은 상태이므로 정적 스플래시를 즉시 감춘다(무페이드 인계)
    BootSplash.hide();

    const total = DELAYS[DELAYS.length - 1] + BAR_DURATION + HOLD;
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: FADE_OUT }, finished => {
        if (finished) runOnJS(onFinish)();
      });
    }, total);

    return () => clearTimeout(timer);
  }, [opacity, onFinish]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox="0 0 28 28">
        <Defs>
          <LinearGradient
            id="splashBg"
            x1="14"
            y1="0"
            x2="14"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#1E2638" />
            <Stop offset="1" stopColor="#101728" />
          </LinearGradient>
          <RadialGradient
            id="splashGlow"
            cx="8.4"
            cy="2.8"
            r="33.6"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#3C82F6" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#3C82F6" stopOpacity="0" />
          </RadialGradient>
          <ClipPath id="splashClip">
            <Rect width="28" height="28" rx="6.3" />
          </ClipPath>
        </Defs>
        <G clipPath="url(#splashClip)">
          <Rect width="28" height="28" rx="6.3" fill="url(#splashBg)" />
          <Circle cx="8.4" cy="2.8" r="16.8" fill="url(#splashGlow)" />
          {BARS.map((bar, i) => (
            <GrowBar key={bar.color} bar={bar} delay={DELAYS[i]} />
          ))}
          <Circle cx="21.84" cy="3.36016" r="0.7" fill="white" />
        </G>
      </Svg>
    </Animated.View>
  );
}
