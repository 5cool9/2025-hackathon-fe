// src/components/MethodDescription.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing as SP, radius, txt } from '../theme/tokens';

type Props = {
  headerText: string;
  bodyText: string;
};

export default function MethodDescription({ headerText, bodyText }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{headerText}</Text>
      <View style={styles.box}>
        <Text style={styles.body}>{bodyText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SP.sm,               // RN 버전에 따라 필요 시 아래 줄 추가: marginTop: SP.sm
  },
  header: {
    ...txt.H4,                // 20 / Bold
    color: colors.gray90,      
    alignSelf: 'flex-start',
  },
  box: {
    padding: SP.lg,           // 16
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SP.sm,
    borderRadius: radius.lg,  // 8
    backgroundColor: colors.gray10, // #F5F5F5
    width: 358,               // 디자인 고정폭 유지 (필요 없으면 제거 가능)
  },
  body: {
    ...txt.B2,               
    color: colors.gray70,  
  },
});
