// ============================================================================
// SettingsScreen — 임시 컴포넌트 갤러리
// ============================================================================
//
// 공통 컴포넌트를 화면 위에서 시각적으로 확인하기 위한 임시 화면.
// 본 설정 콘텐츠(5/13 예정) 작성 시 이 갤러리는 제거된다.
// ============================================================================

import { Fragment } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {
  Spacer,
  Text,
  type SpacerSize,
  type TextColor,
  type TextVariant,
} from '@/components/common';

const variantSamples: { key: TextVariant; label: string }[] = [
  { key: 'displayLg', label: 'DisplayLg — 메인 큰 제목 (Manrope 32 / 700)' },
  { key: 'headlineMd', label: 'HeadlineMd — 카드 제목 (Manrope 20 / 600)' },
  { key: 'headlineSm', label: 'HeadlineSm — Stack 헤더 (Manrope 17 / 600)' },
  { key: 'bodyBase', label: 'BodyBase — 기본 본문 (Inter 16 / 400)' },
  { key: 'bodySm', label: 'BodySm — 보조 본문 (Inter 14 / 400)' },
  { key: 'labelSm', label: 'LabelSm — 탭 라벨 (Inter 11 / 500)' },
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

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg.canvas};
`;

const Scroll = styled(ScrollView).attrs(({ theme }) => ({
  contentContainerStyle: {
    paddingHorizontal: theme.spacing.containerMargin,
    paddingVertical: theme.spacing.lg,
  },
}))``;

const Section = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']}px;
`;

const SectionHeader = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Sample = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const InverseBox = styled.View`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
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

const SpacerGroup = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export default function SettingsScreen() {
  return (
    <Container>
      <Scroll>
        <Section>
          <SectionHeader>
            <Text variant="headlineMd">Text · variants</Text>
          </SectionHeader>
          {variantSamples.map(({ key, label }) => (
            <Sample key={key}>
              <Text variant={key}>{label}</Text>
            </Sample>
          ))}
        </Section>

        <Section>
          <SectionHeader>
            <Text variant="headlineMd">Text · colors</Text>
          </SectionHeader>
          {colorSamples.map(({ key, label }) => (
            <Sample key={key}>
              <Text variant="bodyBase" color={key}>
                {label}
              </Text>
            </Sample>
          ))}
          <InverseBox>
            <Text variant="bodyBase" color="inverse">
              inverse — 반전 텍스트 (어두운 배경 위)
            </Text>
          </InverseBox>
        </Section>

        <Section>
          <SectionHeader>
            <Text variant="headlineMd">Text · aligns</Text>
          </SectionHeader>
          {alignSamples.map(a => (
            <Sample key={a}>
              <Text variant="bodyBase" align={a}>
                {a} — 정렬 샘플 텍스트
              </Text>
            </Sample>
          ))}
        </Section>

        <Section>
          <SectionHeader>
            <Text variant="headlineMd">Spacer · vertical</Text>
          </SectionHeader>
          {verticalSpacerSamples.map(({ size, label }) => (
            <SpacerGroup key={size}>
              <Box />
              <Text variant="labelSm" color="muted">
                {label}
              </Text>
              <Spacer size={size} />
              <Box />
            </SpacerGroup>
          ))}
        </Section>

        <Section>
          <SectionHeader>
            <Text variant="headlineMd">Spacer · horizontal</Text>
          </SectionHeader>
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
      </Scroll>
    </Container>
  );
}
