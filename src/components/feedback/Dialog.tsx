// ============================================================================
// Dialog — 모달 다이얼로그 시각 컴포넌트
// ============================================================================
//
// 큐잉·백드롭·애니메이션·키보드 처리는 DialogHost가 담당. 본 컴포넌트는
// ToastConfig를 받아 카드 내부 시각만 렌더한다 (presentational).
//
// [디자인 토큰]
// 카드: padding 24, gap 16, radius 16, bg surface.container
//   width는 DialogHost가 결정 (min(screen-32, 360))
// Title: headlineSm (Manrope SemiBold 17/22), text.primary
// Description: bodySm (Inter Regular 14/20), text.secondary
// 버튼 행 (gap 12, HORIZONTAL):
//   Cancel — Button variant='secondary', flex 1
//   Confirm — Button variant='primary' (또는 'destructive'), flex 1
// Info variant — 단일 fullWidth Button만
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import styled from 'styled-components/native';

import Button from '@/components/action/Button';
import Input from '@/components/input/Input';
import Text from '@/components/primitives/Text';
import type { DialogConfig } from '@/stores/dialogStore';

export interface DialogProps {
  config: DialogConfig;
  /** 사용자 선택 결과를 store로 전달 — DialogHost가 dismiss 호출. */
  onResolve: (value: unknown) => void;
}

const Card = styled.View`
  padding: 24px;
  gap: 16px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface.container};
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const ButtonCell = styled.View`
  flex: 1;
`;

/**
 * Prompt 자동 포커스 지연 (ms). DialogHost enter 애니메이션(200ms) +
 * KAV layout 안정화 여유. 너무 짧으면 RN의 KAV+autoFocus+Animated 충돌로
 * 카드가 표시되지 않은 채 키보드만 올라오는 이슈 발생.
 */
const PROMPT_FOCUS_DELAY = 300;

export default function Dialog({ config, onResolve }: DialogProps) {
  const [inputValue, setInputValue] = useState(
    config.variant === 'prompt' ? (config.defaultValue ?? '') : '',
  );
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (config.variant !== 'prompt') return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, PROMPT_FOCUS_DELAY);
    return () => clearTimeout(timer);
  }, [config.variant, config.id]);

  const cancelLabel =
    config.variant !== 'info' ? (config.cancelLabel ?? '취소') : '';
  const confirmLabel = config.confirmLabel ?? '확인';

  return (
    <Card>
      <View>
        <Text variant="headlineSm" color="primary">
          {config.title}
        </Text>
        {config.description !== undefined && (
          <Text
            variant="bodySm"
            color="secondary"
            style={{ marginTop: 4 }}
          >
            {config.description}
          </Text>
        )}
      </View>

      {config.variant === 'prompt' && (
        <Input
          ref={inputRef}
          value={inputValue}
          placeholder={config.placeholder}
          onChangeText={setInputValue}
        />
      )}

      {config.variant === 'info' ? (
        <Button
          label={confirmLabel}
          variant="primary"
          fullWidth
          onPress={() => onResolve(undefined)}
        />
      ) : (
        <ButtonRow>
          <ButtonCell>
            <Button
              label={cancelLabel}
              variant="secondary"
              fullWidth
              onPress={() =>
                onResolve(config.variant === 'prompt' ? null : false)
              }
            />
          </ButtonCell>
          <ButtonCell>
            <Button
              label={confirmLabel}
              variant={
                config.variant === 'confirm' && config.destructive
                  ? 'destructive'
                  : 'primary'
              }
              fullWidth
              onPress={() =>
                onResolve(config.variant === 'prompt' ? inputValue : true)
              }
            />
          </ButtonCell>
        </ButtonRow>
      )}
    </Card>
  );
}
