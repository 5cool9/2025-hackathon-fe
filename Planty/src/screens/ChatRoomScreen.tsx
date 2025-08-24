// src/screens/ChatRoomScreen.tsx
import React, { useLayoutEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatStackParamList } from '../navigation/types';
import { colors, spacing as SP, txt } from '../theme/tokens';

import ChatBubble from '../components/ChatBubble';
import ChatInputBar from '../components/ChatInputBar';

import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import DotMenu from '../../assets/icon/icon_dotMenu.svg';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatRoom'>;

type Msg = {
  id: string;
  role: 'me' | 'other';
  text?: string;
  imageUri?: string;
  time: string;
};

const seed: Msg[] = [
  { id: 'm1', role: 'other', text: '안녕하세요!', time: '오후 6:12' },
  { id: 'm2', role: 'me', text: '안녕하세요~ 반가워요!', time: '오후 6:13' },
];

export default function ChatRoomScreen({ navigation, route }: Props) {
  const { conversationId } = route.params;

  // 네이티브 헤더 커스텀
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <Text style={[txt.H3, { color: colors.text }]}>
          채팅
        </Text>
      ),
      headerTitleAlign: 'center',
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.headerBtn}>
          <IconBack width={28} height={28} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable onPress={() => { /* 옵션 메뉴 등 */ }} hitSlop={10} style={styles.headerBtn}>
          <DotMenu width={28} height={28} />
        </Pressable>
      ),
    });
  }, [navigation, conversationId]);

  const [msgs, setMsgs] = useState<Msg[]>(seed);

  const now = () => {
    const d = new Date();
    const h = d.getHours();
    const ap = h >= 12 ? '오후' : '오전';
    const hh = ((h + 11) % 12) + 1;
    const mm = `${d.getMinutes()}`.padStart(2, '0');
    return `${ap} ${hh}:${mm}`;
    };

  const handleSendText = (text: string) => {
    const my: Msg = { id: `me-${Date.now()}`, role: 'me', text, time: now() };
    setMsgs(prev => [...prev, my]);
  };

  const handleSendImage = (uri: string) => {
    const my: Msg = { id: `img-${Date.now()}`, role: 'me', imageUri: uri, time: now() };
    setMsgs(prev => [...prev, my]);
  };

  const renderItem = ({ item }: { item: Msg }) => (
    <View style={{ marginBottom: 12 }}>
      <ChatBubble
        side={item.role === 'me' ? 'right' : 'left'}
        text={item.text}
        imageSource={item.imageUri ? { uri: item.imageUri } : undefined}
        time={item.time}
        showAvatar={item.role === 'other'}  // 상대방 메시지에만 아바타 노출(컴포넌트 구현에 따라 무시 가능)
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <FlatList
          data={msgs}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        <ChatInputBar onSendText={handleSendText} onSendImage={handleSendImage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  listContent: {
    paddingHorizontal: SP.lg,
    paddingBottom: 12,
    gap: 12,
    marginTop:30,
  },
  headerBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
