// ============================================================================
// SettingsRow — 설정 화면 단일 행 컴포넌트
// ============================================================================
//
// 5가지 kind(default/toggle/picker/link/action)를 discriminated union으로 표현.
// kind에 따라 우측 컨텐츠와 인터랙션이 결정된다. default 외 모든 kind는
// Pressable로 전체 Row를 탭 영역으로 만든다.
//
// 사용 예:
//   <SettingsRow kind="default" label="버전" value="v1.0.0" />
//   <SettingsRow kind="toggle" label="다크 모드" value={dark} onChange={setDark} />
//   <SettingsRow kind="picker" label="기본 회차" value="1043회" onPress={openPicker} />
//   <SettingsRow kind="link" label="개인정보 처리방침" onPress={openPrivacy} />
//   <SettingsRow kind="action" label="약관 보기" onPress={openTerms} />
//
// [디자인 토큰]
// Row: height 56, padding 16, gap 12
//      bg surface.container (pressed surface.containerHigh)
// Label: typography.bodyBase, color text.primary
// Value: typography.bodyBase, color text.secondary
// 보조 아이콘 (ChevronRight·ExternalLink): 18px, strokeWidth 2, color text.muted
// Toggle: track 44×24 radius.full, handle 20×20 radius.full, padding 2
//   On  — track primary.action / handle primary.onAction (우측)
//   Off — track border.default / handle primary.onAction (좌측)
//
// [Kind별 우측 컨텐츠]
//   default: Value 텍스트만
//   toggle:  Toggle 스위치 (Row 전체 탭이 onChange 트리거)
//   picker:  Value + ChevronRight
//   link:    ExternalLink 아이콘
//   action:  ChevronRight 아이콘
// ============================================================================

import type { StyleProp, ViewStyle } from 'react-native';
import { ChevronRight, ExternalLink } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';

const RowBase = styled.View`
  height: 56px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background-color: ${({ theme }) => theme.colors.surface.container};
`;

const PressableRowBase = styled.Pressable`
  height: 56px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ToggleTrack = styled.View<{ $on: boolean }>`
  width: 44px;
  height: 24px;
  padding: 2px;
  flex-direction: row;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme, $on }) =>
    $on ? theme.colors.primary.action : theme.colors.border.default};
`;

const ToggleHandle = styled.View<{ $on: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary.onAction};
  margin-left: ${({ $on }) => ($on ? 20 : 0)}px;
`;

const PickerRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

type SettingsRowCommon = {
  /** 좌측에 표시되는 본문 라벨. */
  label: string;
  /** Row 컨테이너에 적용할 외부 스타일 override. */
  style?: StyleProp<ViewStyle>;
};

export type SettingsRowProps = SettingsRowCommon &
  (
    | {
        /** 좌측 라벨 + 우측 값 텍스트. 비-인터랙티브. */
        kind: 'default';
        /** 우측에 표시되는 값 (예: 'v1.0.0'). */
        value: string;
      }
    | {
        /** 좌측 라벨 + 우측 토글 스위치. Row 전체 탭으로 onChange 트리거. */
        kind: 'toggle';
        /** 현재 on/off 값. */
        value: boolean;
        onChange: (value: boolean) => void;
      }
    | {
        /** 좌측 라벨 + 우측 값 + ChevronRight. 탭 시 onPress. */
        kind: 'picker';
        /** 현재 선택된 값. */
        value: string;
        onPress: () => void;
      }
    | {
        /** 좌측 라벨 + 우측 ExternalLink 아이콘. 외부 링크 이동용. */
        kind: 'link';
        onPress: () => void;
      }
    | {
        /** 좌측 라벨 + 우측 ChevronRight. 화면 내 진입용. */
        kind: 'action';
        onPress: () => void;
      }
  );

function Toggle({ value }: { value: boolean }) {
  return (
    <ToggleTrack $on={value}>
      <ToggleHandle $on={value} />
    </ToggleTrack>
  );
}

/**
 * 설정 화면 단일 행.
 *
 * 5 kind discriminated union으로 default 외 모든 variant는 Row 전체가 탭 영역.
 *
 * @example
 * <SettingsRow kind="toggle" label="다크 모드" value={dark} onChange={setDark} />
 */
export default function SettingsRow(props: SettingsRowProps) {
  const theme = useTheme();

  const renderRight = () => {
    switch (props.kind) {
      case 'default':
        return (
          <Text variant="bodyBase" color="secondary">
            {props.value}
          </Text>
        );
      case 'toggle':
        return <Toggle value={props.value} />;
      case 'picker':
        return (
          <PickerRight>
            <Text variant="bodyBase" color="secondary">
              {props.value}
            </Text>
            <ChevronRight
              size={18}
              color={theme.colors.text.muted}
              strokeWidth={2}
            />
          </PickerRight>
        );
      case 'link':
        return (
          <ExternalLink
            size={18}
            color={theme.colors.text.muted}
            strokeWidth={2}
          />
        );
      case 'action':
        return (
          <ChevronRight
            size={18}
            color={theme.colors.text.muted}
            strokeWidth={2}
          />
        );
    }
  };

  const labelEl = <Text variant="bodyBase">{props.label}</Text>;

  if (props.kind === 'default') {
    return (
      <RowBase style={props.style}>
        {labelEl}
        {renderRight()}
      </RowBase>
    );
  }

  const handlePress = () => {
    if (props.kind === 'toggle') {
      props.onChange(!props.value);
    } else {
      props.onPress();
    }
  };

  const accessibilityRole =
    props.kind === 'toggle'
      ? 'switch'
      : props.kind === 'link'
        ? 'link'
        : 'button';

  return (
    <PressableRowBase
      onPress={handlePress}
      accessibilityRole={accessibilityRole}
      accessibilityState={
        props.kind === 'toggle' ? { checked: props.value } : undefined
      }
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? theme.colors.surface.containerHigh
            : theme.colors.surface.container,
        },
        props.style,
      ]}
    >
      {labelEl}
      {renderRight()}
    </PressableRowBase>
  );
}
