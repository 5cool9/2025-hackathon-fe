import React, { useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';

export default function BtnToggle() {
  const [isOn, setIsOn] = useState(false);
  const offsetX = React.useRef(new Animated.Value(0)).current;  // 애니메이션 값

  const toggleSwitch = () => {
    Animated.timing(offsetX, {
      toValue: isOn ? 0 : 28,  
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
    setIsOn(!isOn);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: isOn ? '#7EB85B' : '#D6D6D6' }]}
      onPress={toggleSwitch}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ translateX: offsetX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 56,
    padding: 4,
    borderRadius: 40,
    justifyContent: 'center',
    // flexDirection: 'row', // 기본은 row, 필요시 명시
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,  // 동그란 원
    backgroundColor: 'white',
  },
});
