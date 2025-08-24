// src/components/BtnLong.tsx
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from 'react-native';
import { colors, spacing as SP, radius, txt } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;                 // 기본값 false
  iconSource?: ImageSourcePropType;   // require(...) 또는 { uri }
  style?: any;                        // 외부 컨테이너 스타일 오버라이드
  labelStyle?: any;                   // 라벨 스타일 오버라이드
}

export default function BtnLong({
  label,
  onPress,
  disabled = false,
  iconSource,
  style,
  labelStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : styles.buttonEnabled,
        style,
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.content}>
        {iconSource && <Image source={iconSource} style={styles.icon} />}
        <Text
          style={[
            styles.label,
            disabled ? styles.labelDisabled : styles.labelEnabled,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 358,                 // 디자인 기본 폭
    height: 54,                 // 디자인 기본 높이
    borderRadius: radius.md,    // 4
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonEnabled: {
    backgroundColor: colors.primary,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    // Android elevation
    elevation: 6,
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
    marginRight: SP.md, // RN 구버전 gap 대체
  },
  label: {
    ...txt.H4, // 20 / Bold / lineHeight 토큰
  },
  labelEnabled: {
    color: colors.gray0,
  },
  labelDisabled: {
    color: colors.gray0, // 비활성도에서도 흰색 유지(디자인 스펙)
  },
});
