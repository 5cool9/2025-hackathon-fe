// src/components/MethodDescription.tsx
import React from 'react';
import { StyleSheet, Text, View, Dimensions, ViewStyle } from 'react-native';
import { colors, spacing as SP, radius, txt } from '../theme/tokens';

type Props = {
  headerText: string;
  bodyText: string;
  /** 바깥 컨테이너 스타일 오버라이드 */
  style?: ViewStyle;
  /** 우측 헤더 액션(예: 토글/더보기 버튼) */
  headerRight?: React.ReactNode;
  /** 본문(회색 박스) 노출 여부 */
  isVisible?: boolean;
};

const screenWidth = Dimensions.get('window').width;
/** 버튼/카드들과 동일한 레이아웃 폭 유지 */
const CONTENT_WIDTH = screenWidth * 0.9;

export default function MethodDescription({
  headerText,
  bodyText,
  headerRight,
  isVisible = true,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      {/* 헤더(제목 + 우측 액션) */}
      <View style={styles.headerRow}>
        <Text style={styles.header} numberOfLines={1}>
          {headerText}
        </Text>
        {headerRight ? <View>{headerRight}</View> : null}
      </View>

      {/* 본문 박스 */}
      {isVisible && (
        <View style={styles.box}>
          <Text style={styles.body}>{bodyText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CONTENT_WIDTH,
    alignSelf: 'center',
    marginVertical: SP.md,
    gap: SP.sm,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    ...txt.H4,                // 20 / Bold
    color: colors.gray90,
    flex: 1,
    marginRight: 10,
  },
  box: {
    width: '100%',
    padding: SP.lg,
    borderRadius: radius.lg,  // 8
    backgroundColor: colors.gray10, // #F5F5F5
  },
  body: {
    ...txt.B2,
    color: colors.gray70,
  },
});