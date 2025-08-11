// src/screens/UIPlaygroundScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ChatBubble from '../components/ChatBubble';
import ChatQuickReply from '../components/ChatQuickReply';
import { colors, spacing } from '../theme/tokens';

export default function UIPlaygroundScreen() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* 상대 텍스트 */}
      <ChatBubble
        side="left"
        text="채팅내용채팅내용채팅내용채팅내용채팅내용채팅내용"
        time="오후 6:14"
        showAvatar
        avatarSource={{ uri: 'https://picsum.photos/80?1' }}
      />

      {/* 나 텍스트 */}
      <View style={s.gap} />
      <ChatBubble
        side="right"
        text="채팅내용채팅내용채팅내용채팅내용채팅내용채팅내용"
        time="오후 6:14"
      />

      {/* 나 이미지 */}
      <View style={s.gap} />
      <ChatBubble
        side="right"
        imageSource={{ uri: 'https://picsum.photos/100/133?2' }}
        time="오후 6:14"
      />

      {/* 상대 이미지 */}
      <View style={s.gap} />
      <ChatBubble
        side="left"
        imageSource={{ uri: 'https://picsum.photos/100/133?3' }}
        time="오후 6:14"
        showAvatar
        avatarSource={{ uri: 'https://picsum.photos/80?4' }}
      />

      {/* 상대 텍스트 + 퀵리플라이 */}
      <View style={s.gap} />
      <ChatBubble
        side="left"
        text="채팅내용채팅내용채팅내용채팅내용채팅내용채팅내용"
        time="오후 6:14"
        showAvatar
        avatarSource={{ uri: 'https://picsum.photos/80?5' }}
        />
        <ChatQuickReply
        options={['내용', '내용', '내용', '내용', '내용']}
        align="left"
        indentLeft={44}   // 아바타36 + 간격8
        />
            </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, rowGap: spacing.lg },
  gap: { height: spacing.lg },
});
