import React, { useState, useMemo } from 'react';
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
import axios from 'axios';

import { colors, spacing as SP, txt } from '../theme/tokens';
import IconBack from '../../assets/icon/icon_arrowLeft.svg';
import DefaultAvatar from '../../assets/img/btn_profileImg.svg';

import type { MyStackParamList } from '../navigation/MyStack';
import { getAccessToken } from '../utils/token';

type Nav = NativeStackNavigationProp<MyStackParamList, 'ProfileEdit'>;
type Rt  = RouteProp<MyStackParamList, 'ProfileEdit'>;

const BASE_URL = 'http://43.200.244.250';
const AVATAR = 100;

const isLocalFile = (u?: string) =>
  !!u && (u.startsWith('file://') || u.startsWith('content://'));

const normalizeImagePath = (src?: string) => {
  if (!src) return undefined;
  if (src.startsWith('http') || src.startsWith('file://')) return src;
  const cleaned = src.replace('/srv/app/app', '');
  return `${BASE_URL}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
};

export default function ProfileEditScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Rt>();

  const init = route.params ?? { nickname: '김슈니', userId: 'swuni', avatar: undefined as string | undefined };

  const [nickname, setNickname] = useState(init.nickname);
  const [userId]   = useState(init.userId);
  // ✅ 초기 avatar를 절대 URL로 보정해서 상태에 담기
  const [avatar, setAvatar] = useState<string | undefined>(normalizeImagePath(init.avatar));

  const displayAvatar = useMemo(
    // avatar가 로컬 파일이면 그대로, 아니면 이미 보정된 값 사용
    () => (isLocalFile(avatar) ? avatar : avatar),
    [avatar]
  );

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
    if (!res.canceled) setAvatar(res.assets[0].uri); // file:// 경로
  };

  const onSave = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        Alert.alert('오류', '인증 토큰이 없습니다. 다시 로그인해 주세요.');
        return;
      }

      const form = new FormData();

      // API 명세: nickname은 JSON 문자열
      form.append('nickname', JSON.stringify({ nickname }));

      // ✅ 로컬 파일일 때만 파일 파트 추가
      if (isLocalFile(avatar)) {
        const uri = avatar!;
        const filename = uri.split('/').pop() || 'profile.jpg';
        const ext = filename.split('.').pop()?.toLowerCase();
        const mime =
          ext === 'png' ? 'image/png'
          : ext === 'webp' ? 'image/webp'
          : ext === 'heic' ? 'image/heic'
          : 'image/jpeg';

        form.append('profileImg', { uri, name: filename, type: mime } as any);
      }

      await axios.patch(`${BASE_URL}/api/mypage/profile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('수정 완료', '변경사항이 저장되었습니다.', [
        { text: '확인', onPress: () => nav.goBack() },
      ]);
    } catch (err: any) {
      const status = err?.response?.status;
      const code   = err?.response?.data?.code;
      const msg    = err?.response?.data?.message;

      if (status === 401 && code === 'UNAUTHORIZED') {
        Alert.alert('오류', '인증되지 않은 사용자입니다.');
      } else if (status === 405) {
        Alert.alert('오류', '지원하지 않는 메서드입니다.');
      } else {
        Alert.alert('오류', msg || '프로필 수정에 실패했습니다.');
      }
    }
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
          {displayAvatar ? (
            <Image source={{ uri: displayAvatar }} style={s.avatarImg} />
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

  inputOutline: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bg,
  },
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
