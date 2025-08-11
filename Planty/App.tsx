import { SafeAreaView, Text } from 'react-native';
import UIPlaygroundScreen from './src/screens/UIPlaygroundScreen';
import { useFonts } from 'expo-font';

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
      <UIPlaygroundScreen />
      {/* 임시 확인용 */}
      {/* <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 18, margin: 16 }}>
        폰트 로드 OK
      </Text> */}
    </SafeAreaView>
  );
}
