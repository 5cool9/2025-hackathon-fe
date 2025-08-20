// src/components/CardMyPlant.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { colors, spacing, radius, txt } from '../theme/tokens';

type Props = {
  thumbnail?: ImageSourcePropType; // require(...) 또는 { uri }
  name: string;                    // 아래 타이틀
  badgeText?: string;              // 예: "25년 8월 중순"
  size?: number;                   // 정사각형 한 변 (기본 169)
  onPress?: () => void;
};

export default function CardMyPlant({
  thumbnail,
  name,
  badgeText = '25년 8월 중순',
  size = 169,
  onPress,
}: Props) {
  return (
    <Pressable style={[s.wrap, { width: size }]} onPress={onPress}>
      {/* 썸네일 박스 */}
      <View style={[s.tile, { width: size, height: size, borderRadius: 4 }]}>
        {/* 이미지 (없으면 회색 플래스홀더) */}
        {thumbnail ? (
          <Image source={thumbnail} style={[s.thumb, { borderRadius: radius.sm }]} />
        ) : (
          <View
            style={[
              s.thumb,
              { backgroundColor: colors.gray15, borderRadius: radius.sm },
            ]}
          />
        )}

        {/* 좌상단 배지 */}
        {!!badgeText && (
          <View style={s.badge}>
            <Text style={s.badgeTxt}>{badgeText}</Text>
          </View>
        )}
      </View>

      {/* 이름 */}
      <Text style={s.name}>{name}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm, // 8
    marginBottom: spacing.lg,
  },
  tile: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.gray15,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    backgroundColor: 'rgba(34,34,34,0.70)',
    borderTopLeftRadius: 4,      
    borderBottomRightRadius: 4,  
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTxt: {
    ...txt.B4,           // 12 / semibold / 18 lineHeight
    color: colors.gray0, // #ffffff
    textAlign: 'center',
  },
  name: {
    ...txt.B2,           // 16 / medium
    color: colors.gray40,
    textAlign: 'center',
  },
});
