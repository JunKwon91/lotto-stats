// ============================================================================
// LottoStats 앱 진입점
// ============================================================================
// Provider 중첩 구조:
//   ThemeProvider           ← styled-components: 모드(light/dark) 테마 주입
//     SafeAreaProvider      ← Notch/Dynamic Island 등 Safe Area 정보 제공
//       NavigationContainer ← React Navigation의 루트
//         RootNavigator     ← 실제 화면 트리
//
// useColorScheme()으로 시스템 다크/라이트 모드를 감지하여 자동으로 테마 전환.
// ============================================================================

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';
import RootNavigator from '@/navigation/RootNavigator';
import { darkTheme, lightTheme } from '@/theme';

export default function App() {
  // 시스템 색상 모드 감지. null/undefined는 'light'로 폴백.
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        {/* StatusBar 아이콘 색을 모드에 맞춰 자동 조정 */}
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
