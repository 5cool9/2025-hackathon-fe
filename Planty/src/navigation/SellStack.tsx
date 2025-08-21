import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SellScreen from '../screens/SellScreen';
import SellDetailScreen from '../screens/SellDetailScreen';
import SelectPlantScreen from '../screens/SelectPlantScreen';
import SellCreateScreen from '../screens/SellCreateScreen';
import DiaryListScreen from '../screens/DiaryListScreen';
import DiaryDetailScreen from '../screens/DiaryDetailScreen';
import AIChatScreen from '../screens/AIChatScreen';

export type PlantItem = {
  id: string;
  name: string;
  startDate: string;   // “25.08.20.”
  harvestDate: string; // “25.09.02.”
  image: string;       // uri
};

export type CreatedPostDraft = {
  plant: PlantItem;
  title: string;
  description: string;
  price: number;
  images: string[];
};

// ✨ 수정 모드로 글쓰기 열 때 넘길 페이로드
export type SellCreateEditPayload = {
  id: string;
  plant: PlantItem;
  title: string;
  description: string;
  price: number;
  images: string[];
};

export type SellStackParamList = {
  SellList: { q?: string } | undefined;
  SellDetail:
    | { postId: string; isMine?: boolean }
    | { draft: CreatedPostDraft; isMine: true };

  DiaryList:   { userId: string; userName: string };
  DiaryDetail: { noteId: string };

  // 글쓰기(신규/수정 겸용)
  SellCreate:
    | { plant: PlantItem }               // 신규
    | { edit: SellCreateEditPayload };   // 수정

  // 플로팅 버튼 → 작물 선택
  SelectPlant: undefined;
  AIChat: undefined;
};

const Stack = createNativeStackNavigator<SellStackParamList>();

export default function SellStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }}>
      <Stack.Screen name="SellList" component={SellScreen} />
      <Stack.Screen name="SellDetail" component={SellDetailScreen} />
      <Stack.Screen name="SelectPlant" component={SelectPlantScreen} />
      <Stack.Screen name="SellCreate" component={SellCreateScreen} />
      <Stack.Screen name="DiaryList" component={DiaryListScreen} />
      <Stack.Screen name="DiaryDetail" component={DiaryDetailScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
    </Stack.Navigator>
  );
}
