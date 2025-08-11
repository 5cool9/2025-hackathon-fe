import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;  // 기본값 false
  iconSource?: any;    // 아이콘 이미지 (require 또는 URI)
}

export default function Button({ label, onPress, disabled = false, iconSource }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled ? styles.buttonDisabled : styles.buttonEnabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={styles.content}>
        {iconSource && <Image source={iconSource} style={styles.icon} />}
        <Text style={[styles.label, disabled ? styles.labelDisabled : styles.labelEnabled]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
    width: 358,
  },
  buttonEnabled: {
    backgroundColor: '#7EB85B',
  },
  buttonDisabled: {
    backgroundColor: '#D6D6D6',
  },
  content: {
    flexDirection: 'row',   // 아이콘과 텍스트를 가로로 나란히 배치
    alignItems: 'center',
    gap: 12,          
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
  },
  labelEnabled: {
    color: '#fff',
  },
  labelDisabled: {
    color: '#fff',
  },
});
