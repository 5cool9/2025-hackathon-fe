// src/screens/SellDetailScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, Image, StyleSheet, SafeAreaView, Pressable,
  ScrollView, ActionSheetIOS, Alert,
} from 'react-native';
import { colors, spacing as SP, txt } from '../theme/tokens';
import { useNavigation, useRoute, RouteProp, StackActions } from '@react-navigation/native';
import type { SellStackParamList, PlantItem } from '../navigation/SellStack';

import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import IconArrowRight from '../../assets/icon/icon_arrowRight.svg';
import IconChat from '../../assets/icon/icon_chat.svg';
import IconMore from '../../assets/icon/icon_dotMenu.svg';

import ImageCarousel from '../components/ImageCarousel';
import BtnSaleStatus from '../components/BtnSalesStatus';
import { api } from '../api/client';

type SaleStatus = '판매중' | '판매완료';
type R = RouteProp<SellStackParamList, 'SellDetail'>;

type PostDetail = {
  id: string;
  title: string;
  price: number;
  time: string;
  description: string;
  images: (string | null)[];
  seller: { id: string; name: string; avatar: string | null };
  status: SaleStatus;
  plant?: PlantItem;
};

const HOST = 'http://43.200.244.250';
const toAbsImage = (u?: string | null) => {
  if (!u) return undefined;
  const s = String(u);
  if (/^https?:\/\//i.test(s) || s.startsWith('file://')) return s;
  let path = s.replace(/^\/?srv\/app\/app/i, '');
  if (!path.startsWith('/')) path = `/${path}`;
  return `${HOST}${path}`;
};
const extractImages = (src: any): string[] => {
  const out: (string | undefined)[] = [];
  const add = (v?: string | null) => toAbsImage(v);
  if (!src) return [];
  if (typeof src === 'string') out.push(add(src));
  else if (Array.isArray(src)) {
    for (const it of src) {
      if (typeof it === 'string') out.push(add(it));
      else if (it && typeof it === 'object') {
        out.push(add(it.url ?? it.imageUrl ?? it.path ?? it.src ?? it.fileUrl ?? it.filePath));
      }
    }
  } else if (typeof src === 'object') out.push(add(src.url ?? src.imageUrl ?? src.path ?? src.src));
  return out.filter(Boolean) as string[];
};
const fmtDot = (d?: string | null) => {
  if (!d) return '';
  const dt = new Date(d as string);
  if (isNaN(+dt)) return d as string;
  const yy = String(dt.getFullYear()).slice(2);
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}.`;
};
const toStatus = (s: string | boolean | undefined): SaleStatus => {
  if (typeof s === 'boolean') return s ? '판매완료' : '판매중';
  return String(s || '').toUpperCase() === 'SOLD_OUT' ? '판매완료' : '판매중';
};
const pickSellerName = (sellerObj: any): string => {
  const raw = sellerObj?.sellerName ?? sellerObj?.name ?? sellerObj?.nickname ?? '';
  if (!raw) return '판매자';
  try {
    if (typeof raw === 'string') {
      const t = raw.trim();
      if (t.startsWith('{') && t.endsWith('}')) {
        const o = JSON.parse(t);
        return o.nickname || o.name || Object.values(o)[0] || '판매자';
      }
      return raw;
    }
    if (typeof raw === 'object') return raw.nickname || raw.name || '판매자';
    return String(raw);
  } catch {
    return typeof raw === 'string' ? raw : '판매자';
  }
};

export default function SellDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<R>();

  const p = route.params as any | undefined;
  const isDraft = !!(p && 'draft' in p);
  const postId: string | undefined = p && 'postId' in p ? String(p.postId) : undefined;
  const isMineFromRoute: boolean = Boolean(p?.isMine);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [status, setStatus] = useState<SaleStatus>('판매중');
  const [isOwner, setIsOwner] = useState<boolean>(isMineFromRoute);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (isDraft) {
      const d = p!.draft;
      setPost({
        id: 'temp',
        title: d.title,
        price: d.price,
        time: '방금 전',
        description: d.description,
        images: d.images.length ? d.images : [null],
        seller: { id: 'me', name: '나', avatar: 'https://placehold.co/50x50' },
        status: '판매중',
        plant: d.plant,
      });
      setStatus('판매중');
      setIsOwner(true);
      return;
    }
    if (!postId) return;

    (async () => {
      try {
        const { data } = await api.get<any>(`/api/board/details/${postId}`);
        const b = data?.board ?? data ?? {};
        const s = data?.seller ?? {};
        setIsOwner(isMineFromRoute || Boolean(data?.isOwner));

        let imgs = extractImages(b.images ?? data?.imageUrls);
        if (imgs.length === 0) imgs = extractImages(b.thumbnailImg ?? b.thumbnailUrl ?? b.imageUrl);

        const mapped: PostDetail = {
          id: String(b.boardId ?? b.id ?? postId),
          title: b.title ?? '',
          price: Number(b.price ?? 0),
          time: b.createdAt ? fmtDot(b.createdAt) : '',
          description: b.content ?? '',
          images: imgs.length ? imgs : [null],
          seller: {
            id: String(s.sellerId ?? s.id ?? ''),
            name: pickSellerName(s),
            avatar: toAbsImage(s.profileImg ?? s.avatarUrl) || null,
          },
          status: toStatus(b.sell ?? b.status),
        };
        setPost(mapped);
        setStatus(mapped.status);
      } catch (e: any) {
        Alert.alert('오류', e?.response?.data?.message || '상세를 불러오지 못했습니다.');
      }
    })();
  }, [isDraft, isMineFromRoute, p, postId]);

  const priceText = useMemo(
    () => (post ? `${post.price.toLocaleString('ko-KR')}원` : ''),
    [post]
  );

  const openMore = () => {
    if (!post) return;
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['수정', '삭제', '취소'], destructiveButtonIndex: 1, cancelButtonIndex: 2 },
      (i) => {
        if (i === 0) {
          nav.navigate('SellCreate', {
            edit: {
              id: post.id,
              plant: post.plant,
              title: post.title,
              description: post.description,
              price: post.price,
              images: (post.images || []).filter(Boolean) as string[],
            },
          });
        } else if (i === 1) {
          Alert.alert('삭제하시겠습니까?', '', [
            { text: '취소', style: 'cancel' },
            {
              text: '확인',
              style: 'destructive',
              onPress: async () => {
                try {
                  await api.delete(`/api/board/details/${post.id}`);
                  // 삭제 후에도 목록으로 이동
                  nav.dispatch(StackActions.popToTop());
                } catch (e: any) {
                  Alert.alert('삭제 실패', e?.response?.data?.message || '네트워크 상태를 확인해주세요.');
                }
              },
            },
          ]);
        }
      }
    );
  };

  const handleChangeStatus = React.useCallback(
    async (next: SaleStatus) => {
      if (!post || next === status) return;
      try {
        const sellStatus = next === '판매완료';
        await api.patch(`/api/board/details/${post.id}`, { sellStatus });
        setStatus(next);
        setPost((p) => (p ? { ...p, status: next } : p));
      } catch (e: any) {
        Alert.alert('오류', e?.response?.data?.message || '상태 변경 실패');
      }
    },
    [post, status]
  );

  // 판매자와 채팅하기
  const handleOpenChat = React.useCallback(
    async () => {
      if (!post || opening) return;
      setOpening(true);
      try {
        const sellerId = Number(post.seller.id);
        if (!sellerId || Number.isNaN(sellerId)) {
          Alert.alert('채팅 시작 실패', '판매자 정보가 올바르지 않습니다.');
          return;
        }

        // 1) 내 채팅방 목록에서 판매자와의 방 찾기
        type MeRow = { chatId: number; participants: { userId: number }[] };
        let chatId: number | null = null;
        try {
          const me = await api.get<MeRow[]>('/api/chat/me');
          const found = (me.data || []).find(r => r.participants?.[0]?.userId === sellerId);
          chatId = found?.chatId ?? null;
        } catch {}

        // 2) 없으면 생성 — 숫자 하나만 전송
        if (!chatId) {
          try {
            const { data } = await api.post<{ chatId: number; sellerId?: number }>(
              '/api/chat/start',
              Number(sellerId),
              { headers: { 'Content-Type': 'application/json' } }
            );
            chatId = data.chatId;
          } catch (e: any) {
            const isFormatError =
              e?.response?.status === 400 ||
              e?.response?.data?.code === 'INVALID_JSON';
            if (!isFormatError) throw e;

            const { data } = await api.post<{ chatId: number; sellerId?: number }>(
              '/api/chat/start',
              String(sellerId),
              { headers: { 'Content-Type': 'text/plain; charset=UTF-8' } }
            );
            chatId = data.chatId;
          }
        }

        if (!chatId) {
          Alert.alert('채팅 시작 실패', '채팅방 정보를 만들지 못했습니다.');
          return;
        }

        // 3) 채팅방으로 이동
        nav.getParent()?.navigate('Chat', {
          screen: 'ChatRoom',
          params: { conversationId: String(chatId) },
        });
      } catch (e: any) {
        console.warn('open chat error', e?.response?.data || e?.message);
        Alert.alert('채팅 시작 실패', '네트워크 상태를 확인해 주세요.');
      } finally {
        setOpening(false);
      }
    },
    [post, opening, nav]
  );

  if (!post) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={s.header}>
          <Pressable
            onPress={() => nav.dispatch(StackActions.popToTop())}
            hitSlop={10}
            style={s.iconBtn}
          >
            <IconBack width={28} height={28} />
          </Pressable>
          <View style={s.iconBtn} />
        </View>
        <View style={{ padding: SP.lg }}>
          <Text style={[txt.B2, { color: colors.subText }]}>불러오는 중…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const showOwnerControls = isOwner;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.header}>
        <Pressable
          onPress={() => nav.dispatch(StackActions.popToTop())}
          hitSlop={10}
          style={s.iconBtn}
        >
          <IconBack width={28} height={28} />
        </Pressable>
        {showOwnerControls ? (
          <Pressable onPress={openMore} hitSlop={10} style={s.iconBtn}>
            <IconMore width={28} height={28} />
          </Pressable>
        ) : (
          <View style={s.iconBtn} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingTop: 8 }}>
          <ImageCarousel images={post.images} sidePadding={SP.lg} radius={8} aspectRatio={1} showBadge />
        </View>

        <View style={s.sellerRow}>
          <Image source={{ uri: post.seller.avatar || 'https://placehold.co/50x50' }} style={s.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={[txt.B1, { color: colors.text }]}>{post.seller.name}</Text>
            <Pressable
              hitSlop={6}
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() =>
                nav.navigate('DiaryList', { boardId: post.id, userName: post.seller.name })
              }
            >
              <Text style={[txt.B3, { color: colors.subText }]}>재배일지 보러가기</Text>
              <IconArrowRight width={20} height={20} color={colors.gray30} />
            </Pressable>
          </View>

          {showOwnerControls ? (
            <BtnSaleStatus value={status} onChange={handleChangeStatus} editable />
          ) : (
            <View style={s.badge}>
              <Text style={[txt.B2, { color: colors.text }]}>{status}</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: SP.lg }}>
          <Text style={[txt.H2, { color: colors.text, marginTop: 24 }]}>{post.title}</Text>
          <Text style={[txt.H2, { color: colors.text }]}>{priceText}</Text>
          {!!post.time && <Text style={[txt.B4, { color: colors.subText, marginTop: 2 }]}>{post.time}</Text>}
        </View>

        <View style={{ paddingHorizontal: SP.lg, paddingTop: 16 }}>
          <Text style={[txt.B2, { color: colors.gray40 }]}>{post.description}</Text>
        </View>
      </ScrollView>

      {!showOwnerControls && (
        <View style={s.ctaWrap}>
          <Pressable style={s.cta} onPress={handleOpenChat}>
            <IconChat width={29} height={29} color={colors.gray0} style={{ marginRight: 12 }} />
            <Text style={[txt.H4, { color: colors.gray0 }]}>판매자와 채팅하기</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    height: 48,
    paddingHorizontal: SP.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sellerRow: {
    marginTop: 12,
    paddingHorizontal: SP.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray20,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray20,
    backgroundColor: colors.gray0,
  },
  ctaWrap: {
    padding: SP.lg,
    backgroundColor: colors.bg,
  },
  cta: {
    backgroundColor: colors.green90,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
  },
});
