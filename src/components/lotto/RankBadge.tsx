// ============================================================================
// RankBadge — 등수 배지
// ============================================================================
//
// 1~3등: 금·은·동 메달 SVG(왕관 포함) 위에 등수 숫자를 얹는다
//   숫자 대비색은 메달 밝기에 맞춰 LottoBall의 대비 토큰을 재사용한다
//   (금·은=어두운 onLight, 동=흰 onDark)
// 4~5등: 메달 없이 평문 숫자(secondary)
//
// 정렬 기준은 메달 전체가 아니라 "원(circle)"이다. 배지 박스를 원 크기로 두고
// 행 세로 중앙에 놓으면, 숫자가 금액 텍스트와 같은 높이에 정렬된다
// 왕관은 원 위로 오버플로되어 표시된다(메달 원 상단이 SVG y9에 있으므로 9px 위로)
// ============================================================================

import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

import { Text } from '@/components/primitives';

import MedalBronze from '@/assets/medal-bronze.svg';
import MedalGold from '@/assets/medal-gold.svg';
import MedalSilver from '@/assets/medal-silver.svg';

const MEDAL_W = 28;
const MEDAL_H = 37;
const CIRCLE = 28; // 원 지름 — 배지 박스 크기(정렬 기준)
const CROWN_OVERFLOW = 9; // 메달 원 상단이 SVG y9 → 왕관은 박스 위로 9px 오버플로

const MEDALS: Partial<Record<number, FC<SvgProps>>> = {
  1: MedalGold,
  2: MedalSilver,
  3: MedalBronze,
};

const Box = styled.View`
  width: ${CIRCLE}px;
  height: ${CIRCLE}px;
`;

const MedalLayer = styled.View`
  position: absolute;
  top: -${CROWN_OVERFLOW}px;
  left: 0;
`;

const NumberLayer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
`;

export interface RankBadgeProps {
  /** 등수 (1~5). 1~3등은 메달, 4~5등은 평문 숫자 */
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const theme = useTheme();
  const Medal = MEDALS[rank];

  const medalNumberColor =
    rank === 3 ? theme.colors.ball.onDark : theme.colors.ball.onLight;

  return (
    <Box>
      {Medal && (
        <MedalLayer>
          <Medal width={MEDAL_W} height={MEDAL_H} />
        </MedalLayer>
      )}
      <NumberLayer>
        {Medal ? (
          <Text variant="numericMd" style={{ color: medalNumberColor }}>
            {rank}
          </Text>
        ) : (
          <Text variant="numericMd" color="secondary">
            {rank}
          </Text>
        )}
      </NumberLayer>
    </Box>
  );
}
