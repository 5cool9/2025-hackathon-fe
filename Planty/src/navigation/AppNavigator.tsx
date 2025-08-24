// src/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from './types';

// ❗️ 탭은 여기서 관리하지 않습니다. (MainTab/BtnTap 제거)
import RegisterScreen from '../screens/RegisterScreen';
import AnalyzeScreen from '../screens/AnalyzeScreen';
import ResultScreen from '../screens/ResultScreen';
import EditregisterScreen from '../screens/EditregisterScreen';
import PlantDetail from '../screens/PlantDetail';
import JournalScreen from '../screens/JournalScreen';
import JournalaiScreen from '../screens/JournalaiScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 필요한 보조 화면들만 유지 */}
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AnalyzeScreen" component={AnalyzeScreen} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} />
      <Stack.Screen name="EditregisterScreen" component={EditregisterScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetail} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="JournalAI" component={JournalaiScreen} />
    </Stack.Navigator>
  );
}
