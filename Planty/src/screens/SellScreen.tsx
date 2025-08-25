// src/screens/SellScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SellStackParamList } from '../navigation/SellStack';

import { colors, spacing as SP, txt } from '../theme/tokens';
import ListSalesPd from '../components/ListSalesPd';

import IconAI from '../../assets/icon/icon_AIchat.svg';
import IconPlus from '../../assets/icon/icon_plus.svg';
import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import IconDeleteKeyword from '../../assets/icon/icon_deleteKeyword.svg';
import { api } from '../api/client';
import { absUrl } from '../utils/url';
import { getAccessToken } from '../utils/token';

type Rt = RouteProp<SellStackParamList, 'SellList'>;

type Row = {
  id: string;
  title: string;
  time: string;
  price: string;
  thumb?: string;
  soldOut?: boolean;
};

const pickItems = (d: any): any[] => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.content)) return d.content;
  return [];
};

const STORAGE_KEY = 'aiChatId';

export default function SellScreen() {
  const [q, setQ] = useState('');
  const [isSearching, setSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const nav = useNavigation<NativeStackNavigationProp<SellStackParamList> | any>();
  const route = useRoute<Rt>();
  const refreshAt = (route.params as any)?.refreshAt;

  useEffect(() => {
    const keyword = route.params?.q;
    if (typeof keyword === 'string' && keyword.length > 0) {
      setQ(keyword);
      setSearching(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [route.params?.q]);

  const mapToRow = (x: any): Row => {
    const b = x?.board ?? x;

    const rawThumb =
      b.thumbnailUrl ??
      b.thumbnailImg ??
      b.thumb ??
      b.imageUrl ??
      b.cropImg ??
      (Array.isArray(b.images) ? b.images[0] : undefined) ??
      (Array.isArray(x.images) ? x.images[0] : undefined) ??
      x.image;

    return {
      id: String(b.id ?? b.boardId),
      title: b.title ?? '',
      time: b.time ?? b.createdAt ?? '',
      price: Number(b.price ?? 0) > 0 ? `${Number(b.price).toLocaleString()}원` : '나눔',
      thumb: absUrl(rawThumb) || undefined,
      soldOut: (b.status ?? '').toUpperCase?.() === 'SOLD_OUT' || !!b.sell,
    };
  };

  const load = useCallback(async () => {
    try {
      if (q.trim()) {
        const { data } = await api.get('/api/board/search', { params: { q: q.trim(), page: 0, size: 20 } });
        setRows(pickItems(data).map(mapToRow));
      } else {
        const { data } = await api.get('/api/board', { params: { page: 0, size: 20 } });
        setRows(pickItems(data).map(mapToRow));
      }
    } catch {
      setRows([]);
    }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (typeof refreshAt !== 'undefined') {
      (async () => {
        await load();
        try { nav.setParams({ refreshAt: undefined }); } catch {}
      })();
    }
  }, [refreshAt, load, nav]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // ===== AI 버튼: start 보장 + chatId 전달 (NaN 방지) =====
  const onPressAI = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const savedNum = Number(saved);
      if (Number.isFinite(savedNum) && savedNum > 0) {
        nav.navigate('AIChat', { chatId: savedNum });
        return;
      }
      if (saved && !Number.isFinite(savedNum)) {
        await AsyncStorage.removeItem(STORAGE_KEY); // 잘못 저장된 값 정리
      }

      const token = await getAccessToken();
      const { data } = await api.post('/api/aichat/start', null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const idRaw = data?.id ?? data?.aiChat?.id;
      const id = Number(idRaw);
      if (!Number.isFinite(id) || id <= 0) throw new Error('Invalid aiChat id');

      await AsyncStorage.setItem(STORAGE_KEY, String(id));
      nav.navigate('AIChat', { chatId: id });
    } catch (e) {
      console.warn(e);
      Alert.alert('알림', 'AI 채팅을 시작할 수 없습니다.');
    }
  };

  const onPressFab = () => nav.navigate('SelectPlant');

  const enterSearch = () => setSearching(true);
  const exitSearch = () => { setSearching(false); inputRef.current?.blur(); Keyboard.dismiss(); };

  const renderItem = ({ item }: { item: Row }) => {
    const cell = (
      <ListSalesPd
        thumbnail={item.thumb ? ({ uri: item.thumb } as any) : (undefined as any)}
        name={item.title}
        time={item.time}
        price={item.price}
        soldOut={item.soldOut}
      />
    );
    return <Pressable onPress={() => nav.navigate('SellDetail', { postId: item.id })}>{cell}</Pressable>;
  };

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={s.headerWrap}>
            {isSearching ? (
              <View style={s.searchHeader}>
                <Pressable onPress={exitSearch} hitSlop={10} style={s.backBtn}>
                  <IconBack width={28} height={28} />
                </Pressable>
                <View style={[s.searchPill, { flex: 1 }]}>
                  <TextInput
                    ref={inputRef}
                    style={s.searchInput}
                    value={q}
                    onChangeText={setQ}
                    placeholder="검색"
                    placeholderTextColor={colors.gray30}
                    returnKeyType="search"
                    autoFocus
                  />
                  {!!q && (
                    <Pressable onPress={() => setQ('')} hitSlop={10} style={s.clearBtn}>
                      <IconDeleteKeyword width={24} height={24} color={colors.gray30} fill={colors.gray30} />
                    </Pressable>
                  )}
                </View>
              </View>
            ) : (
              <>
                <View style={s.titleBar}>
                  <Text style={[txt.H2, s.title]}>판매</Text>
                  <Pressable onPress={onPressAI} hitSlop={10} style={s.aiBtn}>
                    <IconAI width={30} height={30} />
                  </Pressable>
                </View>

                <Pressable onPress={enterSearch} style={s.searchPill}>
                  <TextInput
                    ref={inputRef}
                    style={s.searchInput}
                    value={q}
                    onChangeText={setQ}
                    placeholder="검색"
                    placeholderTextColor={colors.gray30}
                    onFocus={enterSearch}
                    returnKeyType="search"
                  />
                </Pressable>
              </>
            )}
          </View>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {!isSearching && (
        <Pressable style={s.fab} onPress={onPressFab} hitSlop={8}>
          <IconPlus width={32} height={32} color={colors.gray0} />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'white' },
  headerWrap: { paddingHorizontal: SP.lg, paddingTop: 16, paddingBottom: 12, backgroundColor: 'white' },
  titleBar: { height: 59, justifyContent: 'center' },
  title: { textAlign: 'left', color: colors.gray90 },
  aiBtn: { position: 'absolute', right: 0, top: 0, height: 59, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  searchHeader: { height: 59, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { paddingVertical: 6, paddingRight: 6 },
  searchPill: { height: 40, paddingHorizontal: 16, backgroundColor: '#F5F5F5', borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  searchInput: { ...txt.B2, color: colors.gray90, flex: 1, fontSize: 16, paddingVertical: 0, includeFontPadding: false, lineHeight: 20 },
  clearBtn: { marginLeft: 8, padding: 2 },
  sep: { height: 0 },
  fab: { position: 'absolute', right: 16, bottom: Platform.select({ ios: 28, android: 24 }), padding: 16, borderRadius: 40, backgroundColor: colors.primary, shadowColor: '#000', shadowOpacity: 0.17, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
});
