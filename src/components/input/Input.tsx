// ============================================================================
// Input — 라벨/필드/헬퍼 텍스트를 갖는 단일 행 입력 컴포넌트
// ============================================================================
//
// 4가지 상태(default/focus/error/disabled)를 단일 컴포넌트에서 표현한다.
// focus는 TextInput의 onFocus/onBlur로 내부 useState가 자동 토글하며,
// error prop이 제공되면 focus보다 우선해 error 상태로 잠긴다.
//
// 사용 예:
//   <Input
//     label="회차 번호"
//     placeholder="회차를 입력하세요"
//     helper="조회할 로또 회차를 입력하세요."
//     value={value}
//     onChangeText={setValue}
//   />
//
//   <Input label="회차 번호" error="유효하지 않은 회차입니다" />
//
//   <Input label="회차 번호" disabled />
//
//   <Input label="회차 번호" showHelper={false} />
//
// [디자인 토큰]
// Container: 자식 gap 6 (label·field·helper 간격)
// Field: height 44, borderRadius radius.base(8),
//        bg surface.containerLowest, paddingHorizontal 12
// Label: typography.labelMd, color text.secondary (disabled은 text.muted)
// Value: typography.bodyBase, color text.primary (disabled은 text.muted),
//        placeholder 색은 항상 text.muted
// Helper: typography.bodySm, color text.muted (error 상태는 state.error)
//
// [상태별 보더]
// default/disabled: border.subtle 1px
// focus:           primary.action 2px
// error:           state.error 1px
//
// [Focus 시 layout shift 방지]
// 1px → 2px로 두꺼워질 때 paddingHorizontal을 12 → 11로 보정해
// 컨텐츠 시작 위치가 동일하게 유지된다(1+12 = 2+11 = 13).
// height는 44 고정이고 align-items: center로 수직 중앙 정렬이므로
// 세로 보정은 불필요.
// ============================================================================

import { forwardRef, useState } from 'react';
import { TextInput } from 'react-native';
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';

export type InputState =
  /** 비편집 + 보더 1px subtle */
  | 'default'
  /** 편집 중 + 보더 2px primary.action */
  | 'focus'
  /** error prop 활성 + 보더 1px state.error */
  | 'error'
  /** editable=false + Label/Value/Helper 모두 muted */
  | 'disabled';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** 라벨 텍스트. 생략 시 라벨 행이 렌더되지 않는다. */
  label?: string;
  /** 제어 컴포넌트로 쓸 때 현재 값. */
  value?: string;
  /** 값이 비어있을 때 표시되는 안내 텍스트. */
  placeholder?: string;
  /** 필드 아래 보조 설명. error가 있으면 error 메시지가 우선. */
  helper?: string;
  /**
   * 헬퍼 행 렌더링 여부. false면 helper/error 유무와 무관하게 행 자체가 사라진다.
   * @default true
   */
  showHelper?: boolean;
  /** 에러 메시지. 존재하면 error 상태로 잠기며 헬퍼 위치에 표시된다. */
  error?: string;
  /** true면 입력 불가 + Label/Value/Helper 모두 muted. */
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  style?: StyleProp<ViewStyle>;
}

const Container = styled.View`
  gap: 6px;
`;

const Field = styled.View<{ $state: InputState }>`
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.base}px;
  background-color: ${({ theme }) => theme.colors.surface.containerLowest};
  flex-direction: row;
  align-items: center;
  border-width: ${({ $state }) => ($state === 'focus' ? 2 : 1)}px;
  border-color: ${({ theme, $state }) => {
    if ($state === 'focus') return theme.colors.primary.action;
    if ($state === 'error') return theme.colors.state.error;
    return theme.colors.border.subtle;
  }};
  padding-left: ${({ $state }) => ($state === 'focus' ? 11 : 12)}px;
  padding-right: ${({ $state }) => ($state === 'focus' ? 11 : 12)}px;
`;


/**
 * 라벨 + 필드 + 헬퍼 텍스트를 갖는 단일 행 입력.
 *
 * focus는 내부에서 자동 관리되며, error prop이 있으면 focus보다 우선.
 * showHelper=false 시 헬퍼 행 자체가 렌더되지 않아 전체 height가 줄어든다.
 *
 * @example
 * <Input label="회차 번호" placeholder="회차를 입력하세요"
 *   helper="조회할 로또 회차를 입력하세요." />
 *
 * @example
 * <Input label="회차 번호" error="유효하지 않은 회차입니다" />
 */
const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    value,
    placeholder,
    helper,
    showHelper = true,
    error,
    disabled = false,
    onChangeText,
    style,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const state: InputState = disabled
    ? 'disabled'
    : error
      ? 'error'
      : isFocused
        ? 'focus'
        : 'default';

  const helperText = error ?? helper;
  const shouldRenderHelper = showHelper && helperText !== undefined;
  const helperStyleOverride =
    state === 'error' ? { color: theme.colors.state.error } : undefined;

  const fieldInputStyle: TextStyle = {
    flex: 1,
    fontFamily: theme.typography.bodyBase.fontFamily,
    fontSize: theme.typography.bodyBase.fontSize,
    fontWeight: theme.typography.bodyBase.fontWeight,
    lineHeight: 18,
    color: disabled ? theme.colors.text.muted : theme.colors.text.primary,
    padding: 0,
    includeFontPadding: false,
  };

  return (
    <Container style={style}>
      {label !== undefined && (
        <Text variant="labelMd" color={disabled ? 'muted' : 'secondary'}>
          {label}
        </Text>
      )}
      <Field $state={state}>
        <TextInput
          {...rest}
          ref={ref}
          style={fieldInputStyle}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.muted}
          selectionColor={theme.colors.primary.action}
          editable={!disabled}
          onChangeText={onChangeText}
          onFocus={e => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            onBlur?.(e);
          }}
        />
      </Field>
      {shouldRenderHelper && (
        <Text variant="bodySm" color="muted" style={helperStyleOverride}>
          {helperText}
        </Text>
      )}
    </Container>
  );
});

export default Input;
