// ============================================================================
// SearchInput — 검색 전용 입력 컴포넌트
// ============================================================================
//
// Field 좌측 Search 아이콘 + 중앙 입력 영역 + Filled 시 우측 X(clear) 버튼.
// Empty / Filled 두 상태는 value.length로 자동 전환되며 별도 prop이 없다.
//
// 사용 예:
//   const [q, setQ] = useState('');
//   <SearchInput
//     value={q}
//     placeholder="번호·회차 검색"
//     onChangeText={setQ}
//   />
//
//   // onClear에서 외부 부수효과 처리 (분석 이벤트 등)
//   <SearchInput
//     value={q}
//     onChangeText={setQ}
//     onClear={() => trackEvent('search_cleared')}
//   />
//
// [디자인 토큰]
// Field: height 44, borderRadius radius.base(8),
//        bg surface.containerLowest, border 1px border.subtle,
//        paddingHorizontal 12, gap 8
// Search icon: lucide Search 18px, stroke text.muted
// Value: typography.bodyBase
//        Empty(placeholder)는 text.muted, Filled는 text.primary
// X icon: lucide X 18px, stroke text.muted
//         시각 크기 18×18, hitSlop 10으로 약 38×38 실제 hit area 확보
//
// [Input과의 차이]
// - Focus / Error / Disabled 상태 없음 — 검색용이라 단일 톤
// - 라벨·헬퍼 영역 없음 — 필드 단독
// - 우측 X 버튼이 value 비어있지 않을 때만 등장
// ============================================================================

import { Pressable, TextInput } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

export interface SearchInputProps {
  /** 현재 검색어 — 제어 컴포넌트로 사용. */
  value: string;
  /** 값이 비어있을 때 표시되는 안내 텍스트. */
  placeholder?: string;
  /** 입력 변경 콜백. X 버튼 탭 시에도 빈 문자열로 호출된다. */
  onChangeText: (text: string) => void;
  /** X 버튼 탭 시 추가로 실행될 콜백. onChangeText('')는 항상 먼저 호출된다. */
  onClear?: () => void;
  /** true면 마운트 시 자동 포커스. */
  autoFocus?: boolean;
  /** Field 컨테이너에 적용할 외부 스타일 override. */
  style?: StyleProp<ViewStyle>;
}

const Field = styled.View`
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.base}px;
  background-color: ${({ theme }) => theme.colors.surface.containerLowest};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.subtle};
  flex-direction: row;
  align-items: center;
  padding-left: 12px;
  padding-right: 12px;
  gap: 8px;
`;

/**
 * 검색 전용 단일 행 입력.
 *
 * value.length > 0이면 우측 X 버튼이 나타나고 탭 시 onChangeText('')가 호출된다.
 * Focus/Error/Disabled 상태는 갖지 않으므로 일반 폼 입력에는 Input 컴포넌트를 사용한다.
 *
 * @example
 * <SearchInput
 *   value={q}
 *   placeholder="번호·회차 검색"
 *   onChangeText={setQ}
 * />
 */
export default function SearchInput({
  value,
  placeholder,
  onChangeText,
  onClear,
  autoFocus,
  style,
}: SearchInputProps) {
  const theme = useTheme();
  const hasValue = value.length > 0;

  const inputStyle: TextStyle = {
    flex: 1,
    fontFamily: theme.typography.bodyBase.fontFamily,
    fontSize: theme.typography.bodyBase.fontSize,
    fontWeight: theme.typography.bodyBase.fontWeight,
    lineHeight: 18,
    color: theme.colors.text.primary,
    padding: 0,
    includeFontPadding: false,
  };

  return (
    <Field style={style}>
      <Search size={18} color={theme.colors.text.muted} />
      <TextInput
        style={inputStyle}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        selectionColor={theme.colors.primary.action}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
      />
      {hasValue && (
        <Pressable
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="검색어 지우기"
        >
          <X size={18} color={theme.colors.text.muted} />
        </Pressable>
      )}
    </Field>
  );
}
