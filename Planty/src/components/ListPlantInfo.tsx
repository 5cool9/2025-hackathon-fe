import { Pressable, View, Image, StyleSheet, Text, ImageSourcePropType, Platform } from 'react-native';
import { colors, spacing, radius, txt } from '../theme/tokens';
const PlantPNG = require('../../assets/img/img_plant.png');

type Props = {
  thumbnail?: string | ImageSourcePropType; // uri 또는 require(...)
  name: string;
  sowingDate?: string;      // "25.08.20."
  harvestDate?: string;     // "25.09.02."
  planned?: boolean;        // 수확 '예정일' 표기 여부
  active?: boolean;         // 선택 상태(초록 테두리)
  onPress?: () => void;
};

export default function ListPlantInfo({
  thumbnail,
  name,
  sowingDate,
  harvestDate,
  planned = false,
  active = false,
  onPress,
}: Props) {
  const src: ImageSourcePropType =
    typeof thumbnail === 'string' ? { uri: thumbnail } : (thumbnail ?? PlantPNG);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[s.item, active && s.active]}
    >
      <Image source={src} style={s.thumb} />
      <View style={s.right}>
        <Text style={[txt.H4, { color: colors.gray40 }]} numberOfLines={1}>{name}</Text>

        {!!sowingDate && (
          <View style={s.row}>
            <Text style={[txt.B3, s.label]}>재배 시작일</Text>
            <Text style={[txt.B3, s.value]}>{sowingDate}</Text>
          </View>
        )}

        {!!harvestDate && (
          <View style={s.row}>
            <Text style={[txt.B3, s.label]}>{planned ? '수확 예정일' : '수확일'}</Text>
            <Text style={[txt.B3, s.value]}>{harvestDate}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    // gap 대체 (하위 RN 호환)
    // 왼쪽 이미지와 오른쪽 영역 간 간격
    // 이미지에 marginRight로 처리
  },
  active: {
    borderColor: colors.primary,
    borderWidth: 2,
    // 선택 시 살짝 강조를 원하면 아래 사용, 아니면 제거
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 1 }, shadowRadius: 6 }
      : { elevation: 2 }),
  },
  thumb: {
    width: 82,
    height: 82,
    borderRadius: radius.md,
    backgroundColor: colors.gray10,
    marginRight: spacing.md, // gap 대체
  },
  right: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  label: {
    color: colors.subText,
    minWidth: 74,               // 피그마 기준 라벨 폭 고정
    marginRight: spacing.sm,    // 값과 간격
  },
  value: {
    color: colors.gray40,
    flexShrink: 1,
  },
});
