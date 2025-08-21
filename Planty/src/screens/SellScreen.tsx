// src/screens/SellScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TextInput, Pressable, Platform, Keyboard } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SellStackParamList } from '../navigation/SellStack';

import { colors, spacing as SP, txt } from '../theme/tokens';
import ListSalesPd from '../components/ListSalesPd';

// 아이콘
import IconAI from '../../assets/icon/icon_AIchat.svg';
import IconPlus from '../../assets/icon/icon_plus.svg';
import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import IconDeleteKeyword from '../../assets/icon/icon_deleteKeyword.svg';

type Rt = RouteProp<SellStackParamList, 'SellList'>;

type Row = {
  id: string;
  title: string;
  time: string;
  price: string;
  thumb: string;
  soldOut?: boolean;
};

const DATA: Row[] = [
  { id: '1', title: '상추 있어요', time: '1시간 전', price: '1,000원', thumb: 'https://placehold.co/70x70' },
  { id: '2', title: '직접 키운 당근 3개 가져가세요~', time: '3시간 전', price: '나눔', thumb: 'https://placehold.co/70x70' },
  { id: '3', title: '오늘 수확한 가지', time: '4시간 전', price: '6,500원', thumb: 'https://placehold.co/70x70' },
  { id: '4', title: '파프리카', time: '4시간 전', price: '2,000원', thumb: 'https://placehold.co/70x70' },
  { id: '5', title: '감자 한 박스', time: '1일 전', price: '17,000원', thumb: 'https://placehold.co/70x70' },
  { id: '6', title: '직접 캔 고구마', time: '1일전', price: '6,000원', thumb: 'https://placehold.co/70x70' },
  { id: '7', title: '대파와 양파 팝니다.', time: '2일전', price: '3,000원', thumb: 'https://placehold.co/70x70' },
];

export default function SellScreen() {
  const [q, setQ] = useState('');
  const [isSearching, setSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // nav 타입을 any로 두면 AIChat 같은 외부/추가 스크린 네비 오류 안남
  const nav = useNavigation<NativeStackNavigationProp<SellStackParamList> | any>();
  const route = useRoute<Rt>(); // ← 반드시 컴포넌트 최상단에서 호출

  // AIChat에서 넘어온 q 파라미터 처리 (검색모드 + 값 세팅 + 포커스)
  useEffect(() => {
    const keyword = route.params?.q;
    if (typeof keyword === 'string' && keyword.length > 0) {
      setQ(keyword);
      setSearching(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [route.params?.q]);

  const list = useMemo(
    () => DATA.filter(r => r.title.toLowerCase().includes(q.trim().toLowerCase())),
    [q]
  );

  const onPressAI = () => nav.navigate('AIChat');      // AI 채팅으로 이동
  const onPressFab = () => nav.navigate('SelectPlant'); // 글쓰기 플로팅 버튼

  const enterSearch = () => setSearching(true);
  const exitSearch = () => {
    setSearching(false);
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: Row }) => {
    const cell = (
      <ListSalesPd
        thumbnail={{ uri: item.thumb }}
        name={item.title}
        time={item.time}
        price={item.price}
        soldOut={item.soldOut}
      />
    );

    // 요구사항: “직접 캔 고구마”만 상세로 이동
    if (item.title === '직접 캔 고구마') {
      return (
        <Pressable onPress={() => nav.navigate('SellDetail', { postId: item.id })}>
          {cell}
        </Pressable>
      );
    }
    return cell;
  };

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={s.headerWrap}>
            {isSearching ? (
              // 검색 모드 헤더: 뒤로가기 + 검색바 + X
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
              // 기본 헤더: 제목 + AI 버튼 + 검색 진입
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

      {/* 플로팅 + 버튼: 검색 중에는 숨김 */}
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

  headerWrap: {
    paddingHorizontal: SP.lg,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
  },

  /* 기본 헤더 */
  titleBar: { height: 59, justifyContent: 'center' },
  title: { textAlign: 'left', color: colors.gray90 },
  aiBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: 59,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  /* 검색 헤더 */
  searchHeader: { height: 59, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { paddingVertical: 6, paddingRight: 6 },

  /* 검색 바 */
  searchPill: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    ...txt.B2,
    color: colors.gray90,
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    includeFontPadding: false,
    lineHeight: 20,
  },
  clearBtn: { marginLeft: 8, padding: 2 },

  sep: { height: 0 },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.select({ ios: 28, android: 24 }),
    padding: 16,
    borderRadius: 40,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.17,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
