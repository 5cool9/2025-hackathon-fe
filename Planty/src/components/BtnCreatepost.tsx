// src/components/BtnCreatepost.tsx
import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing as SP, radius } from '../theme/tokens';

type Props = {
  onPress?: () => void;
};

export default function BtnCreatepost({ onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="새 글 작성"
    >
      {/* alias(@) 미설정 시 상대경로 */}
      <Image source={require('../../assets/icon/iconPlus.png')} style={styles.icon} />
      {/* alias 설정했다면
      <Image source={require('@/assets/icon/iconPlus.png')} style={styles.icon} />
      */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: SP.lg,            // 16px
    borderRadius: radius.full, // 완전한 원
    backgroundColor: colors.primary,
    // iOS 전용 shadow
    shadowColor: colors.gray90,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
});
