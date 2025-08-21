// src/screens/DiaryListScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors, spacing as SP, txt } from '../theme/tokens';
import ListNote from '../components/ListNote';
import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SellStackParamList } from '../navigation/SellStack';

type Props = NativeStackScreenProps<SellStackParamList, 'DiaryList'>;

type Note = {
  id: string;
  title: string;
  preview: string;
  thumb?: string;
};

const MOCK: Note[] = [
  { id: 'n1', title: '재배일지 제목', preview: '재배일지 본문 미리보기 한줄 / 재배일지 본...', thumb: 'https://placehold.co/70x70' },
  { id: 'n2', title: '재배일지 제목', preview: '재배일지 본문 미리보기 한줄 / 재배일지 본...' },
  { id: 'n3', title: '재배일지 제목', preview: '재배일지 본문 미리보기 한줄 / 재배일지 본...', thumb: 'https://placehold.co/70x70' },
  { id: 'n4', title: '재배일지 제목', preview: '재배일지 본문 미리보기 한줄 / 재배일지 본...' },
];

export default function DiaryListScreen({ route, navigation }: Props) {
  const { userName } = route.params;

  return (
    <SafeAreaView style={s.safe}>
      {/* 헤더 */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <IconBack width={28} height={28} />
        </Pressable>
        <Text style={[txt.H2, s.headerTitle]}>재배 일지</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 섹션 타이틀 */}
      <View style={s.sectionHead}>
        <Text style={[txt.H2, { color: colors.gray40 }]}>재배 일지</Text>
        {/* <Text style={[txt.B3, { color: colors.subText }]}>{userName}</Text> */}
      </View>

      {/* 목록 */}
      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ListNote
            title={item.title}
            preview={item.preview}
            imageUri={item.thumb}
            onPress={() => navigation.push('DiaryDetail', { noteId: item.id })}
            style={{ marginHorizontal: SP.lg }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: { paddingRight: 8, paddingVertical: 6 },
  headerTitle: { color: colors.gray40, textAlign: 'center', flex: 1 },
  sectionHead: { paddingHorizontal: SP.lg, paddingVertical: 16 },
});
