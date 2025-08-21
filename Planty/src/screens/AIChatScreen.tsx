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
import { useNavigation } from '@react-navigation/native';
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

export default function AIChatScreen() {
  // ❗️반드시 괄호 포함해 호출해야 함 (괄호 누락 시 any 함수로 인식되어 goBack/getParent 에러 발생)
  const nav = useNavigation<any>();

  // 퀵리플라이 → 판매 탭의 리스트로 이동 + 검색어 전달
  const goToSellSearch = (label: string) => {
    nav.getParent()?.navigate('Sell', {
      screen: 'SellList',
      params: { q: label },
    });
  };

  const [msgs, setMsgs] = useState<Msg[]>(seed);

  const now = () => {
    const d = new Date();
    const h = d.getHours();
    const ap = h >= 12 ? '오후' : '오전';
    const hh = ((h + 11) % 12) + 1;
    const mm = `${d.getMinutes()}`.padStart(2, '0');
    return `${ap} ${hh}:${mm}`;
  };

  // 텍스트 전송
  const handleSendText = (text: string) => {
    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text, time: now() };
    setMsgs(prev => [...prev, userMsg]);

    // 데모용 더미 응답
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

  // 이미지 전송(갤러리 선택)
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

  const renderItem = ({ item }: { item: Msg }) => {
    const isMe = item.role === 'user';

    return (
      <View style={{ marginBottom: 12 }}>
        <ChatBubble
          side={isMe ? 'right' : 'left'}
          text={item.text}
          imageSource={item.imageUri ? { uri: item.imageUri } : undefined}
          time={item.time}
          showAvatar={!isMe}
          // ChatBubble에 avatarElement prop이 있어야 합니다.
          avatarElement={!isMe ? <AIProfile width={36} height={36} /> : undefined}
        />

        {/* AI 퀵리플라이 → 판매 검색으로 이동 */}
        {!isMe && item.quick?.length ? (
          <ChatQuickReply
            options={item.quick}
            align="left"
            indentLeft={44}       // 아바타(36) + gap(8)
            maxInline={3}
            onPressOption={goToSellSearch}
            style={{ marginTop: 4 }}
          />
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* 헤더 */}
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={s.backBtn}>
          <IconBack width={28} height={28} />
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
          contentContainerStyle={s.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
          ListHeaderComponent={<Text style={[txt.B4, s.dateText]}>2025.08.17</Text>}
        />

        <ChatInputBar onSendText={handleSendText} onSendImage={handleSendImage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
});
