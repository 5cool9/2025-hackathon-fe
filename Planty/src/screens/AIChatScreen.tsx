// src/screens/AIChatScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing as SP, txt } from '../theme/tokens';
import { api } from '../api/client';
import { getAccessToken } from '../utils/token';

import ChatBubble from '../components/ChatBubble';
import ChatQuickReply from '../components/ChatQuickReply';
import ChatInputBar from '../components/ChatInputBar';

import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import AIProfile from '../../assets/img/img_AIprofile.svg';

type Msg = {
  id: number;
  role: 'user' | 'ai';
  text?: string;
  imageUri?: string;
  time: string;
  quick?: string[];
};

type AiMsg = {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  createdAt: string;
  aiImage?: string | null;
  recommendedBoards?: any[] | null;
};

type GetChatRes = { id: number; createdAt: string; messages: AiMsg[] };
type SendRes = { userMessage: AiMsg; aiMessage: AiMsg };

const STORAGE_KEY = 'aiChatId';
const makeTempId = () => -Math.floor(Date.now() + Math.random() * 1000);

export default function AIChatScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const passedChatId: number | undefined = route?.params?.chatId;

  const [chatId, setChatId] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const sendingRef = useRef(false);

  const nowK = (iso?: string) => {
    const d = iso ? new Date(iso) : new Date();
    const h = d.getHours();
    const ap = h >= 12 ? '오후' : '오전';
    const hh = ((h + 11) % 12) + 1;
    const mm = `${d.getMinutes()}`.padStart(2, '0');
    return `${ap} ${hh}:${mm}`;
  };

  const authHeaders = async () => {
    const token = await getAccessToken();
    return { Authorization: `Bearer ${token}` };
  };

  const aiToUi = (m: AiMsg): Msg => ({
    id: m.id,
    role: m.sender === 'ai' ? 'ai' : 'user',
    text: m.content,
    time: nowK(m.createdAt),
    quick: Array.isArray(m.recommendedBoards) && m.recommendedBoards.length
      ? m.recommendedBoards.map((b: any) => b?.title ?? '열람하기')
      : undefined,
  });

  const loadChat = useCallback(async (id: number) => {
    if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid chatId for GET');
    const { data } = await api.get<GetChatRes>(`/api/aichat/${id}`, {
      headers: await authHeaders(),
    });
    setChatId(data.id);
    setMsgs(data.messages.map(aiToUi));
  }, []);

  const startChat = useCallback(async () => {
    const { data } = await api.post(`/api/aichat/start`, null, {
      headers: await authHeaders(),
    });
    const id = Number(data?.id ?? data?.aiChat?.id);
    if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid aiChat start response');
    setChatId(id);
    await AsyncStorage.setItem(STORAGE_KEY, String(id));
    return id;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) 네비 파라미터 우선
        if (typeof passedChatId === 'number' && Number.isFinite(passedChatId) && passedChatId > 0) {
          setChatId(passedChatId);
          await AsyncStorage.setItem(STORAGE_KEY, String(passedChatId));
          await loadChat(passedChatId);
          return;
        }

        // 2) 저장된 값
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const sid = Number(stored);
        if (Number.isFinite(sid) && sid > 0) {
          await loadChat(sid);
          return;
        }

        // 3) 잘못 저장된 값 제거 후 새로 생성
        if (stored && !Number.isFinite(sid)) await AsyncStorage.removeItem(STORAGE_KEY);
        const newId = await startChat();
        await loadChat(newId);
      } catch (err) {
        console.warn(err);
        Alert.alert('알림', 'AI 채팅방을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [passedChatId, loadChat, startChat]);

  const goToSellSearch = (label: string) => {
    nav.getParent()?.navigate('Sell', { screen: 'SellList', params: { q: label } });
  };

  const handleSendText = async (text: string) => {
    if (!chatId || sendingRef.current) return;
    sendingRef.current = true;

    const tempId = makeTempId();
    const optimistic: Msg = { id: tempId, role: 'user', text, time: nowK() };
    setMsgs(prev => [...prev, optimistic]);

    try {
      const { data } = await api.post<SendRes>(
        `/api/aichat/${chatId}/send`,
        null,
        { params: { content: text }, headers: await authHeaders() },
      );

      setMsgs(prev => {
        const patched = prev.map(m =>
          m.id === tempId
            ? { ...m, id: data.userMessage.id, time: nowK(data.userMessage.createdAt) }
            : m,
        );
        return [...patched, aiToUi(data.aiMessage)];
      });
    } catch (err: any) {
      console.warn(err);
      setMsgs(prev => [
        ...prev.filter(m => m.id !== tempId),
        { id: makeTempId(), role: 'ai', text: '전송에 실패했어요. 잠시 후 다시 시도해 주세요.', time: nowK() },
      ]);
      if (err?.response?.status === 401) {
        Alert.alert('인증 필요', '로그인이 필요합니다.');
      }
    } finally {
      sendingRef.current = false;
    }
  };

  const handleSendImage = (uri: string) => {
    setMsgs(prev => [
      ...prev,
      { id: makeTempId(), role: 'user', imageUri: uri, time: nowK() },
      { id: makeTempId(), role: 'ai', text: '이미지는 현재 텍스트 분석만 지원해요 🙇‍♀️', time: nowK() },
    ]);
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
          avatarElement={!isMe ? <AIProfile width={36} height={36} /> : undefined}
        />
        {!isMe && item.quick?.length ? (
          <ChatQuickReply
            options={item.quick}
            align="left"
            indentLeft={44}
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
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={s.backBtn}>
          <IconBack width={28} height={28} />
        </Pressable>
        <Text style={[txt.H3, { color: colors.text }]}>AI 채팅</Text>
        <View style={{ width: 24, height: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <FlatList
              data={msgs}
              keyExtractor={(m) => String(m.id)}
              renderItem={renderItem}
              contentContainerStyle={s.listContent}
              ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
              ListHeaderComponent={
                msgs.length ? <Text style={[txt.B4, s.dateText]}>{new Date().toISOString().slice(0, 10)}</Text> : null
              }
            />
            <ChatInputBar onSendText={handleSendText} onSendImage={handleSendImage} />
          </>
        )}
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
  listContent: { paddingHorizontal: SP.lg, paddingBottom: 12, gap: 12 },
  dateText: { color: colors.gray25, textAlign: 'center', marginVertical: 8 },
});
