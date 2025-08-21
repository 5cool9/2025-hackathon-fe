import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors, spacing as SP, txt } from '../theme/tokens';

type Props = {
  images: (string | null)[];     // null이면 placeholder
  sidePadding?: number;          // 좌우 여백(화면 밖과 맞추려고)
  radius?: number;               // 모서리
  aspectRatio?: number;          // 기본 1(정사각)
  showBadge?: boolean;           // "x / N" 배지 표시
  onIndexChange?: (idx: number) => void;
};

export default function ImageCarousel({
  images,
  sidePadding = SP.lg,
  radius = 8,
  aspectRatio = 1,
  showBadge = true,
  onIndexChange,
}: Props) {
  const { width } = useWindowDimensions();
  const itemW = useMemo(() => width - sidePadding * 2, [width, sidePadding]);
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / itemW);
    if (idx !== page) {
      setPage(idx);
      onIndexChange?.(idx);
    }
  };

  return (
    <View style={{ paddingHorizontal: sidePadding }}>
      <View style={[styles.wrap, { width: itemW, borderRadius: radius }]}>
        <FlatList
          data={images}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={[styles.item, { width: itemW, aspectRatio }]}>
              {item ? (
                <Image source={{ uri: item }} style={styles.img} />
              ) : (
                <View style={[styles.placeholder, { borderRadius: radius }]} />
              )}
            </View>
          )}
        />

        {showBadge && (
          <View style={styles.badge}>
            <View style={styles.badgePill}>
              <Text style={[txt.B3, { color: colors.gray0 }]}>
                {page + 1} / {images.length}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  item: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.gray10,
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  badgePill: {
    backgroundColor: colors.gray90_70,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
