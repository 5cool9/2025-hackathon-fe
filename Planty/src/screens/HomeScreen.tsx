// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';

import BtnAddPhoto from '../components/BtnAddphoto';
import BtnLong from '../components/BtnLong';
import BtnOval from '../components/BtnOval';
import BtnToggle from '../components/BtnToggle';
import ImageUploader from '../components/ImageUploader';
import Input from '../components/Input';
import MethodDescription from '../components/MethodDescription';

import { colors, spacing as SP } from '../theme/tokens';

export default function HomeScreen() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [date, setDate] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <ImageUploader onSelect={setUploadedImage} />
          <BtnAddPhoto onSelect={setUploadedPhotos} />

          <BtnLong
            label="작물 상태 진단받기"
            onPress={() => console.log('이미지:', uploadedImage)}
            disabled={!uploadedImage}
            iconSource={require('../../assets/icon/CameraWhite.png')}
          />
          <BtnLong label="확인" onPress={() => console.log('확인 클릭')} disabled={false} />

          <BtnOval label="현재 상태 분석" />
          <BtnOval label="질병 여부 분석" />

          <BtnToggle />

          <Input value={id} onChangeText={setId} placeholder="이름" inputType="text" />
          <Input value={password} onChangeText={setPassword} placeholder="비밀번호 입력" inputType="password" iconName="eye" />
          <Input value={date} onChangeText={setDate} placeholder="yy-mm-dd" inputType="date" iconName="calendar" />

          <MethodDescription
            headerText="재배 방법"
            bodyText="햇볕이 잘 드는 곳에 심고, 흙은 물빠짐이 좋게 준비해요. 하루 1~2회, 겉흙이 마르면 충분히 물을 줘요.
                      병충해 예방을 위해 통풍을 잘 시켜 주세요.
                      심은 지 3~4주 후, 잎이 20cm쯤 되면 수확해요."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: {
    padding: SP.lg,
    paddingBottom: 48,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 5,
  },
});
