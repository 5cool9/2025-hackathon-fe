// src/components/ListNote.tsx
import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { colors, spacing, radius, txt } from '../theme/tokens';

type Props = {
  title: string;
  preview: string;
  imageUri?: string;
  imageSource?: ImageSourcePropType;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
};

function ListNote({
  title,
  preview,
  imageUri,
  imageSource,
  onPress,
  style,
  testID,
}: Props) {
  const hasImage = !!(imageUri || imageSource);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, style]}
      testID={testID}
      android_ripple={{ color: colors.gray15 }}
    >
      <View style={hasImage ? styles.rowWithImage : styles.rowNoImage}>
        {/* 텍스트 영역 */}
        <View style={[styles.textWrap, hasImage && { marginRight: spacing.md }]}>
          <Text style={[txt.H5, { color: colors.gray40 }]} numberOfLines={1}>
            {title}
          </Text>
          <Text
            style={[txt.B3, { color: colors.subText }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {preview}
          </Text>
        </View>

        {/* 이미지가 있을 때만 */}
        {hasImage && (
          <Image
            source={imageSource ?? { uri: imageUri! }}
            style={styles.thumb}
          />
        )}
      </View>
    </Pressable>
  );
}

export default memo(ListNote);

const CARD_PADDING_V = 12;
const CARD_PADDING_H = 16;

const styles = StyleSheet.create({
  card: {
    width: 358,
    paddingVertical: CARD_PADDING_V,
    paddingHorizontal: CARD_PADDING_H,
    backgroundColor: colors.gray10,
    borderRadius: radius.md,
    minHeight: 70 + CARD_PADDING_V * 2,
  },
  rowWithImage: {
    flexDirection: 'row',
    alignItems: 'center', // 이미지 있을 때 세로 가운데
    columnGap: spacing.sm,
  },
  rowNoImage: {
    flexDirection: 'row',
    paddingTop: 8,
    alignItems: 'center', // 이미지 없을 때 상단 정렬
    columnGap: spacing.sm,
  },
  textWrap: {
    flex: 1,
    rowGap: 4,
  },
  thumb: {
    width: 70,
    height: 70,
    backgroundColor: '#D9D9D9',
    borderRadius: radius.md,
  },
});
