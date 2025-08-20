import { Pressable, View, Image, StyleSheet, Text, ImageSourcePropType, Dimensions } from 'react-native';
import { colors, spacing, radius, txt } from '../theme/tokens';
const PlantPNG = require('../../assets/img/img_plant.png');

const screenWidth = Dimensions.get('window').width; // 화면 전체 폭

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
  mode?: 'schedule' | 'environment';
};

export default function CardPlantInfo({
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
  mode = 'schedule',
}: Props) {
  const src: ImageSourcePropType =
    typeof thumbnail === 'string'
      ? { uri: thumbnail }
      : thumbnail ?? PlantPNG;

  return (
    <Pressable
      onPress={onPress}
      style={[s.card, active && s.active, { width: screenWidth * 0.9 }]} // 화면 90%
    >
      <Image source={src} style={s.thumb} />

      <View style={s.text_box}>
        <Text style={s.title}>{name}</Text>

        {mode === 'schedule' && (
          <View style={s.meta_box}>
            {!!sowingDate && (
              <View style={s.meta_row}>
                <Text style={s.label}>재배 시작일</Text>
                <Text style={s.value}>{sowingDate}</Text>
              </View>
            )}
            {!!harvestDate && (
              <View style={s.meta_row}>
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
          <View style={s.meta_box}>
            {!!envPlace && (
              <View style={s.meta_row}>
                <Text style={s.label}>환경</Text>
                <Text style={s.value}>{envPlace}</Text>
              </View>
            )}
            {!!temp && (
              <View style={s.meta_row}>
                <Text style={s.label}>기온</Text>
                <Text style={s.value}>{temp}</Text>
              </View>
            )}
            {!!height && (
              <View style={s.meta_row}>
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
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 0,
    alignSelf: 'center', // 중앙 정렬
  },
  active: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: radius.sm,
    backgroundColor: colors.gray10,
  },
  text_box: {
    flex: 1,
    height: 120,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    color: '#444',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
  },
  meta_box: {
    flexDirection: 'column',
    gap: 4,
  },
  meta_row: {
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

