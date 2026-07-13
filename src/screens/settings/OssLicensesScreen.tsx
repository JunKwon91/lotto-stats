// ============================================================================
// OssLicensesScreen — 오픈소스 라이선스 목록 (Settings 서브)
// ============================================================================
//
// 앱의 직접 의존성과 라이선스 종류를 목록으로 보여준다. 각 행을 탭하면 라이선스
// 전문(OssLicenseDetail)으로 이동한다. 데이터는 build-licenses가 생성한 licenses.json.
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { SubHeader } from '@/components/layout';
import { SettingsRow } from '@/components/list';
import { Text } from '@/components/primitives';
import { Screen } from '@/components/surface';
import { licenses } from '@/data/licenses';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const Note = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Card = styled.View`
  border-radius: ${({ theme }) => theme.radius.lg}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface.container};
`;

export default function OssLicensesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <Screen edges={['top']} padded={false}>
      <SubHeader title="오픈소스 라이선스" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.containerMargin,
          paddingBottom: theme.spacing.xl,
        }}
      >
        <Note variant="bodySm" color="muted">
          이 앱은 아래 오픈소스 라이브러리를 사용합니다. 각 항목을 누르면 라이선스
          전문을 볼 수 있습니다.
        </Note>
        <Card>
          {licenses.map((lib, i) => (
            <SettingsRow
              key={lib.name}
              kind="picker"
              label={lib.name}
              value={lib.licenseType}
              divider={i < licenses.length - 1}
              onPress={() =>
                navigation.navigate('OssLicenseDetail', { name: lib.name })
              }
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
