// ============================================================================
// FavoriteAddScreen — 직접 번호 추가 (즐겨찾기 서브)
// ============================================================================
//
// 1~45에서 6개를 골라 조합을 저장한다. { id }로 진입하면 기존 항목을 불러와 수정,
// 없으면 신규 저장(source: manual). 저장 후 Favorites 목록으로 복귀한다.
// 없는 id로 들어오면 신규처럼 처리한다(안전)
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import { RotateCcw } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Input } from '@/components/input';
import { SubHeader } from '@/components/layout';
import { LottoBall, NumberPicker } from '@/components/lotto';
import { Text } from '@/components/primitives';
import { Card, Screen } from '@/components/surface';
import type { FavoriteAddScreenProps } from '@/navigation/types';
import { useFavoritesStore } from '@/stores/favoritesStore';

const PICK = 6;
const MEMO_MAX = 30;

const asc = (nums: number[]) => [...nums].sort((a, b) => a - b);

const SaveButton = styled.Pressable`
  padding: ${({ theme }) => theme.spacing.xs}px;
`;

const PreviewHead = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ResetButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const PreviewBalls = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

// 빈 슬롯 — 아직 안 채워진 자리를 점선 원으로
const EmptySlot = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border-width: 2px;
  border-style: dashed;
  border-color: ${({ theme }) => theme.colors.border.default};
`;

const Section = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const MemoHead = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export default function FavoriteAddScreen({ route }: FavoriteAddScreenProps) {
  const theme = useTheme();
  const navigation = useNavigation();

  const items = useFavoritesStore(s => s.items);
  const add = useFavoritesStore(s => s.add);
  const update = useFavoritesStore(s => s.update);

  // { id }로 진입 시 기존 항목. 못 찾으면(삭제됐거나 잘못된 id) 신규로 처리
  const editId = route.params?.id;
  const existing = editId ? items.find(it => it.id === editId) : undefined;

  const [selected, setSelected] = useState<number[]>(
    existing ? existing.numbers : [],
  );
  const [memo, setMemo] = useState(existing?.memo ?? '');

  const canSave = selected.length === PICK;

  const toggle = (n: number) => {
    setSelected(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n],
    );
  };

  const reset = () => setSelected([]);

  const handleSave = () => {
    if (!canSave) return;
    const trimmed = memo.trim();
    if (existing) {
      // 편집 — 번호·메모만 갱신(출처·저장시각은 유지). 빈 메모는 ''로 지워짐
      update(existing.id, { numbers: selected, memo: trimmed });
    } else {
      add({
        numbers: selected,
        memo: trimmed.length > 0 ? trimmed : undefined,
        source: { kind: 'manual' },
      });
    }
    navigation.goBack();
  };

  const ordered = asc(selected);
  const emptyCount = PICK - selected.length;

  return (
    <Screen edges={['top']} padded={false}>
      <SubHeader
        title={existing ? '번호 조합 수정' : '직접 번호 추가'}
        right={
          <SaveButton
            accessibilityRole="button"
            accessibilityLabel="저장"
            accessibilityState={{ disabled: !canSave }}
            disabled={!canSave}
            hitSlop={8}
            onPress={handleSave}
          >
            <Text variant="labelLg" color={canSave ? 'accent' : 'muted'}>
              저장
            </Text>
          </SaveButton>
        }
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.containerMargin,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 선택 미리보기 */}
        <Card variant="filled">
          <PreviewHead>
            <Text variant="bodyBase">{selected.length} / {PICK} 선택</Text>
            <ResetButton
              accessibilityRole="button"
              accessibilityLabel="초기화"
              hitSlop={6}
              onPress={reset}
            >
              <RotateCcw size={14} color={theme.colors.text.muted} />
              <Text variant="bodySm" color="muted">
                초기화
              </Text>
            </ResetButton>
          </PreviewHead>
          <PreviewBalls>
            {ordered.map(n => (
              <LottoBall key={n} number={n} size="md" />
            ))}
            {Array.from({ length: emptyCount }, (_, i) => (
              <EmptySlot key={`empty-${i}`} />
            ))}
          </PreviewBalls>
        </Card>

        {/* 번호 선택 그리드 */}
        <Section>
          <Text variant="headlineMd">번호 선택</Text>
          <NumberPicker selected={selected} onToggle={toggle} max={PICK} />
        </Section>

        {/* 메모 */}
        <Section>
          <MemoHead>
            <Text variant="labelLg" color="secondary">
              메모 (선택사항)
            </Text>
            <Text variant="bodySm" color="muted">
              {memo.length} / {MEMO_MAX}
            </Text>
          </MemoHead>
          <Input
            value={memo}
            onChangeText={setMemo}
            placeholder="이 조합에 대한 메모..."
            maxLength={MEMO_MAX}
          />
        </Section>
      </ScrollView>
    </Screen>
  );
}
