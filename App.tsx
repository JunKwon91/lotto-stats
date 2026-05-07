import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';
import styled from 'styled-components/native';
import { darkTheme, lightTheme } from './src/theme';

const previewNumbers = [1, 14, 25, 36, 43];

const ballColor = (n: number, theme: typeof darkTheme) => {
  if (n <= 10) return { bg: theme.colors.ball.yellow, fg: theme.colors.ball.onLight };
  if (n <= 20) return { bg: theme.colors.ball.blue, fg: theme.colors.ball.onDark };
  if (n <= 30) return { bg: theme.colors.ball.red, fg: theme.colors.ball.onDark };
  if (n <= 40) return { bg: theme.colors.ball.gray, fg: theme.colors.ball.onLight };
  return { bg: theme.colors.ball.green, fg: theme.colors.ball.onLight };
};

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg.canvas};
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['2xl']}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.displayLg.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.displayLg.fontWeight};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyBase.fontSize}px;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']}px;
`;

const BallRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Ball = styled.View<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ $bg }) => $bg};
  align-items: center;
  justify-content: center;
`;

const BallText = styled.Text<{ $fg: string }>`
  color: ${({ $fg }) => $fg};
  font-weight: ${({ theme }) => theme.typography.ballNumber.fontWeight};
  font-size: ${({ theme }) => theme.typography.ballNumber.fontSize}px;
`;

function App(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Screen>
          <Title>LottoStats</Title>
          <Subtitle>한국 로또 6/45 통계 분석 도구</Subtitle>
          <BallRow>
            {previewNumbers.map(n => {
              const { bg, fg } = ballColor(n, theme);
              return (
                <Ball key={n} $bg={bg}>
                  <BallText $fg={fg}>{n}</BallText>
                </Ball>
              );
            })}
          </BallRow>
        </Screen>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
