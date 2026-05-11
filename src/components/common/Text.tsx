// ============================================================================
// Text — 시맨틱 텍스트 컴포넌트
// ============================================================================
//
// theme.typography의 7가지 variant와 theme.colors의 5가지 color를
// props로 받아 React Native Text를 styled-components로 감싼 컴포넌트.
// 다크/라이트 모드 색상은 ThemeProvider가 자동으로 교체한다.
//
// [variant 가이드]
//   displayLg    Manrope 32 / 700  — 메인 페이지 큰 제목
//   headlineMd   Manrope 20 / 600  — 카드 제목, 섹션 헤더
//   headlineSm   Manrope 17 / 600  — Stack Navigator 헤더 타이틀
//   bodyBase     Inter   16 / 400  — 기본 본문
//   bodySm      Inter   14 / 400  — 보조 본문, 테이블 셀
//   labelSm      Inter   11 / 500  — Bottom Tab 라벨
//   labelCaps    Inter   12 / 600  — 대문자 라벨 (자동 uppercase + letterSpacing 0.6)
//
// [color 가이드]
//   primary      text.primary           — 본문/제목 기본
//   secondary    text.secondary         — 부제, 설명
//   muted        text.muted             — 흐릿한 메타데이터
//   accent       primary.action         — 강조 액센트 (모드별 색상)
//   inverse      text.primaryInverse    — 반대 모드 텍스트 (어두운 배경 위 등)
//
// [구현 방식: styled-components + transient props ($ prefix)]
// 이전 검토안(type prop을 컴포넌트 본문에서 switch로 분기하는 방식)을 버린 이유:
//   1) 모든 variant 분기를 한 컴포넌트에 모아 두면 코드가 비대해진다.
//   2) typography 토큰이 추가될 때마다 컴포넌트 본체도 함께 수정해야 한다.
//   3) 분기마다 인라인 스타일이 생성되어 styled의 스타일 캐시 재사용 이점을
//      살릴 수 없다.
// styled-components 템플릿에서 theme.typography[$variant]를 직접 펼치면,
// 새 variant가 추가될 때 별도 분기 없이 자동으로 확장된다.
// $ prefix(transient prop)는 RN Text DOM에 prop이 전달되어 발생하는
// "Unknown prop" 경고를 차단한다.
// ============================================================================

import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
import styled from 'styled-components/native';

export type TextVariant =
  | 'displayLg'
  | 'headlineMd'
  | 'headlineSm'
  | 'bodyBase'
  | 'bodySm'
  | 'labelSm'
  | 'labelCaps';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'inverse';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}

const StyledText = styled.Text<{
  $variant: TextVariant;
  $color: TextColor;
  $align: 'left' | 'center' | 'right';
}>`
  font-family: ${({ theme, $variant }) => theme.typography[$variant].fontFamily};
  font-size: ${({ theme, $variant }) => theme.typography[$variant].fontSize}px;
  font-weight: ${({ theme, $variant }) => theme.typography[$variant].fontWeight};
  line-height: ${({ theme, $variant }) => theme.typography[$variant].lineHeight}px;
  text-align: ${({ $align }) => $align};
  color: ${({ theme, $color }) => {
    switch ($color) {
      case 'primary':
        return theme.colors.text.primary;
      case 'secondary':
        return theme.colors.text.secondary;
      case 'muted':
        return theme.colors.text.muted;
      case 'accent':
        return theme.colors.primary.action;
      case 'inverse':
        return theme.colors.text.primaryInverse;
    }
  }};
  ${({ theme, $variant }) => {
    const t = theme.typography[$variant];
    return 'letterSpacing' in t ? `letter-spacing: ${t.letterSpacing}px;` : '';
  }};
  ${({ theme, $variant }) => {
    const t = theme.typography[$variant];
    return 'textTransform' in t ? `text-transform: ${t.textTransform};` : '';
  }};
`;

export default function Text({
  variant = 'bodyBase',
  color = 'primary',
  align = 'left',
  numberOfLines,
  children,
  style,
  ...rest
}: TextProps) {
  return (
    <StyledText
      $variant={variant}
      $color={color}
      $align={align}
      numberOfLines={numberOfLines}
      style={style}
      {...rest}
    >
      {children}
    </StyledText>
  );
}
