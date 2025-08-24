import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, spacing as SP, radius, txt } from '../theme/tokens';

interface BtnOvalProps {
  label: string;
  selected?: boolean;          // ✅ 외부에서 선택 상태 받기
  onPress?: () => void;
}

export default function BtnOval({ label, selected = false, onPress }: BtnOvalProps) {
  return (
    <TouchableOpacity
      style={[styles.button, selected ? styles.enabled : styles.disabled]}
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[txt.B2, selected ? styles.textEnabled : styles.textDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: SP.md,
    width: 130,
  },
  enabled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.gray10,
    borderColor: colors.border,
  },
  textEnabled: {
    color: colors.gray0, // 흰색
  },
  textDisabled: {
    color: colors.text, // 기본 본문색
  },
});