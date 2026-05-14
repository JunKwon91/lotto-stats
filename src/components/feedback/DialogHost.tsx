// ============================================================================
// DialogHost — Dialog 백드롭·애니메이션·키보드 호스트
// ============================================================================
//
// App 루트에 단 1회만 마운트. useDialogStore.displayed를 구독해 그 변화에
// 따라 backdrop fade + card fade·scale 애니메이션을 트리거.
//
// 백드롭 탭 동작은 variant별 차등:
//   info     → confirm 결과(undefined)로 닫기
//   confirm  → 취소(false)로 닫기
//   prompt   → 무시 (입력 보호)
//
// Prompt variant는 KeyboardAvoidingView로 키보드 표시 시 카드가 위로 밀린다.
// ============================================================================

import { useEffect, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import styled from 'styled-components/native';

import { useDialogStore, type DialogConfig } from '@/stores/dialogStore';
import Dialog from './Dialog';

const ENTER_DURATION = 200;
const EXIT_DURATION = 150;
const QUEUE_GAP = 100;
const HORIZONTAL_MARGIN = 16;
const MAX_WIDTH = 360;

const Backdrop = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.overlay.scrim};
`;

const Center = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

function backdropFallback(variant: DialogConfig['variant']): unknown {
  if (variant === 'prompt') return null;
  if (variant === 'confirm') return false;
  return undefined;
}

export default function DialogHost() {
  const displayed = useDialogStore((s) => s.displayed);
  const dismiss = useDialogStore((s) => s.dismiss);
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth - HORIZONTAL_MARGIN * 2, MAX_WIDTH);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  const animateExit = (after: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(after, QUEUE_GAP);
    });
  };

  useEffect(() => {
    if (!displayed) return;
    backdropOpacity.setValue(0);
    cardOpacity.setValue(0);
    cardScale.setValue(0.95);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed?.id]);

  if (!displayed) return null;

  const handleResolve = (value: unknown) => {
    animateExit(() => dismiss(displayed.id, value));
  };

  const handleBackdropPress = () => {
    if (displayed.variant === 'prompt') return; // 무시
    handleResolve(backdropFallback(displayed.variant));
  };

  return (
    <>
      <Backdrop style={{ opacity: backdropOpacity }}>
        <Pressable style={{ flex: 1 }} onPress={handleBackdropPress} />
      </Backdrop>
      <KeyboardAvoidingView
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        pointerEvents="box-none"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Center pointerEvents="box-none">
          <Animated.View
            style={{
              width: cardWidth,
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            }}
          >
            <Dialog config={displayed} onResolve={handleResolve} />
          </Animated.View>
        </Center>
      </KeyboardAvoidingView>
    </>
  );
}
