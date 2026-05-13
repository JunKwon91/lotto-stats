// ============================================================================
// SettingsScreen — 임시 컴포넌트 갤러리
// ============================================================================
//
// 공통 컴포넌트를 화면 위에서 시각적으로 확인하기 위한 임시 화면.
// 본 설정 콘텐츠 작성 시 이 갤러리는 제거된다.
// ============================================================================

import { Fragment, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  ChevronLeft,
  Inbox,
  Plus,
  Search,
  Settings,
  Star,
  X,
} from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import { Button, IconButton } from '@/components/action';
import {
  DataTable,
  SegmentedControl,
  type DataTableColumn,
  type DataTableSortDirection,
} from '@/components/display';
import { EmptyState } from '@/components/feedback';
import { Input, SearchInput } from '@/components/input';
import { SettingsRow } from '@/components/list';
import {
  Divider,
  Spacer,
  Text,
  type DividerColor,
  type SpacerSize,
  type TextColor,
  type TextVariant,
} from '@/components/primitives';
import { Card, Screen, Section } from '@/components/surface';

const noop = () => {};

const variantSamples: { key: TextVariant; label: string }[] = [
  { key: 'displayLg', label: 'DisplayLg — 메인 큰 제목 (Manrope 32 / 700)' },
  { key: 'headlineMd', label: 'HeadlineMd — 카드 제목 (Manrope 20 / 600)' },
  { key: 'headlineSm', label: 'HeadlineSm — Stack 헤더 (Manrope 17 / 600)' },
  { key: 'bodyBase', label: 'BodyBase — 기본 본문 (Inter 16 / 400)' },
  { key: 'bodySm', label: 'BodySm — 보조 본문 (Inter 14 / 400)' },
  { key: 'labelSm', label: 'LabelSm — 탭 라벨 (Inter 11 / 600)' },
  { key: 'labelCaps', label: 'labelcaps · uppercase + letterspacing' },
];

const colorSamples: { key: Exclude<TextColor, 'inverse'>; label: string }[] = [
  { key: 'primary', label: 'primary — 본문 기본' },
  { key: 'secondary', label: 'secondary — 부제' },
  { key: 'muted', label: 'muted — 메타데이터' },
  { key: 'accent', label: 'accent — 강조 (primary.action)' },
];

const alignSamples = ['left', 'center', 'right'] as const;

const verticalSpacerSamples: { size: SpacerSize; label: string }[] = [
  { size: 'xs', label: 'xs (4px)' },
  { size: 'sm', label: 'sm (8px)' },
  { size: 'md', label: 'md (12px)' },
  { size: 'lg', label: 'lg (16px)' },
  { size: 'xl', label: 'xl (24px)' },
];

const horizontalSpacerSamples: SpacerSize[] = ['xs', 'sm', 'md', 'lg'];

const dividerColorSamples: DividerColor[] = ['subtle', 'default', 'strong'];

type SampleRow = {
  number: number;
  freq: number;
  lastSeen: number;
  trend: 'hot' | 'cold' | null;
};

const sampleData: SampleRow[] = [
  { number: 24, freq: 142, lastSeen: 12, trend: 'hot' },
  { number: 7, freq: 138, lastSeen: 3, trend: null },
  { number: 43, freq: 135, lastSeen: 28, trend: null },
  { number: 11, freq: 120, lastSeen: 45, trend: 'cold' },
  { number: 33, freq: 118, lastSeen: 7, trend: null },
];

const InverseBox = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.bg.sectionMain};
  border-radius: ${({ theme }) => theme.radius.base}px;
`;

const Box = styled.View`
  background-color: ${({ theme }) => theme.colors.state.error};
  height: 8px;
  width: 100%;
`;

const SmallBox = styled.View`
  background-color: ${({ theme }) => theme.colors.state.error};
  width: 40px;
  height: 24px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const InsetDemoBox = styled.View`
  padding-top: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.state.error};
`;

const SurfaceSampleBox = styled.View<{ $bg: string }>`
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ $bg }) => $bg};
  justify-content: center;
  padding-left: ${({ theme }) => theme.spacing.md}px;
  padding-right: ${({ theme }) => theme.spacing.md}px;
`;

