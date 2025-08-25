// src/screens/ChatListScreen.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList, View, Text, StyleSheet, SafeAreaView, RefreshControl, ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ListChat from '../components/ListChat';
import { ChatStackParamList } from '../navigation/types';
import { colors, txt, spacing as SP } from '../theme/tokens';
import { api } from '../api/client';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

type MeListRow = {
  chatId: number;
  participants: { userId: number; nickname: string; profileImg: string | null }[];
  lastMessage: null | {
    id: number; chatId: number; senderId: number; content: string;
    read: boolean; chatImg: string | null; createdAt: string; modifiedAt: string;
  };
  countMessages: number | null;
};

function fmt(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const h = d.getHours();
  const ap = h >= 12 ? '오후' : '오전';
  const hh = ((h + 11) % 12) + 1;
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${ap} ${hh}:${mm}`;
}

export default function ChatListScreen() {
  const nav = useNavigation<Nav>();
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  const [rows, setRows] = useState<MeListRow[]>([]);
  const [initialLoading, setInitialLoading] = useState(false); // 👈 초기 로딩 전용
  const [refreshing, setRefreshing] = useState(false);

  const loadingRef = useRef(false);

  const fetchRooms = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setInitialLoading(true);
    try {
      const res = await api.get<MeListRow[]>('/api/chat/me');
      setRows(res.data ?? []);
    } catch (e: any) {
      console.warn('GET /api/chat/me error', e?.response?.data?.message || String(e));
      setRows([]);
    } finally {
      loadingRef.current = false;
      setInitialLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
      return () => { loadingRef.current = false; };
    }, [fetchRooms])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  }, [fetchRooms]);

  const computedUnread = (row: MeListRow) => {
    const partnerId = row.participants?.[0]?.userId;
    const lm = row.lastMessage;
    if (!partnerId || !lm) return 0;
    return !lm.read && lm.senderId === partnerId ? 1 : 0;
  };

  const sortedRows = useMemo(() => {
    const safeDate = (r: MeListRow) =>
      r.lastMessage?.modifiedAt || r.lastMessage?.createdAt || '1970-01-01T00:00:00Z';
    return [...rows].sort((a, b) => {
      const ua = computedUnread(a);
      const ub = computedUnread(b);
      if ((ub > 0) !== (ua > 0)) return ub - ua;
      return new Date(safeDate(b)).getTime() - new Date(safeDate(a)).getTime();
    });
  }, [rows]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[txt.H2, { color: colors.gray90 }]}>채팅</Text>
      </View>

      {/* 초기 로딩일 때는 당겨서새로고침 대신 중앙 스피너만 */}
      {initialLoading && rows.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={styles.listWrap}>
          <FlatList
            ref={listRef}
            data={sortedRows}
            keyExtractor={(i) => String(i.chatId)}
            renderItem={({ item }) => {
              const partner = item.participants?.[0];
              return (
                <ListChat
                  nickname={partner?.nickname ?? '알 수 없음'}
                  message={item.lastMessage?.content ?? ''}
                  time={fmt(item.lastMessage?.modifiedAt || item.lastMessage?.createdAt)}
                  unreadCount={computedUnread(item)}
                  onPress={() => nav.navigate('ChatRoom', { conversationId: String(item.chatId) })}
                />
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.empty}>
                <Text style={[txt.B3, { color: colors.subText }]}>채팅 기록이 없어요</Text>
              </View>
            )}
            contentContainerStyle={{ paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
            // ❗초기 로딩 플래그를 연결하지 말 것 — 스크롤이 아래로 밀림
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listWrap: { flex: 1, paddingHorizontal: SP.lg, backgroundColor: colors.bg },
  separator: { height: 8 },
  empty: { alignItems: 'center', paddingTop: 48 },
});
