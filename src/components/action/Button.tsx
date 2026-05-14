// ============================================================================
// Button — 액션 버튼
// ============================================================================
//
// 화면 내 명시적 액션(저장·확인·다시 시도 등)을 트리거하는 컴포넌트.
//
// 사용 예:
//   // 기본 primary 버튼
//   <Button label="저장" onPress={handleSave} />
//
//   // secondary + sm
//   <Button label="취소" variant="secondary" size="sm" onPress={handleCancel} />
//
//   // disabled + loading (loading은 자동으로 onPress 차단)
//   <Button label="제출 중" loading onPress={handleSubmit} />
//
//   // 아이콘 포함
//   <Button label="새로고침" leftIcon={<RefreshIcon />} onPress={refresh} />
//
//   // 전체 폭
//   <Button label="다음" fullWidth onPress={next} />
//
// [디자인 토큰]
// Size:
//   - sm: height 32, padding 12, fontSize 14 (bodySm)
//   - md: height 40, padding 16, fontSize 16 (bodyBase)
//   - lg: height 48, padding 20, fontSize 17 (headlineSm)
// radius: theme.radius.base (8)
// Variant:
//   - primary:     bg theme.colors.primary.action, text theme.colors.primary.onAction
//   - secondary:   bg transparent, border 1px theme.colors.border.strong,
//                  text theme.colors.text.secondary
//   - destructive: bg theme.colors.state.error, text 흰색 (Dialog confirm 삭제 등)
//
// [상태]
// disabled: opacity 0.4 + onPress 차단
// loading:  ActivityIndicator 표시 + onPress 차단 (label 숨김)
// pressed:  opacity 0.7 (탭 다운 시 시각 피드백)
// ============================================================================

import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import type {
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';
import type { TextVariant } from '@/components/primitives/Text';

export type ButtonVariant =
  /** 진한 배경 + 밝은 텍스트 (메인 액션) */
  | 'primary'
  /** 투명 배경 + 보더 + secondary 텍스트 (보조 액션) */
  | 'secondary'
  /** state.error 배경 + 흰 텍스트 (삭제·되돌릴 수 없는 액션) */
  | 'destructive';

export type ButtonSize =
  /** 높이 32 · padding 12 · 14px 텍스트 */
  | 'sm'
  /** 높이 40 · padding 16 · 16px 텍스트 */
  | 'md'
  /** 높이 48 · padding 20 · 17px 텍스트 */
  | 'lg';

export interface ButtonProps {
  /** 버튼 라벨. */
  label: string;
  /**
   * 버튼 스타일.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * 버튼 크기.
   * @default 'md'
   */
  size?: ButtonSize;
  /** true면 탭이 차단되고 opacity 0.4로 흐려진다. */
  disabled?: boolean;
  /** true면 ActivityIndicator를 표시하고 탭을 차단한다. label은 숨김. */
  loading?: boolean;
  /** label 좌측 아이콘. 권장 크기 — sm 14px / md 16px / lg 18px. */
  leftIcon?: ReactNode;
  /** 부모 폭을 가득 채운다. */
  fullWidth?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  /** 시각적 라벨이 부족할 때 보조 라벨 제공. */
  accessibilityLabel?: string;
}

const SIZE_HEIGHT: Record<ButtonSize, number> = { sm: 32, md: 40, lg: 48 };
const SIZE_HPAD: Record<ButtonSize, number> = { sm: 12, md: 16, lg: 20 };
const SIZE_GAP: Record<ButtonSize, number> = { sm: 6, md: 8, lg: 10 };
const SIZE_TEXT: Record<ButtonSize, TextVariant> = {
  sm: 'bodySm',
  md: 'bodyBase',
  lg: 'headlineSm',
};

/**
 * 액션 버튼.
 *
 * 2 variant(primary/secondary) × 3 size(sm/md/lg). disabled/loading 상태는
 * 탭을 차단하고, pressed 상태에서는 opacity 0.7로 시각 피드백을 준다.
 *
 * @example
 * <Button label="저장" onPress={handleSave} />
 *
 * @example
 * <Button label="취소" variant="secondary" size="sm" onPress={handleCancel} />
 */
export default function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  fullWidth = false,
  onPress,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useTheme();
  const blocked = disabled || loading;
  const textVariant = SIZE_TEXT[size];

  const spinnerColor =
    variant === 'primary'
      ? theme.colors.primary.onAction
      : variant === 'destructive'
        ? '#FFFFFF'
        : theme.colors.text.secondary;

  const computeStyle = ({
    pressed,
  }: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: SIZE_HEIGHT[size],
      paddingHorizontal: SIZE_HPAD[size],
      gap: SIZE_GAP[size],
      borderRadius: theme.radius.base,
    };
    if (fullWidth) base.alignSelf = 'stretch';
    if (variant === 'primary') {
      base.backgroundColor = theme.colors.primary.action;
    } else if (variant === 'destructive') {
      base.backgroundColor = theme.colors.state.error;
    } else {
      base.borderWidth = 1;
      base.borderColor = theme.colors.border.strong;
    }
    if (blocked) {
      base.opacity = 0.4;
    } else if (pressed) {
      base.opacity = 0.7;
    }
    return [base, style];
  };

  return (
    <Pressable
      style={computeStyle}
      disabled={blocked}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <>
          {leftIcon}
          {variant === 'primary' ? (
            <Text
              variant={textVariant}
              style={{ color: theme.colors.primary.onAction }}
            >
              {label}
            </Text>
          ) : variant === 'destructive' ? (
            <Text variant={textVariant} style={{ color: '#FFFFFF' }}>
              {label}
            </Text>
          ) : (
            <Text variant={textVariant} color="secondary">
              {label}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
}
