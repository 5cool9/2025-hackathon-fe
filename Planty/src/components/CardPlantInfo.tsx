// components/ListPlantInfo.tsx
import { Pressable, View, Image, StyleSheet, Text, ImageSourcePropType } from 'react-native';
import { colors, spacing, radius, txt } from '../theme/tokens';
const PlantPNG = require('../../assets/img/img_plant.png');

type Props = {
  thumbnail?: string | ImageSourcePropType;
  name: string;
  sowingDate?: string;
  harvestDate?: string;
  harvestDateEnd?: string;
  planned?: boolean;
  active?: boolean;
  onPress?: () => void;
  envPlace?: string;
  temp?: string;
  height?: string;
  mode?: 'schedule' | 'environment'; // 기본값 schedule
};

export default function ListPlantInfo({
  thumbnail,
  name,
  sowingDate,
  harvestDate,
  harvestDateEnd,
  planned,
  active,
  onPress,
  envPlace,
  temp,
  height,
  mode = 'schedule', // 기본값
}: Props) {
  const src: ImageSourcePropType =
    typeof thumbnail === 'string'
      ? { uri: thumbnail }
      : thumbnail ?? PlantPNG;

  return (
    <Pressable onPress={onPress} style={[s.card, active && s.active]}>
      {/* 썸네일 */}
      <Image source={src} style={s.thumb} />

      {/* 텍스트 영역 */}
      <View style={s.textBox}>
        <Text style={s.title}>{name}</Text>

        {mode === 'schedule' && (
          <View style={s.metaBox}>
            {!!sowingDate && (
              <View style={s.metaRow}>
                <Text style={s.label}>재배 시작일</Text>
                <Text style={s.value}>{sowingDate}</Text>
              </View>
            )}
            {!!harvestDate && (
              <View style={s.metaRow}>
                <Text style={s.label}>{planned ? '수확 예정일' : '수확일'}</Text>
                <Text style={s.value}>
                  {harvestDate}
                  {planned && harvestDateEnd ? `\n~ ${harvestDateEnd}` : ''}
                </Text>
              </View>
            )}
          </View>
        )}

        {mode === 'environment' && (
          <View style={s.metaBox}>
            {!!envPlace && (
              <View style={s.metaRow}>
                <Text style={s.label}>환경</Text>
                <Text style={s.value}>{envPlace}</Text>
              </View>
            )}
            {!!temp && (
              <View style={s.metaRow}>
                <Text style={s.label}>기온</Text>
                <Text style={s.value}>{temp}</Text>
              </View>
            )}
            {!!height && (
              <View style={s.metaRow}>
                <Text style={s.label}>높이</Text>
                <Text style={s.value}>{height}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md, // 12
    padding: spacing.md, // 12
    borderRadius: radius.md, // 8
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: radius.sm, // 4
    backgroundColor: colors.gray10,
  },
  textBox: {
    flex: 1,
    height: 120,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: spacing.sm, // 8
  },
  title: {
    color: '#444',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
  },
  metaBox: {
    flexDirection: 'column',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  label: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  value: {
    flexShrink: 1,
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
});
