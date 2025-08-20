import 'react-native-get-random-values';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import { RegisterProvider } from './src/context/RegisterContext';
import { JournalProvider } from './src/context/JournalContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [loaded] = useFonts({
    Pretendard: require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
  });

  if (!loaded) return null;

  return (
    <RegisterProvider>
      <JournalProvider> 
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
      </JournalProvider> 
    </RegisterProvider>
  );
}
