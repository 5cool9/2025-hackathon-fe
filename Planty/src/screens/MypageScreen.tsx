import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image, FlatList, Pressable,
  ActionSheetIOS, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing as SP, txt } from '../theme/tokens';

import ListSalesPd from '../components/ListSalesPd';
import CardMyPlant from '../components/CardMyPlant';
import IconDotMenu from '../../assets/icon/icon_dotMenu.svg';
import type { MyStackParamList } from '../navigation/MyStack';

type Nav = NativeStackNavigationProp<MyStackParamList>;

type SaleRow = { id: string; title: string; time: string; price: string; thumb?: string; soldOut?: boolean; };
type MyPlant = { id: string; name: string; image?: string; done?: boolean; };

const SALES: SaleRow[] = [
  { id: '1', title: '상추 있어요', time: '1시간 전', price: '1,000원', thumb: 'https://placehold.co/70x70' },
  { id: '2', title: '직접 키운 당근 3개 가져가세요~', time: '3시간 전', price: '나눔', thumb: 'https://placehold.co/70x70' },
  { id: '3', title: '파프리카', time: '4시간 전', price: '2,000원', thumb: 'https://placehold.co/70x70', soldOut: true },
  { id: '4', title: '감자 한 박스', time: '1일 전', price: '17,000원', thumb: 'https://placehold.co/70x70', soldOut: true },
];

const DONE_PLANTS: MyPlant[] = [
  { id: 'p1', name: '상추',   image: 'https://placehold.co/169x169', done: true },
  { id: 'p2', name: '샐러리', image: 'https://placehold.co/169x169', done: true },
  { id: 'p3', name: '당근',   image: 'https://placehold.co/169x169', done: true },
];

export default function MypageScreen() {
  const nav = useNavigation<Nav>();
  const [tab, setTab] = useState<'sale' | 'done'>('sale');

  const openMenu = () => {
    const doLogout = () =>
      Alert.alert('로그아웃 하시겠습니까?', '', [
        { text: '취소', style: 'cancel' },
        { text: '확인', style: 'destructive', onPress: () => Alert.alert('로그아웃 완료') },
      ]);

    const goEdit = () =>
      nav.navigate('ProfileEdit', { nickname: '김슈니', userId: 'swuni', avatar: undefined });

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['프로필 수정', '로그아웃', '취소'], cancelButtonIndex: 2, destructiveButtonIndex: 1 },
        (i) => { if (i === 0) goEdit(); if (i === 1) doLogout(); }
      );
    } else {
      // 간단 버전
      Alert.alert('메뉴', '', [
        { text: '프로필 수정', onPress: goEdit },
        { text: '로그아웃', onPress: doLogout, style: 'destructive' },
        { text: '닫기', style: 'cancel' },
      ]);
    }
  };

  const Header = (
    <>
      <View style={{ paddingHorizontal: SP.lg, paddingTop: 16 }}>
        <Text style={[txt.H2, { color: colors.gray90 }]}>MY</Text>
      </View>

      <View style={s.profileRow}>
        <Image source={{ uri: 'https://placehold.co/60x60' }} style={s.avatar} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={[txt.H4, { color: colors.gray90, fontWeight: '700' }]}>김슈니</Text>
          <View style={s.pointChip}><Text style={[txt.B2, { fontWeight: '600' }]}>🌱 600</Text></View>
        </View>
        <Pressable onPress={openMenu} hitSlop={8} style={s.kebabBtn}>
          <IconDotMenu width={22} height={22} />
        </Pressable>
      </View>

      <View style={s.tabs}>
        <Pressable style={s.tabBtn} onPress={() => setTab('sale')}>
          <Text style={[txt.B1, { color: tab === 'sale' ? colors.gray90 : colors.gray40 }]}>판매 작물</Text>
          {tab === 'sale' && <View style={s.tabUnderline} />}
        </Pressable>
        <Pressable style={s.tabBtn} onPress={() => setTab('done')}>
          <Text style={[txt.B1, { color: tab === 'done' ? colors.gray90 : colors.gray40 }]}>재배 완료</Text>
          {tab === 'done' && <View style={s.tabUnderline} />}
        </Pressable>
      </View>
    </>
  );

  if (tab === 'sale') {
    return (
      <SafeAreaView style={s.safe}>
        <FlatList
          data={SALES}
          keyExtractor={(i) => i.id}
          ListHeaderComponent={Header}
          renderItem={({ item }) => (
            <ListSalesPd
              thumbnail={item.thumb ? { uri: item.thumb } : undefined}
              name={item.title}
              time={item.time}
              price={item.price}
              soldOut={item.soldOut}
            />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={DONE_PLANTS}
        key={'done-grid'}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={Header}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: SP.lg, gap: 16 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1, marginTop: 16 }}>
            <CardMyPlant
              thumbnail={item.image ? { uri: item.image } : undefined}
              name={item.name}
              badgeText={item.done ? '재배 완료' : undefined}
              size={169}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  profileRow: {
    marginTop: 12,
    paddingHorizontal: SP.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: { width: 60, height: 60, borderRadius: 999, borderWidth: 1, borderColor: '#D6D6D6' },
  pointChip: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#F5F5F5', borderRadius: 30 },
  kebabBtn: { marginLeft: 'auto', width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  tabs: { marginTop: 18, paddingHorizontal: SP.lg, flexDirection: 'row', justifyContent: 'space-between' },
  tabBtn: { width: (390 - SP.lg * 2) / 2, alignItems: 'center', paddingBottom: 10 },
  tabUnderline: { position: 'absolute', bottom: 0, height: 2, width: '100%', backgroundColor: colors.gray90 },
});
