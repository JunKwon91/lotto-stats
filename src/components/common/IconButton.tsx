// ============================================================================
// IconButton — 아이콘 전용 버튼
// ============================================================================
//
// TopAppBar의 설정 아이콘, 즐겨찾기 토글, Back arrow 등 아이콘만으로 액션을
// 트리거하는 경우 사용. accessibilityLabel을 필수 prop으로 받아 스크린리더
// 지원을 강제한다.
//
// 사용 예:
//   <IconButton
//     icon={<Settings />}
//     accessibilityLabel="설정"
//     onPress={openSettings}
//   />
//
//   <IconButton
//     icon={<ChevronLeft />}
//     color="primary"
//     accessibilityLabel="뒤로 가기"
//     onPress={goBack}
//   />
//
// [디자인 토큰]
// 컨테이너 size:
//   - sm: 24×24 (헤더 보조 아이콘)
//   - md: 32×32 (일반 아이콘 버튼) — default
//   - lg: 44×44 (Apple HIG 권장 hit area)
// 권장 아이콘 size (cloneElement로 자동 주입, 호출처 override 가능):
//   - sm: 16
//   - md: 20
//   - lg: 24
// color: text.primary / text.secondary / text.muted / primary.action
//
// [a11y]
// `accessibilityLabel`은 필수. 아이콘만 있는 버튼은 시각 정보가 없으므로
// 스크린리더 사용자에게 의미를 전달할 라벨이 항상 있어야 한다.
// ============================================================================

import { cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import type {
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'styled-components/native';

export type IconButtonSize =
  /** 24×24 컨테이너 · 아이콘 16px 권장 */
  | 'sm'
  /** 32×32 컨테이너 · 아이콘 20px 권장 (기본값) */
  | 'md'
  /** 44×44 컨테이너 · 아이콘 24px 권장 (Apple HIG hit area) */
  | 'lg';

export type IconButtonColor =
  /** text.primary · 본문 위 강조 아이콘 */
  | 'primary'
  /** text.secondary · 헤더 보조 아이콘 (기본값) */
  | 'secondary'
  /** text.muted · 비활성 톤 */
  | 'muted'
  /** primary.action · 강조 액션 아이콘 */
  | 'accent';

export interface IconButtonProps {
  /** 렌더할 아이콘 (lucide-react-native 등). color/size를 명시하지 않으면 IconButton이 자동 주입. */
  icon: ReactNode;
  /**
   * 컨테이너 크기.
   * @default 'md'
   */
  size?: IconButtonSize;
  /**
   * 아이콘 색상 — theme.colors 토큰 매핑.
   * @default 'secondary'
   */
  color?: IconButtonColor;
  /** true면 탭이 차단되고 opacity 0.4로 흐려진다. */
  disabled?: boolean;
  /** 스크린리더가 읽을 라벨 — 시각 정보가 없는 버튼이라 필수. */
  accessibilityLabel: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const CONTAINER_SIZE: Record<IconButtonSize, number> = {
  sm: 24,
  md: 32,
  lg: 44,
};
const ICON_SIZE: Record<IconButtonSize, number> = { sm: 16, md: 20, lg: 24 };

/**
 * 아이콘만 가지는 액션 버튼.
 *
 * 3 size(sm/md/lg) × 4 color(primary/secondary/muted/accent) 매트릭스.
 * `cloneElement`로 lucide 등의 아이콘에 color/size를 자동 주입하며,
 * 호출처가 명시적으로 prop을 주면 그 값이 우선한다.
 *
 * @example
 * <IconButton
 *   icon={<Settings />}
 *   accessibilityLabel="설정"
 *   onPress={openSettings}
 * />
 */
export default function IconButton({
  icon,
  size = 'md',
  color = 'secondary',
  disabled = false,
  accessibilityLabel,
  onPress,
  style,
}: IconButtonProps) {
  const theme = useTheme();

  const colorMap: Record<IconButtonColor, string> = {
    primary: theme.colors.text.primary,
    secondary: theme.colors.text.secondary,
    muted: theme.colors.text.muted,
    accent: theme.colors.primary.action,
  };

  const enhancedIcon = isValidElement<{ color?: string; size?: number }>(icon)
    ? cloneElement(icon, {
        color: icon.props.color ?? colorMap[color],
        size: icon.props.size ?? ICON_SIZE[size],
      })
    : icon;

  const computeStyle = ({
    pressed,
  }: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const base: ViewStyle = {
      width: CONTAINER_SIZE[size],
      height: CONTAINER_SIZE[size],
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    };
    if (disabled) {
      base.opacity = 0.4;
    } else if (pressed) {
      base.opacity = 0.7;
    }
    return [base, style];
  };

  return (
    <Pressable
      style={computeStyle}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel}
    >
      {enhancedIcon}
    </Pressable>
  );
}
