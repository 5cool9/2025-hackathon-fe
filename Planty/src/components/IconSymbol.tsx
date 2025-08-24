// src/components/IconSymbol.tsx
// Fallback for using MaterialIcons on Android and web.
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';
import { colors } from '../theme/tokens';

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>;
type IconSymbolName = keyof typeof MAPPING;

/** SF Symbols → Material Icons 매핑 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;

export default function IconSymbol({
  name,
  size = 24,
  color = colors.text,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight; // 시그니처 맞추기용(미사용)
}) {
  const mapped = MAPPING[name] ?? 'help-outline';
  if (__DEV__ && !MAPPING[name]) {
    console.warn(`[IconSymbol] Missing mapping for "${name}", using "help-outline" fallback.`);
  }
  return <MaterialIcons name={mapped} size={size} color={color} style={style} />;
}
