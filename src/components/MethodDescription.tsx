// src/components/MethodDescription.tsx
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { colors, spacing as SP, txt } from '../theme/tokens';

type Props = {
  headerText: string;
  bodyText: string;
  style?: object;
  headerRight?: React.ReactNode;
  isVisible?: boolean;
};

const screenWidth = Dimensions.get('window').width;
const CONTENT_WIDTH = screenWidth * 0.9; // ✅ 버튼/다른 컴포넌트와 동일 폭

export default function MethodDescription({ headerText, bodyText, headerRight, isVisible = true }: Props) {
  return (
    <View style={styles.container}>
      {/* header + 오른쪽 토글 */}
      <View style={styles.headerRow}>
        <Text style={styles.header} numberOfLines={1}>
          {headerText}
        </Text>
        {headerRight && <View>{headerRight}</View>}
      </View>

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
    marginVertical: SP.md,
    gap: SP.sm,
    width: CONTENT_WIDTH,
    alignSelf: 'center', // 전체 컨테이너를 가운데
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', // container 안에서 꽉 차게
    // paddingHorizontal 제거
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray90,
    flex: 1,
    marginRight: 10,
    // paddingLeft 제거
  },
  box: {
    backgroundColor: colors.gray10,
    borderRadius: 8,
    padding: SP.lg,
    width: '100%', // container와 동일
  },
  body: {
    ...txt.B2,
    color: colors.gray70,
  },
});
