// ============================================================================
// OssLicenseDetailScreen — 라이선스 전문 (Settings 서브)
// ============================================================================
//
// 라이브러리 하나의 라이선스 종류·저작권·전문을 보여준다. { name }으로 진입해
// licenses.json에서 찾는다. 전문은 원문 그대로 monospace로 렌더한다
// ============================================================================

import { ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { EmptyState } from '@/components/feedback';
import { SubHeader } from '@/components/layout';
import { Text } from '@/components/primitives';
import { Screen } from '@/components/surface';
import { findLicense } from '@/data/licenses';
import type { OssLicenseDetailScreenProps } from '@/navigation/types';

const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const Chip = styled.View`
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: ${({ theme }) => theme.spacing.sm}px;
  padding-right: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface.containerHighest};
`;

const LicenseCard = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface.container};
`;

const StateArea = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export default function OssLicenseDetailScreen({
  route,
}: OssLicenseDetailScreenProps) {
  const theme = useTheme();
  const { name } = route.params;
  const entry = findLicense(name);

  return (
    <Screen edges={['top']} padded={false}>
      <SubHeader title={name} />
      {!entry ? (
        <StateArea>
          <EmptyState
            title="라이선스를 찾을 수 없어요"
            description="라이브러리 정보를 다시 확인해 주세요."
          />
        </StateArea>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.containerMargin,
            paddingBottom: theme.spacing.xl,
          }}
        >
          <MetaRow>
            <Chip>
              <Text variant="labelMd" color="muted">
                {entry.licenseType}
              </Text>
            </Chip>
            <Text variant="bodySm" color="muted">
              v{entry.version}
            </Text>
          </MetaRow>
          {entry.copyright && (
            <MetaRow>
              <Text variant="bodySm" color="secondary">
                {entry.copyright}
              </Text>
            </MetaRow>
          )}
          <LicenseCard>
            <Text variant="bodySm" color="secondary">
              {entry.licenseText}
            </Text>
          </LicenseCard>
        </ScrollView>
      )}
    </Screen>
  );
}
