import { Pressable, View, Image, StyleSheet, Text, ImageSourcePropType } from 'react-native';
import { colors, spacing, radius, txt } from '../theme/tokens';
const PlantPNG = require('../../assets/img/img_plant.png');

type Props = {
  thumbnail?: string | ImageSourcePropType; // uri 또는 require(...)
  name: string;
  sowingDate?: string;      // "25.08.20." 같은 문자열
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
  planned,
  active,
  onPress,
}: Props) {
  const src: ImageSourcePropType =
  typeof thumbnail === 'string'
    ? { uri: thumbnail }           // 원격 URL
    : thumbnail ?? PlantPNG;       // thumbnail이 없으면 로컬 PNG 사용

  return (
    <Pressable onPress={onPress} style={[s.item, active && s.active]}>
      <Image source={src} style={s.thumb} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={txt.H5}>{name}</Text>

        {!!sowingDate && (
          <View style={s.row}>
            <Text style={[txt.B3, s.muted]}>재배 시작일</Text>
            <Text style={txt.B3}>{sowingDate}</Text>
          </View>
        )}

        {!!harvestDate && (
          <View style={s.row}>
            <Text style={[txt.B3, s.muted]}>{planned ? '수확 예정일' : '수확일'}</Text>
            <Text style={txt.B3}>{harvestDate}</Text>
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
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowOpacity: 0.08,
  },
  thumb: { width: 82, height: 82, borderRadius: radius.md, backgroundColor: colors.gray10 },
  row: { flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '56%' },
  muted: { color: colors.subText },
});
