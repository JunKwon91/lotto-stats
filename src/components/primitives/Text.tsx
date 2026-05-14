// ============================================================================
// Text — 시맨틱 텍스트 컴포넌트
// ============================================================================
//
// theme.typography 10개 variant + theme.colors 5개 color를 props로 선택.
// 다크/라이트 모드 색상은 ThemeProvider가 자동 교체.
//
// styled-components/native 위에서 transient props($variant/$color/$align)를
// 사용해 RN Text에 prop이 전달되지 않도록 막아 "Unknown prop" 경고를 차단한다.
//
// [variant]
//   displayLg    Manrope 32 / 700  — 메인 페이지 큰 제목
//   headlineMd   Manrope 20 / 600  — 카드 제목, 섹션 헤더
//   headlineSm   Manrope 17 / 600  — Stack Navigator 헤더 타이틀
//   bodyBase     Inter   16 / 400  — 기본 본문
//   bodySm       Inter   14 / 400  — 보조 본문, 테이블 셀
//   labelSm      Inter   11 / 600  — Bottom Tab 라벨
//   labelMd      Inter   13 / 600  — Input·Settings Row 라벨
//   labelLg      Inter   14 / 600  — Segmented Control·Bottom Nav active
//   labelCaps    Inter   12 / 600  — 대문자 라벨 (자동 uppercase + letterSpacing 0.6)
//   numericMd    Manrope 14 / 700  — 일반 숫자 표시 (Data Table 셀)
//
// [color]
//   primary      text.primary           — 본문/제목 기본
//   secondary    text.secondary         — 부제, 설명
//   muted        text.muted             — 흐릿한 메타데이터
//   accent       primary.action         — 강조 액센트 (모드별 색상)
//   inverse      text.primaryInverse    — 반대 모드 텍스트 (어두운 배경 위 등)
// ============================================================================

import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
import styled from 'styled-components/native';

export type TextVariant =
  /** Manrope 32 / 700 · 메인 페이지 큰 제목 */
  | 'displayLg'
  /** Manrope 20 / 600 · 카드 제목, 섹션 헤더 */
  | 'headlineMd'
  /** Manrope 17 / 600 · Stack Navigator 헤더 타이틀 */
  | 'headlineSm'
  /** Inter 16 / 400 · 기본 본문 */
  | 'bodyBase'
  /** Inter 14 / 400 · 보조 본문, 데이터 테이블 셀 */
  | 'bodySm'
  /** Inter 13 / 400 · Toast description, 보조 메타데이터 */
  | 'bodyXs'
  /** Inter 11 / 600 · Bottom Tab 라벨 */
  | 'labelSm'
  /** Inter 13 / 600 · Input·Settings Row 라벨 */
  | 'labelMd'
  /** Inter 14 / 600 · Segmented Control·Bottom Nav active */
  | 'labelLg'
  /** Inter 12 / 600 · 대문자 라벨 (자동 uppercase + letterSpacing 0.6) */
  | 'labelCaps'
  /** Manrope 14 / 700 · 일반 숫자 표시 (Data Table 셀) */
  | 'numericMd';

export type TextColor =
  /** text.primary · 본문/제목 기본 */
  | 'primary'
  /** text.secondary · 부제, 설명 */
  | 'secondary'
  /** text.muted · 흐릿한 메타데이터, 캡션 */
  | 'muted'
  /** primary.action · 강조 액센트 (라이트=진한 파랑, 다크=옅은 파랑) */
  | 'accent'
  /** text.primaryInverse · 반대 모드 색상 (어두운 배경 위 등) */
  | 'inverse';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /**
   * theme.typography에서 선택하는 스타일 variant.
   * @default 'bodyBase'
   */
  variant?: TextVariant;
  /**
   * 텍스트 색상 — theme.colors 토큰 매핑. 다크/라이트 모드 자동 전환.
   * @default 'primary'
   */
  color?: TextColor;
  /**
   * 텍스트 정렬.
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';
  /** 최대 표시 줄 수. 초과 시 말줄임표(`…`)로 잘림. */
  numberOfLines?: number;
  children: ReactNode;
  /** RN TextStyle 인라인 스타일 override. */
  style?: StyleProp<TextStyle>;
}

const StyledText = styled.Text<{
  $variant: TextVariant;
  $color: TextColor;
  $align: 'left' | 'center' | 'right';
}>`
  font-family: ${({ theme, $variant }) =>
    theme.typography[$variant].fontFamily};
  font-size: ${({ theme, $variant }) => theme.typography[$variant].fontSize}px;
  font-weight: ${({ theme, $variant }) =>
    theme.typography[$variant].fontWeight};
  line-height: ${({ theme, $variant }) =>
    theme.typography[$variant].lineHeight}px;
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

/**
 * 시맨틱 텍스트 컴포넌트.
 *
 * theme.typography의 10가지 variant + theme.colors의 5가지 color를 props로
 * 받아 RN Text를 렌더한다. 다크/라이트 모드 색상은 ThemeProvider가 자동 전환.
 *
 * @example
 * <Text variant="headlineMd">최근 회차</Text>
 * <Text variant="bodySm" color="muted">2026-05-09 추첨</Text>
 * <Text variant="labelCaps" color="accent">NEW</Text>
 */
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
