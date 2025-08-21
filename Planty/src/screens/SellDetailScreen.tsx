// src/screens/SellDetailScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { colors, spacing as SP, txt } from '../theme/tokens';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { SellStackParamList, PlantItem } from '../navigation/SellStack';

import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import IconArrowRight from '../../assets/icon/icon_arrowRight.svg';
import IconChat from '../../assets/icon/icon_chat.svg';
import IconMore from '../../assets/icon/icon_dotMenu.svg';

import ImageCarousel from '../components/ImageCarousel';
import BtnSaleStatus from '../components/BtnSalesStatus';

type SaleStatus = '판매중' | '판매완료';
type R = RouteProp<SellStackParamList, 'SellDetail'>;

type PostDetail = {
  id: string;
  title: string;
  price: number;                 // 숫자 보관
  time: string;                  // "2시간 전"
  description: string;
  images: (string | null)[];
  seller: { id: string; name: string; avatar: string };
  status: SaleStatus;
  plant?: PlantItem;             // ✨ 수정 화면으로 넘길 때 필요
};

export default function SellDetailScreen() {
  const nav = useNavigation<any>();     // 루트-탭 네비 이동을 위해 any
  const route = useRoute<R>();

  const isDraft = 'draft' in route.params;
  const isMine  = route.params?.isMine ?? false;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [status, setStatus] = useState<SaleStatus>('판매중');

  useEffect(() => {
    if (isDraft) {
      // 작성 직후 프리뷰(draft) 경로
      const d = route.params.draft;
      const draftPost: PostDetail = {
        id: 'temp',
        title: d.title,
        price: d.price,
        time: '방금 전',
        description: d.description,
        images: d.images.length ? d.images : [null], // 사진 없으면 placeholder 1장
        seller: { id: 'me', name: '나', avatar: 'https://placehold.co/50x50' },
        status: '판매중',
        plant: d.plant, // ✨ 수정 진입 시 필요
      };
      setPost(draftPost);
      setStatus('판매중');
    } else {
      // postId로 서버 조회 (임시 더미)
      // TODO: fetchPost(route.params.postId).then(setPost)
      const data: PostDetail = {
        id: route.params.postId,
        title: '직접 캔 고구마',
        price: 6000,
        time: '2시간 전',
        description:
          '집앞 화단에서 기른 고구마예요. 어제 캐와서 매우 싱싱합니다!! 한 봉지에 6천원이에요. 채팅주세요.',
        images: [null, null], // 실제 URL로 교체
        seller: { id: 'seller-1', name: '닉네임', avatar: 'https://placehold.co/50x50' },
        status: '판매중',
        plant: {
          id: 'p1',
          name: '고구마',
          startDate: '25.08.20.',
          harvestDate: '25.09.02.',
          image: 'https://placehold.co/82x82',
        },
      };
      setPost(data);
      setStatus(data.status);
    }
  }, [isDraft, route.params]);

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
          // ✨ 수정: 글쓰기 화면으로 현재 값 전달
          if (!post.plant) {
            Alert.alert('수정 불가', '작물 정보가 없습니다.');
            return;
          }
          nav.navigate('SellCreate', {
            edit: {
              id: post.id,
              plant: post.plant,
              title: post.title,
              description: post.description,
              price: post.price,
              images: post.images.filter(Boolean) as string[],
            },
          });
        } else if (i === 1) {
          // ✨ 삭제
          Alert.alert('삭제하시겠습니까?', '', [
            { text: '취소', style: 'cancel' },
            {
              text: '확인',
              style: 'destructive',
              onPress: async () => {
                try {
                  // TODO: await deletePostAPI(post.id);
                  nav.goBack();
                } catch (e) {
                  Alert.alert('삭제 실패', '네트워크 상태를 확인해주세요.');
                }
              },
            },
          ]);
        }
      }
    );
  };

  if (!post) {
    // 간단한 로딩
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={s.header}>
          <Pressable onPress={() => nav.goBack()} hitSlop={10} style={s.iconBtn}>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* 상단 헤더 */}
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={s.iconBtn}>
          <IconBack width={28} height={28} />
        </Pressable>

        {/* 내가 쓴 글일 때만 더보기 노출 */}
        {isMine ? (
          <Pressable onPress={openMore} hitSlop={10} style={s.iconBtn}>
            <IconMore width={28} height={28} />
          </Pressable>
        ) : (
          <View style={s.iconBtn} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 이미지 캐러셀 */}
        <View style={{ paddingTop: 8 }}>
          <ImageCarousel
            images={post.images}
            sidePadding={SP.lg}
            radius={8}
            aspectRatio={1}
            showBadge
          />
        </View>

        {/* 판매자 + 상태 */}
        <View style={s.sellerRow}>
          <Image source={{ uri: post.seller.avatar }} style={s.avatar} />

          <View style={{ flex: 1 }}>
            <Text style={[txt.B1, { color: colors.text }]}>{post.seller.name}</Text>

            {/* 재배일지 보러가기 */}
            <Pressable
              hitSlop={6}
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() =>
                nav.navigate('DiaryList', {
                  userId: post.seller.id,
                  userName: post.seller.name,
                })
              }
            >
              <Text style={[txt.B3, { color: colors.subText }]}>재배일지 보러가기</Text>
              <IconArrowRight width={20} height={20} color={colors.gray30} />
            </Pressable>
          </View>

          {/* 내가 쓴 글이면 상태 변경 가능 */}
          {isMine ? (
            <BtnSaleStatus value={status} onChange={setStatus} editable />
          ) : (
            <View style={s.badge}>
              <Text style={[txt.B2, { color: colors.text }]}>{status}</Text>
            </View>
          )}
        </View>

        {/* 제목/가격/시간 */}
        <View style={{ paddingHorizontal: SP.lg }}>
          <Text style={[txt.H2, { color: colors.text, marginTop: 24 }]}>{post.title}</Text>
          <Text style={[txt.H2, { color: colors.text }]}>{priceText}</Text>
          <Text style={[txt.B4, { color: colors.subText, marginTop: 2 }]}>{post.time}</Text>
        </View>

        {/* 내용 */}
        <View style={{ paddingHorizontal: SP.lg, paddingTop: 16 }}>
          <Text style={[txt.B2, { color: colors.gray40 }]}>{post.description}</Text>
        </View>
      </ScrollView>

      {/* 하단 CTA → 채팅 */}
      <View style={s.ctaWrap}>
        <Pressable
          style={s.cta}
          onPress={() =>
            nav.getParent()?.navigate('Chat', {
              screen: 'ChatRoom',
              params: { conversationId: post.id },
            })
          }
        >
          <IconChat width={29} height={29} color={colors.gray0} style={{ marginRight: 12 }} />
          <Text style={[txt.H4, { color: colors.gray0 }]}>판매자와 채팅하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    height: 48,
    paddingHorizontal: SP.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ← 우측 메뉴 배치
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
