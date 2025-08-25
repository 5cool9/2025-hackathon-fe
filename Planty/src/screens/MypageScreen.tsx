// MypageScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image, FlatList, Pressable,
  ActionSheetIOS, Platform, Alert,
} from 'react-native';
import axios from 'axios';
import { useNavigation, NavigationProp, ParamListBase, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing as SP, txt } from '../theme/tokens';

import ListSalesPd from '../components/ListSalesPd';
import CardMyPlant from '../components/CardMyPlant';
import IconDotMenu from '../../assets/icon/icon_dotMenu.svg';
import type { MyStackParamList } from '../navigation/MyStack';
import Token from '../utils/token';

const BASE_URL = 'http://43.200.244.250';

type Nav = NativeStackNavigationProp<MyStackParamList>;

type SaleRow = { id: string; title: string; time: string; price: string; thumb?: string; soldOut?: boolean; };
type MyPlant = { id: string; name: string; image?: string; done?: boolean };

type ProfileRes = { id: number; name: string; point: number; profileImg: string | null; };
type HarvestApiItem = { cropId: number; name: string; thumbnail: string | null; harvest: boolean; };
type BoardApiItem = { boardId: number; title: string; price: number; thumbnailImg: string | null; time: string; sell?: boolean; selI?: boolean; sold?: boolean; };

