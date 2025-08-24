// src/screens/ChatListScreen.tsx
import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ListChat from '../components/ListChat';
import { ChatStackParamList } from '../navigation/types';
import { colors, txt, spacing as SP } from '../theme/tokens';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

// 목업 데이터 예시
const conversations = [
  { id: 'c1', nickname: '닉네임', message: '마지막 메시지', time: '18:43', unreadCount: 5 },
];

export default function ChatListScreen() {
  const nav = useNavigation<Nav>();
  const listRef = useRef<FlatList>(null);

  // 탭 아이콘 더블탭 시 상단 스크롤용 (선택)
  useScrollToTop(listRef);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={[txt.H2, { color: colors.gray90 }]}>채팅</Text>
      </View>

      {/* 리스트 */}
      <View style={styles.listWrap}>
        <FlatList
          ref={listRef}
          data={conversations}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ListChat
              nickname={item.nickname}
              message={item.message}
              time={item.time}
              unreadCount={item.unreadCount}
              onPress={() => nav.navigate('ChatRoom', { conversationId: item.id })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={[txt.B3, { color: colors.subText }]}>채팅 기록이 없어요</Text>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  listWrap: {
    flex: 1,
    paddingHorizontal: SP.lg,
    backgroundColor: colors.bg,
  },
  separator: { height: 8 },
  empty: { alignItems: 'center', paddingTop: 48 },
});
