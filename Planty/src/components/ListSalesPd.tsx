import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageSourcePropType } from 'react-native';
import { colors, spacing, txt } from '../theme/tokens';

// ✅ 기본 회색 이미지
const PLACEHOLDER = require('../../assets/img/img_salesPd.png');

type Props = {
  thumbnail?: ImageSourcePropType;
  name: string;
  time: string;
  price: string;
  soldOut?: boolean;
};

export default function ListSalesPd({ thumbnail, name, time, price, soldOut }: Props) {
  const [failed, setFailed] = useState(!thumbnail);

  return (
    <View style={s.card}>
      <View style={s.thumbBox}>
        {/* 썸네일 or 플레이스홀더 */}
        <Image
          source={failed ? PLACEHOLDER : (thumbnail as ImageSourcePropType)}
          style={s.thumb}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />

        {soldOut && (
          <View style={s.overlay}>
            <Text style={s.overlayText}>판매{'\n'}완료</Text>
          </View>
        )}
      </View>

      <View style={s.infoBox}>
        <Text style={s.name} numberOfLines={1}>{name}</Text>
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
    padding: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  thumbBox: { position: 'relative' },
  thumb: { width: 70, height: 70, borderRadius: 4 },
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
    ...txt.B1,
    color: colors.gray0,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoBox: { marginLeft: spacing.md, flex: 1 },
  name: { ...txt.B2, color: colors.gray40 },
  time: { ...txt.B4, color: colors.gray25 },
  price: { ...txt.H5, color: colors.text },
});
