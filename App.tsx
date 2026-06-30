// ============================================================================
// LottoStats 앱 진입점
// ============================================================================
// Provider 중첩 구조:
//   GestureHandlerRootView     ← react-native-gesture-handler: 제스처 루트(라이브러리 표준)
//     ThemeProvider            ← styled-components: 모드(light/dark) 테마 주입
//       QueryClientProvider    ← TanStack Query: 서버 상태/캐시 관리
//         SafeAreaProvider     ← Notch/Dynamic Island 등 Safe Area 정보 제공
//           NavigationContainer  ← React Navigation의 루트
//             RootNavigator    ← 실제 화면 트리
//
// useColorScheme()으로 시스템 다크/라이트 모드를 감지하여 자동 테마 전환.
//
// GestureHandlerRootView는 라이브러리 제스처/BottomSheet 컴포넌트의 전제이며
// 최상단에 flex:1로 둔다(라이브러리 표준 구성).
//
// queryClient 인스턴스는 src/lib/queryClient.ts에서 import.
// 컴포넌트 외부(api 함수, 백그라운드 로직)에서도 직접 접근 가능.
// ============================================================================

import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components/native';
import RootNavigator from '@/navigation/RootNavigator';
import { queryClient } from '@/lib/queryClient';
import { darkTheme, lightTheme } from '@/theme';
import { DialogHost, ToastHost } from '@junkwon91/rn-design-system';

export default function App() {
  // 시스템 색상 모드 감지. null/undefined는 'light'로 폴백.
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            {/* StatusBar 아이콘 색을 모드에 맞춰 자동 조정 */}
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            <DialogHost />
            <ToastHost />
          </SafeAreaProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
