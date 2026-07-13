// ============================================================================
// NumberPicker — 1~45 번호 선택 그리드
// ============================================================================
//
// 5열 × 9행으로 1~45 번호를 LottoBall로 깔고, 탭으로 선택/해제한다. 선택된 번호는
// 링(accent 테두리)으로 표시한다. LottoBall 자체엔 선택 상태가 없어, 여기서 볼을
// 감싸는 래퍼에 링을 둔다(볼 컴포넌트는 그대로 재사용). max개까지만 추가되고, 해제는
// 항상 가능하다(선택 상태는 소비처가 관리)
// ============================================================================

import styled from 'styled-components/native';

import { LottoBall } from './LottoBall';

const NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

export interface NumberPickerProps {
  /** 현재 선택된 번호들 */
  selected: number[];
  /** 번호 탭 시 호출 (선택 추가 또는 해제) */
  onToggle: (n: number) => void;
  /** 최대 선택 개수 @default 6 */
  max?: number;
}

const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const Cell = styled.Pressable`
  width: 20%;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

// 선택 링 — 미선택도 같은 두께의 투명 테두리를 둬 셀 크기를 고정한다
const Ring = styled.View<{ $selected: boolean }>`
  padding: 2px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  border-width: 2px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary.action : 'transparent'};
`;

export function NumberPicker({ selected, onToggle, max = 6 }: NumberPickerProps) {
  const handlePress = (n: number) => {
    // 이미 선택된 번호는 언제나 해제 가능, 새 선택은 max 미만일 때만
    if (selected.includes(n) || selected.length < max) onToggle(n);
  };

  return (
    <Grid>
      {NUMBERS.map(n => {
        const isSelected = selected.includes(n);
        return (
          <Cell
            key={n}
            onPress={() => handlePress(n)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`번호 ${n}`}
          >
            <Ring $selected={isSelected}>
              <LottoBall number={n} size="md" />
            </Ring>
          </Cell>
        );
      })}
    </Grid>
  );
}
