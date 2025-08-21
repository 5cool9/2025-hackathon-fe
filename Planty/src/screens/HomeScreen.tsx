// src/screens/HomeScreen.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/tokens';

export default function HomeScreen() {
  const nav = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe}>
      {/* 알림 아이콘 (누르면 알림 화면으로 이동) */}
      <Pressable
        onPress={() => nav.navigate('Notifications')}
        style={styles.bell}
        hitSlop={10}
      >
        <Image
          source={require('../../assets/icon/bellOff.png')}
          style={styles.bellIcon}
          resizeMode="contain"
        />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg, // 필요 없으면 '#fff'로 바꿔도 됨
  },
  bell: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
  },
  bellIcon: {
    width: 24,
    height: 24,
  },
});
