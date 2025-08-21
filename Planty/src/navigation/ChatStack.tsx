// src/navigation/ChatStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import { ChatStackParamList } from './types';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStack() {
  return (
    <Stack.Navigator
      initialRouteName="ChatList"
      // 기본값: 모든 스크린 헤더 숨김
      screenOptions={{ headerShown: false }}
    >
      {/* 헤더 숨김 상태로 사용 (스크린 내부에서 커스텀 헤더 썼죠) */}
      <Stack.Screen name="ChatList" component={ChatListScreen} />

      {/* 채팅방만 헤더 다시 켬 (아이콘/옵션은 ChatRoomScreen에서 setOptions로 이미 커스텀) */}
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={{
          headerShown: true,
          // 제스처 뒤로가기 강화(선택)
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
