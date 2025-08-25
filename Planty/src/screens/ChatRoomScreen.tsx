// src/screens/ChatRoomScreen.tsx
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  RefreshControl,
  Alert,
  ActionSheetIOS,        // ⬅️ 추가
} from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../navigation/types';
import { colors, spacing as SP, txt } from '../theme/tokens';
import ChatBubble from '../components/ChatBubble';
import ChatInputBar from '../components/ChatInputBar';
import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import DotMenu from '../../assets/icon/icon_dotMenu.svg';
import { api } from '../api/client';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatRoom'>;

type MsgRow = {
  id: number; chatId: number; senderId: number; content: string;
  read: boolean; chatImg: string | null; createdAt: string; modifiedAt: string;
};
type MeListRow = {
  chatId: number;
  participants: { userId: number; nickname: string; profileImg: string | null }[];
};
type Msg = { id: string; role: 'me' | 'other'; text?: string; imageUri?: string; time: string };

function fmt(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const ap = h >= 12 ? '오후' : '오전';
  const hh = ((h + 11) % 12) + 1;
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${ap} ${hh}:${mm}`;
}

export default function ChatRoomScreen({ navigation, route }: Props) {
  const chatId = String(route.params.conversationId);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef<FlatList>(null);
  const otherIdRef = useRef<number | null>(null);        // 상대 userId
  const myIdRef = useRef<number | null>(null);           // 내 senderId (역할 판별용)
  const participantsRef = useRef<MeListRow['participants'] | null>(null);

  const [otherName, setOtherName] = useState<string>(
    (route.params as any)?.otherName || '채팅'
  );

  const loadingRef = useRef(false);
  const markedReadRef = useRef(false);

  /** 스마트 뒤로가기 */
  const handleBack = useCallback(() => {
    const state = navigation.getState();
    const routes = state?.routes ?? [];
    if (navigation.canGoBack() && routes.length > 1) {
      navigation.goBack();
      return;
    }
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'ChatList' as never }] })
    );
  }, [navigation]);

  /** 대화방 삭제(나가기) */
  const leaveOrDeleteChat = useCallback(async () => {
    const confirm = await new Promise<boolean>(resolve => {
      Alert.alert('대화방 삭제', '정말 이 대화방을 삭제(나가기)할까요?', [
        { text: '취소', style: 'cancel', onPress: () => resolve(false) },
        { text: '삭제', style: 'destructive', onPress: () => resolve(true) },
      ]);
    });
    if (!confirm) return;

    // 백엔드 스펙 불확실 → 여러 엔드포인트 순차 시도
    const attempts: Array<() => Promise<any>> = [
      () => api.delete(`/api/chat/${chatId}`),
      () => api.post(`/api/chat/leave/${chatId}`),
      () => api.patch(`/api/chat/${chatId}/leave`),
      () => api.delete(`/api/chat/delete/${chatId}`),
    ];

    for (const tryCall of attempts) {
      try {
        await tryCall();
        Alert.alert('완료', '대화방이 삭제(나가기)되었습니다.');
        // 목록으로
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: 'ChatList' as never }] })
        );
        return;
      } catch (e: any) {
        // 다음 시도로 넘어가며 조용히 실패
      }
    }
    Alert.alert('실패', '대화방 삭제 API 경로가 달라 실패했습니다. 서버 경로를 확인해 주세요.');
  }, [chatId, navigation]);

  /** 사용자 차단 */
  const blockUser = useCallback(async () => {
    const uid = otherIdRef.current;
    if (!uid) {
      Alert.alert('차단 실패', '상대 사용자 정보를 찾지 못했습니다.');
      return;
    }
    const confirm = await new Promise<boolean>(resolve => {
      Alert.alert('사용자 차단', `정말 ${otherName}님을 차단할까요?`, [
        { text: '취소', style: 'cancel', onPress: () => resolve(false) },
        { text: '차단', style: 'destructive', onPress: () => resolve(true) },
      ]);
    });
    if (!confirm) return;

    // 스펙 불확실 → 여러 방식 순차 시도
    const attempts: Array<() => Promise<any>> = [
      () => api.post(`/api/chat/block/${uid}`),
      () => api.post(`/api/chat/block`, { userId: uid }),
      () => api.post(`/api/users/block/${uid}`),
      () => api.post(`/api/users/block`, { userId: uid }),
      () => api.patch(`/api/chat/block/${uid}`),
    ];

    for (const tryCall of attempts) {
      try {
        await tryCall();
        Alert.alert('완료', '해당 사용자를 차단했습니다.');
        return;
      } catch (e: any) {
        // 다음 시도로 계속
      }
    }
    Alert.alert('실패', '차단 API 경로가 달라 실패했습니다. 서버 경로를 확인해 주세요.');
  }, [otherName]);

  /** 점3개 메뉴 열기 */
  const openMenu = useCallback(() => {
    const show = () => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['사용자 차단', '대화방 삭제', '취소'],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 2,
          },
          (i) => {
            if (i === 0) blockUser();
            else if (i === 1) leaveOrDeleteChat();
          }
        );
      } else {
        Alert.alert('메뉴', '', [
          { text: '사용자 차단', onPress: blockUser },
          { text: '대화방 삭제', style: 'destructive', onPress: leaveOrDeleteChat },
          { text: '취소', style: 'cancel' },
        ]);
      }
    };
    show();
  }, [blockUser, leaveOrDeleteChat]);

  /** 헤더 타이틀 = 상대 닉네임 */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <Text style={[txt.H3, { color: colors.text }]} numberOfLines={1}>
          {otherName || '채팅'}
        </Text>
      ),
      headerTitleAlign: 'center',
      headerLeft: () => (
        <Pressable onPress={handleBack} hitSlop={10} style={styles.headerBtn}>
          <IconBack width={28} height={28} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable onPress={openMenu} hitSlop={10} style={styles.headerBtn}>
          <DotMenu width={28} height={28} />
        </Pressable>
      ),
    });
  }, [navigation, handleBack, openMenu, chatId, otherName]);

  /** 참여자 로드 (상대 닉네임/ID 확보) */
  const loadParticipants = useCallback(async () => {
    const res = await api.get<MeListRow[]>('/api/chat/me');
    const row = (res.data || []).find(r => String(r.chatId) === chatId);
    const list = row?.participants ?? [];
    participantsRef.current = list;

    const other = list[0];
    if (other) {
      otherIdRef.current = other.userId ?? null;
      setOtherName(other.nickname || `사용자 ${other.userId}`);
    }
  }, [chatId]);

  /** 메시지 로드 */
  const loadMessages = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res = await api.get<MsgRow[]>(`/api/chat/${chatId}/messages`);
      const raw: MsgRow[] = Array.isArray(res.data) ? res.data : [];

      if (!myIdRef.current && otherIdRef.current != null) {
        const mine = raw.find(m => m.senderId !== otherIdRef.current!);
        if (mine) myIdRef.current = mine.senderId;
      }

      if (myIdRef.current && participantsRef.current?.length) {
        const cand = participantsRef.current.find(p => p.userId !== myIdRef.current!);
        if (cand?.nickname && cand.nickname !== otherName) {
          setOtherName(cand.nickname);
          otherIdRef.current = cand.userId;
        }
      }

      const ordered = raw
        .slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const mapped: Msg[] = ordered.map(m => {
        const role: 'me' | 'other' =
          otherIdRef.current != null
            ? m.senderId === otherIdRef.current ? 'other' : 'me'
            : myIdRef.current != null
            ? (m.senderId === myIdRef.current ? 'me' : 'other')
            : (m.senderId === ordered[0]?.senderId ? 'other' : 'me');
        return {
          id: String(m.id),
          role,
          text: m.chatImg ? undefined : m.content,
          imageUri: m.chatImg ?? undefined,
          time: fmt(m.createdAt),
        };
      });

      setMsgs(Array.from(new Map(mapped.map(x => [x.id, x])).values()));
    } finally {
      loadingRef.current = false;
    }
  }, [chatId, otherName]);

  /** 읽음 처리 1회 */
  const markReadOnce = useCallback(async () => {
    if (markedReadRef.current) return;
    markedReadRef.current = true;
    try { await api.patch(`/api/chat/read/${chatId}`); } catch {}
  }, [chatId]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try { await loadParticipants(); } catch {}
        if (!mounted) return;
        await loadMessages();
        await markReadOnce();
      })();
      return () => {
        mounted = false;
        loadingRef.current = false;
        markedReadRef.current = false;
      };
    }, [chatId, loadParticipants, loadMessages, markReadOnce])
  );

  const loadOlder = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, [loadMessages]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  /** 전송: senderId 없이 content만 보냄 */
  const sendText = useCallback(async (text: string) => {
    if (!text?.trim()) return;
    const tempId = `temp-${Date.now()}`;
    setMsgs(prev => [...prev, { id: tempId, role: 'me', text, time: fmt(new Date().toISOString()) }]);
    scrollToBottom();
    try {
      const res = await api.post<MsgRow>(`/api/chat/${chatId}/send`, { content: text });
      setMsgs(prev =>
        prev.map(m =>
          m.id === tempId
            ? {
                id: String(res.data.id),
                role: 'me',
                text: res.data.content,
                imageUri: res.data.chatImg ?? undefined,
                time: fmt(res.data.createdAt),
              }
            : m
        )
      );
      scrollToBottom();
    } catch (e) {
      setMsgs(prev => prev.filter(m => m.id !== tempId));
      Alert.alert('전송 실패', '메시지 전송에 실패했습니다.');
    }
  }, [chatId]);

  const sendImage = useCallback(async (uri: string) => {
    const tempId = `img-${Date.now()}`;
    setMsgs(prev => [...prev, { id: tempId, role: 'me', imageUri: uri, time: fmt(new Date().toISOString()) }]);
    scrollToBottom();
    try {
      const res = await api.post<MsgRow>(`/api/chat/${chatId}/send`, { content: '[이미지]' });
      setMsgs(prev =>
        prev.map(m =>
          m.id === tempId
            ? {
                id: String(res.data.id),
                role: 'me',
                text: res.data.content,
                imageUri: res.data.chatImg ?? uri,
                time: fmt(res.data.createdAt),
              }
            : m
        )
      );
      scrollToBottom();
    } catch (e) {
      setMsgs(prev => prev.filter(m => m.id !== tempId));
      Alert.alert('전송 실패', '이미지 전송에 실패했습니다.');
    }
  }, [chatId]);

  const renderItem = ({ item }: { item: Msg }) => (
    <View style={{ marginBottom: 12 }}>
      <ChatBubble
        side={item.role === 'me' ? 'right' : 'left'}
        text={item.text}
        imageSource={item.imageUri ? { uri: item.imageUri } : undefined}
        time={item.time}
        showAvatar={item.role === 'other'}
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
          ref={listRef}
          data={msgs}
          keyExtractor={m => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadOlder} />}
        />
        <ChatInputBar onSendText={sendText} onSendImage={sendImage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  listContent: { paddingHorizontal: SP.lg, paddingBottom: 12, gap: 12, marginTop: 30 },
  headerBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
});
