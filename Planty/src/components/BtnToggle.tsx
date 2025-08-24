// src/components/BtnToggle.tsx
import React, { useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, radius } from '../theme/tokens';

type Props = {
  value: boolean;                     // 현재 토글 상태
  onValueChange: (val: boolean) => void; // 상태 변경 시 부모에 전달
};

export default function BtnToggle({ value, onValueChange }: Props) {
  const WIDTH = 56;
  const PADDING = 4;
  const KNOB = 20;
  const travel = WIDTH - KNOB - PADDING * 2;

  const offsetX = React.useRef(new Animated.Value(value ? travel : 0)).current;

  React.useEffect(() => {
    Animated.timing(offsetX, {
      toValue: value ? travel : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const containerStyle: ViewStyle = {
    width: WIDTH,
    padding: PADDING,
    borderRadius: radius.full,
    backgroundColor: value ? colors.primary : colors.gray20,
  };

  const toggleSwitch = () => {
    onValueChange(!value);
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={toggleSwitch}
      activeOpacity={0.8}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: KNOB,
            height: KNOB,
            borderRadius: radius.full,
            transform: [{ translateX: offsetX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: colors.gray0, // 흰색
  },
});
