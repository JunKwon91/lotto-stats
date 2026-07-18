// ============================================================================
// SettingsScreen — 설정
// ============================================================================
//
// 실제 동작하는 설정만 둔다(표시용 껍데기 없음). 테마 모드·기본 분석 범위는
// settingsStore에 반영되고, 데이터 새로고침·캐시 삭제는 실제로 수행된다.
// 헤더 ⚙(AppHeader)에서 진입한다
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Linking, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { SegmentedControl } from '@/components/display';
import type { SegmentedControlSegment } from '@/components/display';
import { dialog, toast } from '@/components/feedback';
import { SubHeader } from '@/components/layout';
import { SettingsRow } from '@/components/list';
import { Text } from '@/components/primitives';
import { Screen } from '@/components/surface';
import { lottoKeys } from '@/hooks/queries/lottoKeys';
import { useLottoData } from '@/hooks/queries/useLottoData';
import type { RootStackParamList } from '@/navigation/types';
import { clearCachedLottoData } from '@/storage/lottoStorage';
import { useSettingsStore } from '@/stores/settingsStore';
import type { CachedLottoData } from '@/types/lotto';
import type { StatsRange, ThemeMode } from '@/types/settings';

import { version as appVersion } from '../../../package.json';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GITHUB_URL = 'https://github.com/JunKwon91';

const THEME_SEGMENTS: SegmentedControlSegment<ThemeMode>[] = [
  { value: 'dark', label: '다크' },
  { value: 'light', label: '라이트' },
  { value: 'system', label: '시스템' },
];

const RANGE_SEGMENTS: SegmentedControlSegment<StatsRange>[] = [
  { value: '100', label: '100회차' },
  { value: '30', label: '30회차' },
  { value: 'all', label: '전체' },
];

const SectionLabel = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const SectionCard = styled.View`
  border-radius: ${({ theme }) => theme.radius.lg}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface.container};
`;

const RangeCaption = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

// 기타 섹션 행 — SettingsRow에 없는 우측 아이콘·destructive 표현을 위해 맞춤
const TapRow = styled.Pressable<{ $dimmed?: boolean }>`
  height: 56px;
  padding-left: ${({ theme }) => theme.spacing.lg}px;
  padding-right: ${({ theme }) => theme.spacing.lg}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.4 : 1)};
`;

const RowDivider = styled.View`
  position: absolute;
  left: ${({ theme }) => theme.spacing.lg}px;
  right: ${({ theme }) => theme.spacing.lg}px;
  bottom: 0;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.divider};
`;

const DangerLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.state.error};
`;

export default function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { refetch } = useLottoData();

  // 진행 중인 데이터 작업 — 완료까지 두 행을 잠가 중복 실행·오조작을 막는다
  const [busy, setBusy] = useState<'refresh' | 'clear' | null>(null);

  const themeMode = useSettingsStore(s => s.themeMode);
  const setThemeMode = useSettingsStore(s => s.setThemeMode);
  const defaultStatsRange = useSettingsStore(s => s.defaultStatsRange);
  const setDefaultStatsRange = useSettingsStore(s => s.setDefaultStatsRange);

  const handleRefresh = async () => {
    if (busy) return;
    setBusy('refresh');
    try {
      await refetch();
      toast.success('최신 회차 데이터를 불러왔어요');
    } finally {
      setBusy(null);
    }
  };

  const handleClearCache = async () => {
    if (busy) return;
    const confirmed = await dialog.confirm({
      title: '캐시 삭제',
      description:
        '저장된 회차 데이터를 삭제합니다. 다음 실행 시 다시 내려받습니다.',
      destructive: true,
      confirmLabel: '삭제',
      cancelLabel: '취소',
    });
    if (!confirmed) return;
    setBusy('clear');
    try {
      // MMKV 영구 캐시를 지운 뒤 메모리 캐시(Query)까지 비워야 화면이 갱신된다.
      // 다른 탭 화면이 마운트된 채로 같은 쿼리를 구독하고 있으므로,
      // 공유 쿼리의 data를 undefined로 되돌려 모든 구독 화면을 로딩 상태로
      // 전환한다(setQueryData는 undefined를 무시하고, removeQueries는 마운트된
      // 구독자를 다시 렌더하지 않으므로 상태를 직접 비운다). 이어지는 refetch로
      // 온라인이면 새 데이터, 오프라인이면 각 화면이 ErrorView로 전환된다.
      clearCachedLottoData();
      queryClient
        .getQueryCache()
        .find<CachedLottoData>({ queryKey: lottoKeys.history() })
        ?.setState({ status: 'pending', data: undefined, dataUpdatedAt: 0 });
      await refetch();
      toast.success('캐시를 삭제했어요');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen edges={['top']} padded={false}>
      <SubHeader title="설정" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.containerMargin,
          paddingBottom: theme.spacing.xl,
        }}
      >
        {/* 화면 */}
        <SectionLabel variant="labelCaps" color="muted">
          화면
        </SectionLabel>
        <SectionCard>
          <SettingsRow
            kind="custom"
            label="테마"
            content={
              <SegmentedControl
                segments={THEME_SEGMENTS}
                value={themeMode}
                onChange={setThemeMode}
              />
            }
          />
          <SettingsRow
            kind="custom"
            label="기본 분석 범위"
            divider={false}
            content={
              <>
                <SegmentedControl
                  segments={RANGE_SEGMENTS}
                  value={defaultStatsRange}
                  onChange={setDefaultStatsRange}
                />
                <RangeCaption variant="bodySm" color="muted">
                  전체 통계 화면에 들어갈 때의 기본 범위예요.
                </RangeCaption>
              </>
            }
          />
        </SectionCard>

        {/* 정보 */}
        <SectionLabel variant="labelCaps" color="muted">
          정보
        </SectionLabel>
        <SectionCard>
          <SettingsRow kind="default" label="앱 버전" value={appVersion} />
          <SettingsRow
            kind="link"
            label="개발자 깃허브"
            onPress={() => Linking.openURL(GITHUB_URL)}
          />
          <SettingsRow
            kind="action"
            label="오픈소스 라이선스"
            divider={false}
            onPress={() => navigation.navigate('OssLicenses')}
          />
        </SectionCard>

        {/* 기타 */}
        <SectionLabel variant="labelCaps" color="muted">
          기타
        </SectionLabel>
        <SectionCard>
          <TapRow
            accessibilityRole="button"
            accessibilityLabel="데이터 다시 불러오기"
            accessibilityState={{ disabled: busy !== null }}
            onPress={handleRefresh}
            disabled={busy !== null}
            $dimmed={busy !== null && busy !== 'refresh'}
          >
            <Text variant="bodyBase">데이터 다시 불러오기</Text>
            {busy === 'refresh' ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.text.secondary}
              />
            ) : (
              <RotateCcw size={20} color={theme.colors.text.secondary} />
            )}
            <RowDivider />
          </TapRow>
          <TapRow
            accessibilityRole="button"
            accessibilityLabel="캐시 삭제"
            accessibilityState={{ disabled: busy !== null }}
            onPress={handleClearCache}
            disabled={busy !== null}
            $dimmed={busy !== null && busy !== 'clear'}
          >
            <DangerLabel variant="bodyBase">캐시 삭제</DangerLabel>
            {busy === 'clear' ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.state.error}
              />
            ) : (
              <Trash2 size={20} color={theme.colors.state.error} />
            )}
          </TapRow>
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}
