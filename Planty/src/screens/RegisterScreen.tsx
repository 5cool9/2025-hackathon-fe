// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { colors } from '../theme/tokens';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Arrowicon from '../../assets/icon/icon_arrowLeft.svg';
import ImageUploader from '../components/ImageUploader';
import Input from '../components/Input';
import BtnLong from '../components/BtnLong';
import { AppStackParamList } from '../navigation/types';
import axios from 'axios';
import { getAccessToken } from '../utils/token';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.04;
const IMAGE_WIDTH = SCREEN_WIDTH * 0.9;
const API_BASE_URL = 'http://43.200.244.250';

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textValue, setTextValue] = useState('');
  const [dateValue1, setDateValue1] = useState('');
  const [dateValue2, setDateValue2] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidDateRange = !dateValue1 || !dateValue2 || new Date(dateValue1) <= new Date(dateValue2);
  const isButtonEnabled =
    !!uploadedImage &&
    textValue.trim() !== '' &&
    dateValue1.trim() !== '' &&
    dateValue2.trim() !== '' &&
    isValidDateRange &&
    !isLoading;

  const handleRegister = async () => {
    console.log('--- Register 버튼 눌림 ---');
    console.log('uploadedImage:', uploadedImage);
    console.log('textValue:', textValue);
    console.log('dateValue1:', dateValue1);
    console.log('dateValue2:', dateValue2);

    if (!isButtonEnabled) {
      if (!isValidDateRange) {
        Alert.alert('날짜 오류', '수확 예정일은 재배 시작일 이후여야 합니다.');
      } else {
        Alert.alert('입력 오류', '모든 항목을 올바르게 입력해주세요.');
      }
      return;
    }

    setIsLoading(true);

    try {
      const token = await getAccessToken();
      console.log('AccessToken:', token);

      if (!token) {
        Alert.alert('오류', '로그인 토큰이 없습니다.');
        return;
      }

      const formData = new FormData();

      // 이미지 파일 추가
      if (uploadedImage) {
        const uriParts = uploadedImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('imageFile', {
          uri: uploadedImage,
          type: `image/${fileType}`,
          name: `crop.${fileType}`,
        } as any);
      }

      // cropData는 JSON 문자열로 추가
      const cropDataObj = {
        name: textValue,
        startAt: dateValue1,
        endAt: dateValue2,
      };
      formData.append('cropData', JSON.stringify(cropDataObj));

      const response = await axios.post(`${API_BASE_URL}/api/crop/register`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('서버 응답:', response.data);

      if (response.data.success) {
        // 서버에서 내려온 이미지 경로 절대 URL로 변환
        let imageUri = uploadedImage;
        if (response.data.data?.image && !response.data.data.image.startsWith('http')) {
          imageUri = `http://43.200.244.250${response.data.data.image.replace('/srv/app/app', '')}`;
        }

        navigation.navigate('AnalyzeScreen', {
          image: imageUri,
          name: textValue,
          startDate: dateValue1,
          endDate: dateValue2,
          tempCropId: response.data.tempCropId,
          analysisResult: response.data.analysisResult,
        });
      } else {
        Alert.alert('실패', response.data.message || '등록 실패');
      }
    } catch (error: any) {
      console.error('Register API Error:', error.response || error);
      Alert.alert('오류', error.response?.data?.message || '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Arrowicon width={30} height={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>작물 등록</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.container}>
        <ImageUploader onSelect={setUploadedImage} />

        <View style={[styles.row, { marginTop: 24, marginBottom: 4 }]}>
          <Text style={styles.label}>작물 이름</Text>
          <Input
            value={textValue}
            onChangeText={setTextValue}
            style={styles.inputBox}
            inputStyle={{ fontSize: 16 }}
            placeholder="작물 이름을 입력해 주세요"
          />
        </View>

        <View style={[styles.row, { marginBottom: 4 }]}>
          <Text style={styles.label}>재배 시작일</Text>
          <Input
            value={dateValue1}
            onChangeText={setDateValue1}
            placeholder="yyyy-mm-dd"
            inputType="date"
            iconName="calendar"
            style={styles.inputBox}
            inputStyle={{ fontSize: 16 }}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>수확 예정일</Text>
          <Input
            value={dateValue2}
            onChangeText={setDateValue2}
            placeholder="yyyy-mm-dd"
            inputType="date"
            iconName="calendar"
            style={styles.inputBox}
            inputStyle={{ fontSize: 16 }}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <BtnLong
          label={isLoading ? '등록 중...' : '작물 등록하기'}
          onPress={handleRegister}
          disabled={!isButtonEnabled}
          style={{
            width: SCREEN_WIDTH * 0.9,
            backgroundColor: isButtonEnabled ? '#7EB85B' : '#D6D6D6',
            opacity: isLoading ? 0.7 : 1,
          }}
          labelStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 20,
            fontWeight: '600',
            color: '#fff',
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  backButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '500', color: colors.text },
  container: { flex: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: HORIZONTAL_PADDING },
  row: { flexDirection: 'row', alignItems: 'center', width: IMAGE_WIDTH },
  label: { width: 80, fontSize: 16, fontWeight: '500', color: '#888', marginRight: 16 },
  inputBox: { flex: 1, height: 40, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F5F5F5', justifyContent: 'center', borderWidth: 0 },
  buttonContainer: { width: SCREEN_WIDTH, alignItems: 'center', paddingVertical: 16, position: 'absolute', bottom: 0, marginBottom: 20 },
});
