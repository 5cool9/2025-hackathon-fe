// src/components/IconSymbol.ios.tsx
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { colors } from '../theme/tokens';

type Props = {
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
};

export default function IconSymbol({
  name,
  size = 24,
  color = colors.text,
  style,
  weight = 'regular',
}: Props) {
  return (
    <SymbolView
      name={name}
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      style={[{ width: size, height: size }, style]}
    />
  );
}
