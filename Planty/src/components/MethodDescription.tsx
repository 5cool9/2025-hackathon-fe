// src/components/MethodDescription.tsx
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { colors, spacing as SP, radius, txt } from '../theme/tokens';

type Props = {
  headerText: string;
  bodyText: string;
  style?: object;
  headerRight?: React.ReactNode;
  isVisible?: boolean;
};

const screenWidth = Dimensions.get('window').width; // 화면 전체 폭

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
    alignItems: 'center', // 박스 중앙 유지
    marginVertical: SP.md,
    gap: SP.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',     // 화면 전체 폭 사용
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray90,
    flex: 1,           // 남은 공간 차지
    marginRight: 10,   // 오른쪽 토글과 간격
    paddingLeft: SP.lg,
  },
  box: {
    backgroundColor: colors.gray10,
    borderRadius: 8,
    padding: SP.lg,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: screenWidth * 0.9,
  },
  body: {
    ...txt.B2,
    color: colors.gray70,
  },
});
