// src/components/TabBarBackground.ios.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function TabBarBackground() {
  return (
    <BlurView
      tint="default"          // iOS 재질 느낌: 'systemChromeMaterial'로 교체 가능(Expo 버전 호환 시)
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
