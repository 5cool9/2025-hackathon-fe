import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { colors, spacing as SP, txt } from '../theme/tokens';
import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import DefaultAvatar from '../../assets/img/btn_profileImg.svg'; // ✅ 기본 아바타

import type { MyStackParamList } from '../navigation/MyStack';

type Nav = NativeStackNavigationProp<MyStackParamList, 'ProfileEdit'>;
type Rt  = RouteProp<MyStackParamList, 'ProfileEdit'>;

export default function ProfileEditScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Rt>();

  const init = route.params ?? { nickname: '김슈니', userId: 'swuni', avatar: undefined as string | undefined };

  const [nickname, setNickname] = useState(init.nickname);
  const [userId]   = useState(init.userId);
  const [avatar, setAvatar] = useState<string | undefined>(init.avatar);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한을 허용해 주세요.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) setAvatar(res.assets[0].uri);
  };

  const onSave = () => {
    // TODO: 서버 연동
    Alert.alert('수정 완료', '변경사항이 저장되었습니다.', [
      { text: '확인', onPress: () => nav.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* 헤더 */}
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={s.backBtn}>
          <IconBack width={28} height={28} />
        </Pressable>
        <Text style={[txt.H3, { color: colors.gray90, fontWeight: '500' }]}>회원정보 수정</Text>
        <View style={{ width: 24, height: 24 }} />
      </View>

      {/* 아바타 */}
      <Pressable style={s.avatarWrap} onPress={pickAvatar} hitSlop={10}>
        <View style={s.avatarRing}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={s.avatarImg} />
          ) : (
            <DefaultAvatar width={AVATAR} height={AVATAR} />
          )}
        </View>
      </Pressable>

      {/* 폼 */}
      <View style={s.form}>
        {/* 닉네임 */}
        <View style={s.field}>
          <Text style={[txt.B2, s.label]}>닉네임</Text>
          <View style={s.inputOutline}>
            <TextInput
              style={s.inputText}
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임"
              placeholderTextColor={colors.gray30}
            />
          </View>
        </View>

        {/* 아이디 (고정) */}
        <View style={s.field}>
          <Text style={[txt.B2, s.label]}>아이디</Text>
          <View style={s.inputFilled}>
            <Text style={[s.inputText, { color: colors.gray30 }]}>{userId}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => Alert.alert('준비 중', '비밀번호 변경은 추후 제공됩니다.')}
          hitSlop={6}
        >
          <Text style={[txt.B3, { color: colors.gray30, textAlign: 'center', marginTop: 4 }]}>
            비밀번호 변경
          </Text>
        </Pressable>
      </View>

      {/* 하단 버튼 */}
      <View style={s.footer}>
        <Pressable style={s.saveBtn} onPress={onSave}>
          <Text style={s.saveTxt}>수정</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const AVATAR = 100;

const s = StyleSheet.create({
  header: {
    height: 59,
    paddingHorizontal: SP.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },

  avatarWrap: { alignItems: 'center', marginTop: 16 },
  avatarRing: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 },

  form: {
    marginTop: 16,
    paddingHorizontal: SP.lg,
    gap: 24,
  },
  field: { gap: 8 },
  label: { color: colors.gray40, fontWeight: '600' },

  // 피그마: 외곽선(#D6D6D6) / r4 / 16px padding, 12px vertical
  inputOutline: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bg,
  },
  // 피그마: 배경 #F5F5F5 / r4 / 고정값
  inputFilled: {
    borderRadius: 4,
    backgroundColor: colors.gray10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputText: {
    ...txt.B2,
    color: colors.gray90,
    lineHeight: 20
  },

  footer: {
    marginTop: 'auto',
    paddingHorizontal: SP.lg,
    paddingBottom: Platform.select({ ios: 12, android: 16 }),
    paddingTop: 8,
    backgroundColor: colors.bg,
  },
  // 피그마: #7EB85B / r4 / 12px vertical / 20 bold
  saveBtn: {
    backgroundColor: colors.green90 ?? '#7EB85B',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTxt: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '700',
  },
});
