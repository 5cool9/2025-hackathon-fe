// components/ListSalesPd.tsx
import React from 'react';
import { View, Image, Text, StyleSheet, ImageSourcePropType } from 'react-native';
import { colors, spacing, radius, txt } from '../theme/tokens';

type Props = {
  thumbnail?: ImageSourcePropType;
  name: string;
  time: string;
  price: string;
  soldOut?: boolean;
};

export default function ListSalesPd({
  thumbnail,
  name,
  time,
  price,
  soldOut,
}: Props) {
  return (
    <View style={s.card}>
      <View style={s.thumbBox}>
        <Image source={thumbnail} style={s.thumb} />
        {soldOut && (
          <View style={s.overlay}>
            <Text style={s.overlayText}>판매{'\n'}완료</Text>
          </View>
        )}
      </View>

      <View style={s.infoBox}>
        <Text style={s.name}>{name}</Text>
        <Text style={s.time}>{time}</Text>
        <Text style={s.price}>{price}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,          // 16
    borderBottomWidth: 1,
    borderColor: colors.border,   // tokens
    backgroundColor: colors.bg,   // tokens
  },
  thumbBox: { position: 'relative' },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 4,      // 8 or 4 등 tokens 값
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0,
    width: 70, height: 70,
    backgroundColor: 'rgba(34,34,34,0.7)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    ...txt.B1,                    // 14 / medium (읽기 좋은 굵기)
    color: colors.gray0,          // #fff
    textAlign: 'center',
    lineHeight: 24,               // B3 기본이면 유지, 더 촘촘히 원하면 조정
  },
  infoBox: {
    marginLeft: spacing.md,       // 16
    flex: 1,
  },
  // ▼ 텍스트 토큰 적용 (디자인 값에 맞춰 선택)
  name: {
    ...txt.B2,                    // 16 / medium
    color: colors.gray40,         // #444444
  },
  time: {
    ...txt.B4,                    // 12 / semibold
    color: colors.gray25,         // #A2A2A2
  },
  price: {
    ...txt.H5,                    // 18 / bold
    color: colors.text,           // #222222
  },
});
