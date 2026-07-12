// ============================================================================
// FavoritesScreen — 저장된 조합 (Favorites 탭)
// ============================================================================
//
// useFavoritesStore(MMKV 영속)의 조합을 목록으로 보여준다. 각 항목은 저장 이후 처음
// 추첨된 회차와 자동 비교해 맞은 개수·등수를 배지로 노출한다(예측이 아니라 사후 확인).
// 저장 수단(★ 배선·FavoriteAdd)은 이후 구현이라, 현재는 빈 상태가 기본이다
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bookmark,
  Calendar,
  Notebook,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { Alert, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Button } from '@/components/action';
import { EmptyState } from '@/components/feedback';
import { AppHeader } from '@/components/layout';
import { LottoBallSet } from '@/components/lotto';
import { Text } from '@/components/primitives';
import { Card, Screen } from '@/components/surface';
import { useLottoData } from '@/hooks/queries/useLottoData';
import type { RootStackParamList } from '@/navigation/types';
import { useFavoritesStore } from '@/stores/favoritesStore';
import type { FavoriteItem } from '@/types/favorite';
import type { LottoRound } from '@/types/lotto';
import { getTargetRound, matchLotto } from '@/utils/matchLotto';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// createdAt(ISO datetime) → "2024.05.20" (날짜만)
function formatSavedDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '.');
}

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const Subtitle = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ItemCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const CardHead = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TitleGroup = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  flex: 1;
`;

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const IconButton = styled.Pressable`
  padding: ${({ theme }) => theme.spacing.xs}px;
`;

const Balls = styled(LottoBallSet)`
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const DateGroup = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

// 자동 비교 배지 — 당첨이면 accent 텍스트, 대기·미당첨은 중립. 채운 강조 없이 담백하게
const Badge = styled.View`
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: ${({ theme }) => theme.spacing.sm}px;
  padding-right: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface.containerHighest};
`;

const EmptyWrap = styled.View`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

interface CompareBadge {
  text: string;
  win: boolean;
}

// 항목의 자동 비교 결과 텍스트. rounds 미로드 시 null(배지 미표시)
function compareBadge(
  item: FavoriteItem,
  rounds: LottoRound[],
): CompareBadge | null {
  if (rounds.length === 0) return null;
  const target = getTargetRound(item.createdAt, rounds);
  if (!target) return { text: '다음 추첨 대기', win: false };

  const { matchCount, rank } = matchLotto(item.numbers, target);
  if (rank != null) {
    return {
      text: `${target.drawNo}회 · ${matchCount}개 일치 · ${rank}등`,
      win: true,
    };
  }
  return {
    text: `${target.drawNo}회 · ${matchCount}개 일치 · 미당첨`,
    win: false,
  };
}

function FavoriteCard({
  item,
  rounds,
  onEdit,
  onDelete,
}: {
  item: FavoriteItem;
  rounds: LottoRound[];
  onEdit: (id: string) => void;
  onDelete: (item: FavoriteItem) => void;
}) {
  const theme = useTheme();
  const badge = compareBadge(item, rounds);

  return (
    <ItemCard variant="filled">
      <CardHead>
        <TitleGroup>
          <Notebook size={16} color={theme.colors.text.muted} />
          <Text variant="bodyBase" numberOfLines={1}>
            {item.memo || '번호 조합'}
          </Text>
        </TitleGroup>
        <Actions>
          <IconButton
            accessibilityRole="button"
            accessibilityLabel="수정"
            hitSlop={6}
            onPress={() => onEdit(item.id)}
          >
            <Pencil size={16} color={theme.colors.text.secondary} />
          </IconButton>
          <IconButton
            accessibilityRole="button"
            accessibilityLabel="삭제"
            hitSlop={6}
            onPress={() => onDelete(item)}
          >
            <Trash2 size={16} color={theme.colors.state.error} />
          </IconButton>
        </Actions>
      </CardHead>

      <Balls numbers={item.numbers} size="sm" />

      <MetaRow>
        <DateGroup>
          <Calendar size={14} color={theme.colors.text.muted} />
          <Text variant="bodySm" color="muted">
            {formatSavedDate(item.createdAt)}
          </Text>
        </DateGroup>
        {badge && (
          <Badge>
            <Text variant="labelMd" color={badge.win ? 'accent' : 'muted'}>
              {badge.text}
            </Text>
          </Badge>
        )}
      </MetaRow>
    </ItemCard>
  );
}

export default function FavoritesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { data } = useLottoData();
  const items = useFavoritesStore(s => s.items);
  const remove = useFavoritesStore(s => s.remove);

  const rounds = data?.data ?? [];
  // 최신 저장 순 (createdAt 내림차순 — ISO 문자열은 사전식 정렬이 곧 시간순)
  const sorted = [...items].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  const goAdd = () => navigation.navigate('FavoriteAdd');
  const goEdit = (id: string) => navigation.navigate('FavoriteAdd', { id });

  const confirmDelete = (item: FavoriteItem) => {
    Alert.alert('조합 삭제', `"${item.memo || '번호 조합'}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => remove(item.id) },
    ]);
  };

  return (
    <Screen edges={['top']} padded={false}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.containerMargin,
          paddingBottom: theme.spacing.xl,
        }}
      >
        <HeaderRow>
          <Text variant="displayLg">저장된 조합</Text>
          <Button
            label="추가하기"
            size="sm"
            leftIcon={<Plus size={14} color={theme.colors.primary.onAction} />}
            onPress={goAdd}
          />
        </HeaderRow>

        {sorted.length === 0 ? (
          <EmptyWrap>
            <EmptyState
              icon={<Bookmark size={32} color={theme.colors.text.muted} />}
              title="저장된 조합이 없어요"
              description="마음에 드는 번호 조합을 저장해 두면 여기서 모아 볼 수 있어요."
              action={{ label: '조합 추가하기', onPress: goAdd }}
            />
          </EmptyWrap>
        ) : (
          <>
            <Subtitle variant="bodySm" color="muted">
              총 {sorted.length}개의 소중한 번호가 저장되어 있습니다.
            </Subtitle>
            {sorted.map(item => (
              <FavoriteCard
                key={item.id}
                item={item}
                rounds={rounds}
                onEdit={goEdit}
                onDelete={confirmDelete}
              />
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
