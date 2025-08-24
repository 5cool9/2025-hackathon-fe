import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Logo from '../../assets/img/img_logo.svg';

export default function OnboardingScreen({ navigation }: any) {
  const isLoggedIn = false; // 실제 로그인 여부로 교체

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: isLoggedIn ? 'AppStack' : 'AuthStack' }],
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Logo width={215} height={60} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fff' },
  logo: { fontSize:30, fontWeight:'bold' },
});