const SettingsRowPanel = styled.View`
  border-radius: ${({ theme }) => theme.radius.lg}px;
  overflow: hidden;
`;

export default function SettingsScreen() {
  const theme = useTheme();
  const [searchEmpty, setSearchEmpty] = useState('');
  const [searchFilled, setSearchFilled] = useState('1043회');
  const [darkOn, setDarkOn] = useState(true);
  const [notifyOn, setNotifyOn] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>(
    'dark',
  );
  const [sortKey, setSortKey] = useState<string>('freq');
  const [sortDir, setSortDir] = useState<DataTableSortDirection>('desc');

  const sortedSampleData = useMemo(() => {
    const sorted = [...sampleData];
    sorted.sort((a, b) => {
      const av = a[sortKey as keyof SampleRow];
      const bv = b[sortKey as keyof SampleRow];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [sortKey, sortDir]);

  const sampleColumns: DataTableColumn<SampleRow>[] = [
    {
      key: 'number',
      header: '번호',
      render: row => <Text variant="numericMd">{row.number}</Text>,
      flex: 1,
      sortable: true,
    },
    {
      key: 'freq',
      header: '빈도',
      render: row => <Text variant="numericMd">{row.freq}×</Text>,
      flex: 1,
      sortable: true,
    },
    {
      key: 'lastSeen',
      header: '최근',
      render: row => (
        <Text variant="bodySm" color="secondary">
          {row.lastSeen} days
        </Text>
      ),
      flex: 1.2,
      sortable: true,
    },
    {
      key: 'trend',
      header: '추세',
      render: row => {
        if (row.trend === 'hot') {
          return (
            <Text
              variant="labelCaps"
              style={{ color: theme.colors.state.hot }}
            >
              hot
            </Text>
          );
        }
        if (row.trend === 'cold') {
          return (
            <Text
              variant="labelCaps"
              style={{ color: theme.colors.state.cold }}
            >
              cold
            </Text>
          );
        }
        return (
          <Text variant="bodySm" color="muted">
            —
          </Text>
        );
      },
      flex: 0.8,
    },
  ];
  return (
    <Screen
      scroll
      edges={[]}
      contentContainerStyle={{ paddingVertical: theme.spacing.lg }}
    >
      <Section title="Text · variants">
        {variantSamples.map(({ key, label }) => (
          <Text key={key} variant={key}>
            {label}
          </Text>
        ))}
      </Section>
      <Spacer size="2xl" />

      <Section title="Text · colors">
        {colorSamples.map(({ key, label }) => (
          <Text key={key} variant="bodyBase" color={key}>
            {label}
          </Text>
        ))}
        <InverseBox>
          <Text variant="bodyBase" color="inverse">
            inverse — 반전 텍스트 (어두운 배경 위)
          </Text>
        </InverseBox>
      </Section>
      <Spacer size="2xl" />

      <Section title="Text · aligns">
        {alignSamples.map(a => (
          <Text key={a} variant="bodyBase" align={a}>
            {a} — 정렬 샘플 텍스트
          </Text>
        ))}
      </Section>
      <Spacer size="2xl" />

      <Section title="Spacer · vertical">
        {verticalSpacerSamples.map(({ size, label }) => (
          <View key={size}>
            <Box />
            <Text variant="labelSm" color="muted">
              {label}
            </Text>
            <Spacer size={size} />
            <Box />
          </View>
        ))}
      </Section>
      <Spacer size="2xl" />

      <Section title="Spacer · horizontal">
        <Row>
          <SmallBox />
          {horizontalSpacerSamples.map(size => (
            <Fragment key={size}>
              <Spacer size={size} axis="horizontal" />
              <SmallBox />
            </Fragment>
          ))}
        </Row>
      </Section>
      <Spacer size="2xl" />

      <Section title="Divider">
        {dividerColorSamples.map(c => (
          <View key={c}>
            <Text variant="labelSm" color="muted">
              {c}
            </Text>
            <Spacer size="xs" />
            <Divider color={c} />
          </View>
        ))}
        <Text variant="labelSm" color="muted">
          orientation · vertical (inset 4)
        </Text>
        <Row>
          <Text>왼쪽</Text>
          <Spacer size="sm" axis="horizontal" />
          <Divider orientation="vertical" color="default" inset={4} />
          <Spacer size="sm" axis="horizontal" />
          <Text>오른쪽</Text>
        </Row>
        <Text variant="labelSm" color="muted">
          inset 차이 (0 vs 32)
        </Text>
        <InsetDemoBox>
          <Divider color="strong" />
          <Spacer size="md" />
          <Divider color="strong" inset={32} />
        </InsetDemoBox>
      </Section>
      <Spacer size="2xl" />

      <Section title="Card">
        <Text variant="labelSm" color="muted">
          variant (default · elevated)
        </Text>
        <Card>
          <Text>default variant (보더 있음)</Text>
        </Card>
        <Card variant="elevated">
          <Text>elevated variant (보더 없음)</Text>
        </Card>
        <Text variant="labelSm" color="muted">
          density (default · compact)
        </Text>
        <Card title="default density" meta="padding 16">
          <Text>일반 카드</Text>
        </Card>
        <Card density="compact" title="compact density" meta="padding 12">
          <Text>컴팩트 카드</Text>
        </Card>
        <Text variant="labelSm" color="muted">
          title + meta + showDivider
        </Text>
        <Card title="번호 분석" meta="이번 달" showDivider>
          <Text>showDivider가 true면 헤더 아래 구분선이 나타난다.</Text>
        </Card>
      </Section>
      <Spacer size="2xl" />

      <Section title="신규 Surface 토큰" spacing="compact">
        <SurfaceSampleBox $bg={theme.colors.surface.containerLowest}>
          <Text variant="bodySm">surface.containerLowest</Text>
        </SurfaceSampleBox>
        <SurfaceSampleBox $bg={theme.colors.surface.base}>
          <Text variant="bodySm">surface.base</Text>
        </SurfaceSampleBox>
        <SurfaceSampleBox $bg={theme.colors.surface.container}>
          <Text variant="bodySm">surface.container (기존)</Text>
        </SurfaceSampleBox>
      </Section>
      <Spacer size="2xl" />

      <Section title="신규 Typography 토큰" spacing="compact">
        <Text variant="labelMd">
          labelMd — Input·Settings Row 라벨 (Inter 13/600)
        </Text>
        <Text variant="labelLg">
          labelLg — Segmented·BottomTab active (Inter 14/600)
        </Text>
        <Text variant="numericMd">
          numericMd — Data Table·통계 수치 (Manrope 14/700)
        </Text>
      </Section>
      <Spacer size="2xl" />

      <Section title="Section · default spacing">
        <Card>
          <Text>card 1</Text>
        </Card>
        <Card>
          <Text>card 2</Text>
        </Card>
        <Card>
          <Text>card 3</Text>
        </Card>
      </Section>
      <Spacer size="2xl" />

      <Section title="Section · compact spacing" spacing="compact">
        <Card density="compact">
          <Text>card 1</Text>
        </Card>
        <Card density="compact">
          <Text>card 2</Text>
        </Card>
        <Card density="compact">
          <Text>card 3</Text>
        </Card>
      </Section>
      <Spacer size="2xl" />

      <Section title="Section · roomy spacing" spacing="roomy">
        <Card>
          <Text>card 1</Text>
        </Card>
        <Card>
          <Text>card 2</Text>
        </Card>
      </Section>
      <Spacer size="2xl" />

      <Section
        title="action 있는 Section"
        action={
          <Text variant="bodySm" color="accent">
            전체 보기
          </Text>
        }
      >
        <Card>
          <Text>action prop 검증용 컨텐츠</Text>
        </Card>
      </Section>
      <Spacer size="2xl" />

      <Section title="Button · variants × sizes">
        <Card>
          <Button label="Primary sm" variant="primary" size="sm" onPress={noop} />
          <Spacer size="sm" />
          <Button label="Primary md" variant="primary" size="md" onPress={noop} />
          <Spacer size="sm" />
          <Button label="Primary lg" variant="primary" size="lg" onPress={noop} />
        </Card>
        <Card>
          <Button label="Secondary sm" variant="secondary" size="sm" onPress={noop} />
          <Spacer size="sm" />
          <Button label="Secondary md" variant="secondary" size="md" onPress={noop} />
          <Spacer size="sm" />
          <Button label="Secondary lg" variant="secondary" size="lg" onPress={noop} />
        </Card>
      </Section>
      <Spacer size="2xl" />

      <Section title="Button · states & options">
        <Card>
          <Button label="disabled" disabled onPress={noop} />
          <Spacer size="sm" />
          <Button label="loading" loading onPress={noop} />
          <Spacer size="sm" />
          <Button label="fullWidth" fullWidth onPress={noop} />
        </Card>
        <Card>
          <Button
            label="추가하기"
            size="sm"
            leftIcon={
              <Plus size={14} color={theme.colors.primary.onAction} />
            }
            onPress={noop}
          />
          <Spacer size="sm" />
          <Button
            label="추가하기"
            variant="secondary"
            size="sm"
            leftIcon={
              <Plus size={14} color={theme.colors.text.secondary} />
            }
            onPress={noop}
          />
        </Card>
      </Section>
      <Spacer size="2xl" />

      <Section title="IconButton · sizes × colors">
        <Card>
          <Text variant="labelSm" color="muted">
            sm (24×24)
          </Text>
          <Spacer size="sm" />
          <Row>
            <IconButton
              icon={<Settings />}
              size="sm"
              color="primary"
              accessibilityLabel="설정 primary"
              onPress={noop}
            />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<Settings />}
              size="sm"
              color="secondary"
              accessibilityLabel="설정 secondary"
              onPress={noop}
            />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<Settings />}
              size="sm"
              color="muted"
              accessibilityLabel="설정 muted"
              onPress={noop}
            />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<Settings />}
              size="sm"
              color="accent"
              accessibilityLabel="설정 accent"
              onPress={noop}
            />
          </Row>
          <Text variant="labelSm" color="muted">
            md (32×32) — default
          </Text>
          <Spacer size="sm" />
          <Row>
            <IconButton
              icon={<ChevronLeft />}
              color="primary"
              accessibilityLabel="뒤로 primary"
              onPress={noop}
            />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<ChevronLeft />}
              color="secondary"
              accessibilityLabel="뒤로 secondary"
              onPress={noop}
            />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<ChevronLeft />}
              color="muted"
              accessibilityLabel="뒤로 muted"
              onPress={noop}
            />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<ChevronLeft />}
              color="accent"
              accessibilityLabel="뒤로 accent"
              onPress={noop}
            />
          </Row>
          <Text variant="labelSm" color="muted">
            lg (44×44) — Apple HIG 권장
          </Text>
          <Spacer size="sm" />
          <Row>
            <IconButton
              icon={<Star />}
              size="lg"
              color="primary"
              accessibilityLabel="즐겨찾기 primary"
              onPress={noop}
            />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<Star />}
              size="lg"
              color="secondary"
              accessibilityLabel="즐겨찾기 secondary"
              onPress={noop}
            />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<Star />}
              size="lg"
              color="muted"
              accessibilityLabel="즐겨찾기 muted"
              onPress={noop}
            />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<Star />}
              size="lg"
              color="accent"
              accessibilityLabel="즐겨찾기 accent"
              onPress={noop}
            />
          </Row>
        </Card>
      </Section>
      <Spacer size="2xl" />

      <Section title="IconButton · disabled">
        <Card>
          <Row>
            <IconButton icon={<X />} accessibilityLabel="닫기" onPress={noop} />
            <Spacer size="md" axis="horizontal" />
            <IconButton
              icon={<X />}
              disabled
              accessibilityLabel="닫기 disabled"
              onPress={noop}
            />
          </Row>
        </Card>
      </Section>
      <Spacer size="2xl" />

      <Section title="Input · 상태">
        <Text variant="labelSm" color="muted">
          Default (탭하면 Focus 상태로 전환)
        </Text>
        <Input
          label="회차 번호"
          placeholder="회차를 입력하세요"
          helper="조회할 로또 회차를 입력하세요."
        />
        <Text variant="labelSm" color="muted">
          Error
        </Text>
        <Input
          label="회차 번호"
          placeholder="회차를 입력하세요"
          error="유효하지 않은 회차입니다"
        />
        <Text variant="labelSm" color="muted">
          Disabled
        </Text>
        <Input
          label="회차 번호"
          placeholder="회차를 입력하세요"
          helper="조회할 로또 회차를 입력하세요."
          disabled
        />
        <Text variant="labelSm" color="muted">
          showHelper = false
        </Text>
        <Input
          label="회차 번호"
          placeholder="회차를 입력하세요"
          helper="조회할 로또 회차를 입력하세요."
          showHelper={false}
        />
      </Section>
      <Spacer size="2xl" />

      <Section title="SearchInput · 상태">
        <Text variant="labelSm" color="muted">
          Empty (타이핑하면 X 버튼 등장)
        </Text>
        <SearchInput
          value={searchEmpty}
          placeholder="번호·회차 검색"
          onChangeText={setSearchEmpty}
        />
        <Text variant="labelSm" color="muted">
          Filled (X 탭으로 클리어)
        </Text>
        <SearchInput
          value={searchFilled}
          placeholder="번호·회차 검색"
          onChangeText={setSearchFilled}
        />
      </Section>
      <Spacer size="2xl" />

      <Section title="SettingsRow · variants">
        <SettingsRowPanel>
          <SettingsRow kind="default" label="언어" value="한국어" />
          <Divider color="subtle" />
          <SettingsRow kind="default" label="버전" value="v1.0.0" />
          <Divider color="subtle" />
          <SettingsRow
            kind="toggle"
            label="다크 모드"
            value={darkOn}
            onChange={setDarkOn}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="toggle"
            label="알림"
            value={notifyOn}
            onChange={setNotifyOn}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="picker"
            label="기본 회차"
            value="1043회"
            onPress={() => console.log('picker pressed')}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="link"
            label="개인정보 처리방침"
            onPress={() => console.log('link pressed')}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="action"
            label="약관 보기"
            onPress={() => console.log('action pressed')}
          />
        </SettingsRowPanel>
      </Section>
      <Spacer size="2xl" />

      <Section title="DataTable · default density">
        <DataTable
          columns={sampleColumns}
          data={sampleData}
          keyExtractor={row => String(row.number)}
        />
      </Section>
      <Spacer size="2xl" />

      <Section title="DataTable · compact density">
        <DataTable
          columns={sampleColumns}
          data={sampleData}
          density="compact"
          keyExtractor={row => String(row.number)}
        />
      </Section>
      <Spacer size="2xl" />

      <Section title="DataTable · sortable">
        <Text variant="labelSm" color="muted">
          헤더 탭으로 asc/desc 토글
        </Text>
        <DataTable
          columns={sampleColumns}
          data={sortedSampleData}
          sortable
          sortKey={sortKey}
          sortDirection={sortDir}
          onSort={(k, d) => {
            setSortKey(k);
            setSortDir(d);
          }}
          keyExtractor={row => String(row.number)}
        />
      </Section>
      <Spacer size="2xl" />

      <Section title="SegmentedControl · 2 segments">
        <SegmentedControl
          segments={[
            { value: 'newest', label: '최신순' },
            { value: 'oldest', label: '오래된순' },
          ]}
          value={sortOrder}
          onChange={setSortOrder}
        />
      </Section>
      <Spacer size="2xl" />

      <Section title="SegmentedControl · 3 segments">
        <SegmentedControl
          segments={[
            { value: 'dark', label: '다크' },
            { value: 'light', label: '라이트' },
            { value: 'system', label: '시스템' },
          ]}
          value={themeMode}
          onChange={setThemeMode}
        />
      </Section>
      <Spacer size="2xl" />

      <Section title="EmptyState · standard">
        <EmptyState
          icon={<Inbox color={theme.colors.text.muted} size={32} />}
          title="저장된 분석이 없습니다"
          description="새로운 분석 조합을 저장해 보세요."
        />
      </Section>
      <Spacer size="2xl" />

      <Section title="EmptyState · standard + action">
        <EmptyState
          icon={<Search color={theme.colors.text.muted} size={32} />}
          title="검색 결과가 없습니다"
          description="다른 키워드로 다시 검색해 보세요."
          action={{
            label: '검색 초기화',
            onPress: () => console.log('reset search'),
          }}
        />
      </Section>
      <Spacer size="2xl" />

      <Section title="EmptyState · subtle (인라인 hint)">
        <EmptyState
          tone="subtle"
          icon={<Star color={theme.colors.text.muted} size={32} />}
          title="새로운 분석 조합을 저장해보세요"
        />
      </Section>
    </Screen>
  );
}
