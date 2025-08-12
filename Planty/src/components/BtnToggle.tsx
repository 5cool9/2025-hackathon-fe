// src/components/BtnToggle.tsx
import React, { useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, radius } from '../theme/tokens';

export default function BtnToggle() {
  const [isOn, setIsOn] = useState(false);

  // 치수(디자인 고정값)
  const WIDTH = 56;
  const PADDING = 4;
  const KNOB = 20;

  const travel = useMemo(() => WIDTH - KNOB - PADDING * 2, [WIDTH, KNOB, PADDING]);
  const offsetX = React.useRef(new Animated.Value(0)).current;

  const toggleSwitch = () => {
    Animated.timing(offsetX, {
      toValue: isOn ? 0 : travel,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
    setIsOn((v) => !v);
  };

  const containerStyle: ViewStyle = {
    width: WIDTH,
    padding: PADDING,
    borderRadius: radius.full,
    backgroundColor: isOn ? colors.primary : colors.gray20,
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={toggleSwitch}
      activeOpacity={0.8}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn }}
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
