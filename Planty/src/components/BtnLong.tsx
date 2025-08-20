import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ImageSourcePropType } from 'react-native';
import { colors, spacing as SP, radius, txt } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;           
  iconSource?: ImageSourcePropType; 
  style?: any;          
  labelStyle?: any;
}

export default function BtnLong({ label, onPress, disabled = false, iconSource, style, labelStyle, }: ButtonProps ) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled ? styles.buttonDisabled : styles.buttonEnabled, style]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.content}>
        {iconSource && <Image source={iconSource} style={styles.icon} />}
        <Text style={[styles.label, disabled ? styles.labelDisabled : styles.labelEnabled, labelStyle]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,    
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonEnabled: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.gray20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: SP.md, // gap 대체 (RN 구버전 호환)
  },
  label: {
    ...txt.H4, // 20 / Bold / lineHeight 토큰 적용
  },
  labelEnabled: {
    color: colors.gray0, // #fff
  },
  labelDisabled: {
    color: colors.gray0, // 비활성도 흰색 유지(디자인 유지)
  },
});
