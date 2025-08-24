// src/screens/NotificationScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
  ActionSheetIOS,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, txt, spacing as SP } from '../theme/tokens';

// ← 뒤로가기 SVG
import IconBack from '../../assets/icon/icon_arrowLeft.svg';

type Noti = {
  id: string;
  title: string;
  body?: string;
  createdAt: number;   // timestamp
  unread: boolean;
  type?: 'system' | 'message' | 'update';
};

const now = Date.now();
const seed: Noti[] = [
  { id: 'n1', title: '새 메시지가 도착했어요', body: '닉네임: 안녕하세요!', createdAt: now - 1000 * 60 * 3,  unread: true,  type: 'message' },
  { id: 'n2', title: '분석이 완료되었어요',    body: '작물 상태 진단 결과를 확인하세요.', createdAt: now - 1000 * 60 * 40, unread: true,  type: 'update' },
  { id: 'n3', title: '공지',                    body: '앱이 업데이트 되었어요.',         createdAt: now - 1000 * 60 * 60 * 5, unread: false, type: 'system' },
];

function fmtTime(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? '오후' : '오전';
  const hh = h % 12 || 12;
  const mm = m.toString().padStart(2, '0');
  return `${ampm} ${hh}:${mm}`;
}

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [list, setList] = useState<Noti[]>(seed);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = useMemo(() => list.filter(n => n.unread).length, [list]);

  const toggleRead = (id: string) => {
    setList(prev => prev.map(n => (n.id === id ? { ...n, unread: !n.unread } : n)));
  };

  const deleteOne = (id: string) => {
    setList(prev => prev.filter(n => n.id !== id));
  };

  const onLongPress = (item: Noti) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['취소', item.unread ? '읽음으로 표시' : '안읽음으로 표시', '삭제'],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 2,
      },
      idx => {
        if (idx === 1) toggleRead(item.id);
        if (idx === 2) deleteOne(item.id);
      }
    );
  };

  const markAllRead = () => {
    setList(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700); // API 연결 자리
  };

  const renderItem = ({ item }: { item: Noti }) => (
    <Pressable
      onPress={() => toggleRead(item.id)}
      onLongPress={() => onLongPress(item)}
      style={[styles.card, !item.unread && styles.cardRead]}
    >
      <View style={[styles.dot, item.unread ? styles.dotOn : styles.dotOff]} />
      <View style={{ flex: 1 }}>
        <Text
          style={[
            txt.B1,
            styles.title,
            item.unread ? { fontWeight: '600', color: colors.gray40 } : { color: colors.gray40 },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {!!item.body && (
          <Text style={[txt.B3, styles.body]} numberOfLines={2}>
            {item.body}
          </Text>
        )}
      </View>
      <Text style={[txt.B5, styles.time]}>{fmtTime(item.createdAt)}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.topBar}>
        {/* 왼쪽: 뒤로가기 */}
        <Pressable
          onPress={() => (navigation as any).goBack()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <IconBack width={28} height={28} />
        </Pressable>

        {/* 가운데: 제목 */}
        <View style={styles.centerTitleWrap}>
          <Text style={[txt.H4, styles.centerTitle]}>알림</Text>
        </View>

        {/* 오른쪽: 모두 읽음 */}
        <Pressable onPress={markAllRead} hitSlop={10} style={styles.readAllBtn}>
          <Text style={[txt.B3, { color: unreadCount ? '#22A852' : colors.subText }]}>
            모두 읽음({unreadCount})
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[txt.B3, { color: colors.subText }]}>알림이 없어요</Text>
          </View>
        }
        contentContainerStyle={{ padding: SP.lg, paddingTop: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22A852" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // 헤더
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginTop:40
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  // 가운데 제목을 좌우 요소에 영향받지 않게 절대 위치로 중앙정렬
  centerTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerTitle: { color: colors.gray40 },
  readAllBtn: { marginLeft: 'auto', paddingVertical: 6 },

  // 리스트 카드
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  cardRead: { opacity: 0.7 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  dotOn: { backgroundColor: '#22A852' },
  dotOff: { backgroundColor: '#D6D6D6' },
  title: { marginBottom: 2 },
  body: { color: colors.subText },
  time: { color: colors.subText, marginLeft: 8 },
  empty: { alignItems: 'center', paddingTop: 80 },
});
