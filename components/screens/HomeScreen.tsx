import BtnAddPhoto from '@/components/ui/BtnAddphoto';
import BtnLong from '@/components/ui/BtnLong';
import BtnOval from '@/components/ui/BtnOval';
import BtnToggle from '@/components/ui/BtnToggle';
import ImageUploader from '@/components/ui/ImageUploader';
import Input from '@/components/ui/Input';
import MethodDescription from '@/components/ui/MethodDescription';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-gesture-handler';


export default function HomeScreen() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [date, setDate] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  return (
    <View style={styles.container}>

      {/* 이미지 업로더 */}
      <ImageUploader onSelect={setUploadedImage} />

      <BtnAddPhoto onSelect={setUploadedPhotos} />

      <BtnLong label="작물 상태 진단받기" onPress={() => console.log('이미지:', uploadedImage)} disabled={!uploadedImage} iconSource={require('@/assets/icon/CameraWhite.png')} />

      <BtnLong label="확인" onPress={() => console.log('확인 클릭')} disabled={false} />

      <BtnOval label="현재 상태 분석" />
      <BtnOval label="질병 여부 분석" />

      <BtnToggle />

      <Input value={id} onChangeText={setId} placeholder="이름" inputType="text" />
      <Input value={password} onChangeText={setPassword} placeholder="비밀번호 입력" inputType="password" iconName="eye" />
      <Input value={date} onChangeText={setDate} placeholder="yy-mm-dd" inputType="date" iconName="calendar" />

      <MethodDescription
        headerText="상단 헤더 텍스트"
        bodyText="네모 박스 안에 들어갈 본문 텍스트"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});