const normalizeImagePath = (src?: string | null) => {
  if (!src) return undefined;
  if (src.startsWith('http') || src.startsWith('file://')) return src;
  const cleaned = src.replace('/srv/app/app', '');
  return `${BASE_URL}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
};
const formatPrice = (n: number) => (n ? `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원` : '나눔');

export default function MypageScreen() {
  const nav = useNavigation<Nav>();                                   // MyStack
  const rootNav = useNavigation<NavigationProp<ParamListBase>>();     // Root (로그아웃 리셋용)
  const [tab, setTab] = useState<'sale' | 'done'>('sale');

  const [profile, setProfile] = useState<ProfileRes | null>(null);
  const [loading, setLoading] = useState(false);

  const [salesList, setSalesList] = useState<SaleRow[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const [harvestList, setHarvestList] = useState<MyPlant[]>([]);
  const [loadingHarvest, setLoadingHarvest] = useState(false);

  const displayName = useMemo(() => {
    const raw = profile?.name ?? '';
    if (typeof raw === 'string' && raw.trim().startsWith('{')) {
      try { return JSON.parse(raw)?.nickname ?? raw; } catch { return raw; }
    }
    return raw;
  }, [profile?.name]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = Token.getAccessToken();
      if (!token) { Alert.alert('로그인이 필요합니다.', '다시 로그인해 주세요.'); return; }
      setLoading(true);
      const res = await axios.get<ProfileRes>(`${BASE_URL}/api/mypage/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      const msg  = err?.response?.data?.message;
      if (status === 401 && code === 'UNAUTHORIZED') Alert.alert('세션 만료', '인증되지 않은 사용자입니다.');
      else if (status === 405) Alert.alert('요청 오류', '지원하지 않는 메서드입니다.');
      else Alert.alert('오류', msg || '프로필 정보를 불러오지 못했습니다.');
    } finally { setLoading(false); }
  }, []);

  const fetchBoards = useCallback(async () => {
    try {
      const token = Token.getAccessToken();
      if (!token) return;
      setLoadingSales(true);
      const res = await axios.get<BoardApiItem[]>(`${BASE_URL}/api/mypage/boards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mapped: SaleRow[] = (res.data || []).map((b) => {
        const sold = b.sell === true || (b as any).selI === true || (b as any).sold === true;
        return {
          id: String(b.boardId),
          title: b.title,
          time: b.time,
          price: formatPrice(b.price),
          thumb: normalizeImagePath(b.thumbnailImg),
          soldOut: sold,
        };
      });
      setSalesList(mapped);
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      const msg  = err?.response?.data?.message;
      if (status === 401 && code === 'UNAUTHORIZED') Alert.alert('세션 만료', '인증되지 않은 사용자입니다.');
      else if (status === 405) Alert.alert('요청 오류', '지원하지 않는 메서드입니다.');
      else Alert.alert('오류', msg || '판매 게시글을 불러오지 못했습니다.');
    } finally { setLoadingSales(false); }
  }, []);

  const fetchHarvest = useCallback(async () => {
    try {
      const token = Token.getAccessToken();
      if (!token) return;
      setLoadingHarvest(true);
      const res = await axios.get<HarvestApiItem[]>(`${BASE_URL}/api/mypage/harvest-crop`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mapped: MyPlant[] = (res.data || []).map((i) => ({
        id: String(i.cropId),
        name: i.name,
        image: normalizeImagePath(i.thumbnail),
        done: i.harvest,
      }));
      setHarvestList(mapped);
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      const msg  = err?.response?.data?.message;
      if (status === 401 && code === 'UNAUTHORIZED') Alert.alert('세션 만료', '인증되지 않은 사용자입니다.');
      else if (status === 405) Alert.alert('요청 오류', '지원하지 않는 메서드입니다.');
      else Alert.alert('오류', msg || '재배 완료 목록을 불러오지 못했습니다.');
    } finally { setLoadingHarvest(false); }
  }, []);

  useEffect(() => {
    const unsub = nav.addListener('focus', () => {
      fetchProfile();
      if (tab === 'sale') fetchBoards();
      if (tab === 'done') fetchHarvest();
    });
    return unsub;
  }, [nav, tab, fetchProfile, fetchBoards, fetchHarvest]);

  useEffect(() => {
    if (tab === 'sale') fetchBoards();
    if (tab === 'done') fetchHarvest();
  }, [tab, fetchBoards, fetchHarvest]);

  /** ✅ 판매글 상세( SellStack 의 SellDetail )로 이동 */
  const goSellDetail = useCallback(
    (boardId: string) => {
      const params = { postId: boardId, isMine: true };

      // 탭(또는 루트) 네비게이터로 위임해서 SellStack/SellDetail 열기
      // 탭 네임이 'Sell'인 경우 (가장 일반적)
      const parent = (nav as any).getParent?.();
      if (parent?.navigate) {
        parent.navigate('Sell', { screen: 'SellDetail', params });
        return;
      }

      // 혹시 탭 라벨이 'SellStack'인 프로젝트라면 아래로 시도
      try {
        (rootNav as any).navigate('SellStack', { screen: 'SellDetail', params });
      } catch {
        // 마지막 fallback: 같은 스택에 등록돼 있다면(거의 없음)
        (nav as any).navigate('SellDetail', params);
      }
    },
    [nav, rootNav]
  );

  const openMenu = () => {
    const doLogout = () =>
      Alert.alert('로그아웃 하시겠습니까?', '', [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: () => {
            Token.removeAccessToken();
            rootNav.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'AuthStack', params: { screen: 'Login' } }],
              })
            );
          },
        },
      ]);

    const goEdit = () =>
      nav.navigate('ProfileEdit', {
        nickname: displayName || '',
        userId: String(profile?.id ?? ''),
        avatar: profile?.profileImg ?? undefined,
      });

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['프로필 수정', '로그아웃', '취소'], cancelButtonIndex: 2, destructiveButtonIndex: 1 },
        (i) => { if (i === 0) goEdit(); if (i === 1) doLogout(); }
      );
    } else {
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
        <Image
          source={{ uri: normalizeImagePath(profile?.profileImg) ?? 'https://placehold.co/60x60' }}
          style={s.avatar}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={[txt.H4, { color: colors.gray90, fontWeight: '700' }]}>
            {displayName || '김슈니'}
          </Text>
          <View style={s.pointChip}>
            <Text style={[txt.B2, { fontWeight: '600' }]}>
              🌱 {profile?.point ?? 600}
            </Text>
          </View>
        </View>
        <Pressable onPress={openMenu} hitSlop={8} style={s.kebabBtn}>
          <IconDotMenu width={28} height={28} />
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
          data={salesList}
          keyExtractor={(i) => i.id}
          ListHeaderComponent={Header}
          renderItem={({ item }) => (
            <Pressable onPress={() => goSellDetail(item.id)}>
              <ListSalesPd
                thumbnail={item.thumb ? { uri: item.thumb } : undefined}
                name={item.title}
                time={item.time}
                price={item.price}
                soldOut={item.soldOut}
              />
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={harvestList}
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
