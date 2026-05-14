// ============================================================================
// ToastHost — 단일 Toast 렌더링·애니메이션·큐잉 호스트
// ============================================================================
//
// App 루트에 단 1회만 마운트. useToastStore.displayed를 구독해 그 변화에
// 따라 enter/exit Animated를 트리거하고 duration 종료 시 자동 dismiss.
//
// 큐 처리는 store가 담당 — ToastHost는 항상 displayed 1개만 렌더한다.
//
// 위치: 화면 하단 가운데. safe area 또는 키보드 높이 위 16px 여백.
// 너비: 화면 폭 − 32 (좌우 16 여백), 최대 400 (iPad·태블릿 대응).
// pointerEvents='box-none' — Toast 외 영역 터치 통과.
// ============================================================================

import { useEffect, useRef } from 'react';
import { Animated, Keyboard, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useToastStore } from '@/stores/toastStore';
import Toast from './Toast';

const DEFAULT_DURATION = 3000;
const ENTER_DURATION = 250;
const EXIT_DURATION = 200;
const QUEUE_GAP = 100;
const HORIZONTAL_MARGIN = 16;
const MAX_WIDTH = 400;

const Host = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
`;

export default function ToastHost() {
  const displayed = useToastStore((s) => s.displayed);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const toastWidth = Math.min(screenWidth - HORIZONTAL_MARGIN * 2, MAX_WIDTH);

  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e) => {
      keyboardOffset.setValue(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      keyboardOffset.setValue(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  const animateExit = (after: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 50,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(after, QUEUE_GAP);
    });
  };

  useEffect(() => {
    if (!displayed) {
      return;
    }
    translateY.setValue(50);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }),
    ]).start();

    const duration = displayed.duration ?? DEFAULT_DURATION;
    if (duration === 0) {
      return;
    }
    const timer = setTimeout(() => {
      animateExit(dismiss);
    }, duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed?.id]);

  if (!displayed) {
    return null;
  }

  const bottomPadding = insets.bottom + 16;

  return (
    <Host pointerEvents="box-none">
      <Animated.View
        style={{
          width: toastWidth,
          paddingBottom: bottomPadding,
          transform: [
            { translateY },
            {
              translateY: keyboardOffset.interpolate({
                inputRange: [0, 1000],
                outputRange: [0, -1000],
              }),
            },
          ],
          opacity,
        }}
      >
        <Toast config={displayed} onDismiss={() => animateExit(dismiss)} />
      </Animated.View>
    </Host>
  );
}
