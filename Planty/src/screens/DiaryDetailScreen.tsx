// src/screens/DiaryDetailScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { colors, spacing as SP, txt } from '../theme/tokens';
import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { SellStackParamList } from '../navigation/SellStack';

type R = RouteProp<SellStackParamList, 'DiaryDetail'>;

export default function DiaryDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<R>();
  const { noteId } = route.params;

  // TODO: noteId 로 API 호출. 지금은 목업 값
  const data = {
    title: '햇빛이 너무 강해져서 그늘로 옮긴 날',
    body:
      '오늘 아침에 물 듬뿍 줬는데 잎이 더 탱탱해진 것 같음.\n' +
      '햇빛이 좀 강해서 오후엔 살짝 그늘로 옮겨줌.\n' +
      '흙은 아직 촉촉해서 내일은 물 안 줘도 될 듯!\n' +
      '요즘 진짜 잘 자라서 보기만 해도 뿌듯하다 :)\n' +
      '사진도 한 장 찍어놨는데, 확실히 커진 게 느껴짐!',
    date: '2025.08.20.',
    images: [
      'https://placehold.co/100x100',
      'https://placehold.co/100x100',
    ] as (string | null)[],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* 헤더 */}
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} style={s.backBtn} hitSlop={10}>
          <IconBack width={28} height={28} />
        </Pressable>
        <Text style={[txt.H2, s.headerTitle]}>재배일지</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: SP.lg, paddingTop: 16 }}>
          {/* 제목 */}
          <Text style={[txt.H4, { color: colors.gray40 }]}>{data.title}</Text>

          {/* 구분선 */}
          <View style={s.divider} />

          {/* 본문 */}
          <Text style={[txt.B2, s.body]}>{data.body}</Text>

          {/* 이미지 2개 (피그마 100x100) */}
          <View style={s.imageRow}>
            {data.images.map((uri, idx) =>
              uri ? (
                <Image
                  key={idx}
                  source={{ uri }}
                  style={s.img}
                />
              ) : (
                <View key={idx} style={[s.img, s.imgPlaceholder]} />
              )
            )}
          </View>

          {/* 날짜 */}
          <Text style={[txt.B3, { color: colors.subText, marginTop: 12 }]}>
            {data.date}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: { paddingRight: 8, paddingVertical: 6 },
  headerTitle: { color: colors.gray90, textAlign: 'center', flex: 1 },

  divider: {
    marginTop: 12,
    marginBottom: 12,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  body: {
    color: colors.gray40,
    lineHeight: 24, // 읽기 편하도록
  },

  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  img: {
    width: 100,
    height: 100,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
  },
  imgPlaceholder: {
    backgroundColor: '#D9D9D9',
  },
});
