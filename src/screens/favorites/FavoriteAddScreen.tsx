import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg.canvas};
  align-items: center;
  justify-content: center;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headlineMd.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headlineMd.fontWeight};
`;

const Todo = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize}px;
`;

export default function FavoriteAddScreen() {
  return (
    <Container>
      <Title>즐겨찾기 추가</Title>
      <Todo>TODO</Todo>
    </Container>
  );
}
