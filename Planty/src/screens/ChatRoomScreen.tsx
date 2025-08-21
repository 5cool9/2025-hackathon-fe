// src/screens/AIChatScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing as SP, txt } from '../theme/tokens';

import ChatBubble from '../components/ChatBubble';
import ChatQuickReply from '../components/ChatQuickReply';
import ChatInputBar from '../components/ChatInputBar';

import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import AIProfile from '../../assets/img/img_AIprofile.svg';

type Msg = {
  id: string;
  role: 'user' | 'ai';
  text?: string;
  imageUri?: string;
  time: string;
  quick?: string[];
};

const seed: Msg[] = [
  {
    id: 'm1',
    role: 'user',
    text: '샤브샤브를 하려고 하는데 어떤 재료들이 필요하지?',
    time: '오후 6:14',
  },
  {
    id: 'm2',
    role: 'ai',
    text:
      '샤브샤브에 필요한 재료들 다음과 같아요.\n' +
      '• 배추(특히 알배추)\n' +
      '• 청경채\n' +
      '• 버섯류: 표고, 팽이, 느타리, 새송이\n' +
      '• 쑥갓\n\n' +
      '아래 키워드를 클릭하시면 판매게시글 검색결과로 이동해요.',
    time: '오후 6:14',
    quick: ['배추', '팽이버섯', '청경채', '표고버섯', '쑥갓'],
  },
  {
    id: 'm3',
    role: 'user',
    text: '다음주에 텃밭에 새로운 작물을 심어보려고 하는데 작물 추천해줘',
    time: '오후 6:14',
  },
];

const ROW_W = 358; // ChatBubble의 기본 행 폭과 동일
const AVATAR = 36;
const GAP = 8;

export default function AIChatScreen() {
  const nav = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      const parent = nav.getParent?.();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [nav])
  );

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
    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text, time: now() };
    setMsgs(prev => [...prev, userMsg]);
    setTimeout(() => {
      setMsgs(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'ai',
          text: `“${text}”에 대한 예시 답변입니다.`,
          time: now(),
          quick: ['상추', '방울토마토', '청경채'],
        },
      ]);
    }, 300);
  };

  const handleSendImage = (uri: string) => {
    const userMsg: Msg = { id: `uimg-${Date.now()}`, role: 'user', imageUri: uri, time: now() };
    setMsgs(prev => [...prev, userMsg]);
    setTimeout(() => {
      setMsgs(prev => [
        ...prev,
        { id: `aimg-${Date.now()}`, role: 'ai', text: '이미지 잘 받았어요! 👀', time: now() },
      ]);
    }, 300);
  };

  const handlePressQuick = (label: string) => handleSendText(label);

  const renderItem = ({ item }: { item: Msg }) => {
    const isMe = item.role === 'user';

    // 내 메시지
    if (isMe) {
      return (
        <View style={{ marginBottom: 12 }}>
          <ChatBubble
            side="right"
            text={item.text}
            imageSource={item.imageUri ? { uri: item.imageUri } : undefined}
            time={item.time}
            showAvatar={false}
          />
        </View>
      );
    }

    // AI 메시지 (왼쪽 아바타를 화면에서 직접 배치 → 버블 폭을 줄여 정렬)
    return (
      <View style={{ marginBottom: 12 }}>
        <View style={styles.aiRow}>
          <AIProfile width={AVATAR} height={AVATAR} />
          <ChatBubble
            side="left"
            text={item.text}
            imageSource={item.imageUri ? { uri: item.imageUri } : undefined}
            time={item.time}
            showAvatar={false}               // ChatBubble 내부 아바타는 숨김
            style={{ width: ROW_W - (AVATAR + GAP) }} // 358 - (36+8) = 314
          />
        </View>

        {/* 퀵리플라이: 아바타 폭만큼 들여쓰기 */}
        {item.quick?.length ? (
          <ChatQuickReply
            options={item.quick}
            align="left"
            indentLeft={AVATAR + GAP}  // 44
            maxInline={3}
            onPressOption={handlePressQuick}
            style={{ marginTop: 4 }}
          />
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={styles.backBtn}>
          <IconBack width={24} height={24} />
        </Pressable>
        <Text style={[txt.H3, { color: colors.text }]}>AI 채팅</Text>
        <View style={{ width: 24, height: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <FlatList
          data={msgs}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
          ListHeaderComponent={<Text style={[txt.B4, styles.dateText]}>2025.08.17</Text>}
          keyboardShouldPersistTaps="handled"
        />

        <ChatInputBar onSendText={handleSendText} onSendImage={handleSendImage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 59,
    paddingHorizontal: SP.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  listContent: {
    paddingHorizontal: SP.lg,
    paddingBottom: 12,
    gap: 12,
  },
  dateText: {
    color: colors.gray25,
    textAlign: 'center',
    marginVertical: 8,
  },
  // AI 아바타(36) + gap(8) + ChatBubble(314) = 358 정렬
  aiRow: {
    width: ROW_W,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: GAP,
  },
});
