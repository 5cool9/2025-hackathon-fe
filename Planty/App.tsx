import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import BtnTap from './src/components/BtnTap';   // ✅ import 이름도 BtnTap

export default function App() {
  const [loaded] = useFonts({
    Pretendard:            require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium':   require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold':     require('./assets/fonts/Pretendard-Bold.otf'),
  });
  if (!loaded) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <BtnTap />                          {/* ✅ JSX도 BtnTap */}
      </NavigationContainer>
    </SafeAreaView>
  );
}
