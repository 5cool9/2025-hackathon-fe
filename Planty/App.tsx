// App.tsx
import 'react-native-gesture-handler'; // 반드시 최상단!
import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';

import SplashScreen from './src/screens/OnboardingScreen';
import AuthStack from './src/navigation/AuthStack';
import AppStack from './src/navigation/AppStack'; // 이 안에서 BtnTap을 렌더링
import { RegisterProvider } from './src/context/RegisterContext'; // ✅ 추가
import { JournalProvider } from './src/context/JournalContext';

// (선택) 이미 types.ts에 RootStackParamList가 있으면 제너릭 제거해도 됩니다.
type RootStackParamList = {
  Splash: undefined;
  AuthStack: undefined;
  AppStack: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loaded] = useFonts({
    Pretendard:            require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium':   require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold':     require('./assets/fonts/Pretendard-Bold.otf'),
  });
  if (!loaded) return null;

  return (
    <RegisterProvider>
      <JournalProvider>{/* ✅ 여기서 네비게이션 전체를 감쌈 */}
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
            <RootStack.Screen name="Splash" component={SplashScreen} />
            <RootStack.Screen name="AuthStack" component={AuthStack} />
            <RootStack.Screen name="AppStack" component={AppStack} />
          </RootStack.Navigator>
        </NavigationContainer>
      </JournalProvider>
    </RegisterProvider>
  );
}
