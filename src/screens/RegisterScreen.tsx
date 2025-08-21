import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { colors, spacing as SP } from '../theme/tokens';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Arrowicon from '../../assets/icon/icon_arrowLeft.svg';
import ImageUploader from '../components/ImageUploader';
import Input from '../components/Input';
import BtnLong from '../components/BtnLong';
import { AppStackParamList } from '../navigation/types'; 
import { useRegister } from '../context/RegisterContext'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.04; 
const IMAGE_WIDTH = SCREEN_WIDTH * 0.9;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { saveTempData, finalizeData } = useRegister();
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textValue, setTextValue] = useState('');
  const [dateValue1, setDateValue1] = useState('');
  const [dateValue2, setDateValue2] = useState('');

  // 날짜 비교 로직 추가
  const isValidDateRange =
    !dateValue1 || !dateValue2 || new Date(dateValue1) <= new Date(dateValue2);

  const isButtonEnabled =
    uploadedImage !== null &&
    textValue.trim() !== '' &&
    dateValue1.trim() !== '' &&
    dateValue2.trim() !== '' &&
    isValidDateRange;

  const handleTempSave = () => {
    saveTempData({
      name: textValue,
      startDate: dateValue1,
      endDate: dateValue2,
      image: uploadedImage || undefined,
    });
  };

  const handleFinalize = () => {
    finalizeData();
    if (uploadedImage) {
      navigation.navigate('AnalyzeScreen', { image: uploadedImage });
    }
  };

  const handleRegister = () => {
    if (!isButtonEnabled) {
      if (!isValidDateRange) {
        Alert.alert('날짜 오류', '수확 예정일은 재배 시작일 이후여야 합니다.');
      }
      return;
    }
    handleTempSave(); 
    handleFinalize();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Arrowicon width={30} height={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>작물 등록</Text>
        <View style={{ width: 30 }} /> 
      </View>

      {/* 입력 영역 */}
      <View style={styles.container}>
        <ImageUploader onSelect={setUploadedImage} />

        <View style={[styles.row, { marginTop: 24, marginBottom: 4 }]}>
          <Text style={styles.label}>작물 이름</Text>
          <Input
            value={textValue}
            onChangeText={setTextValue}
            style={styles.inputBox}
            inputStyle={{ fontSize: 16 }}
          />
        </View>

        <View style={[styles.row, { marginBottom: 4 }]}>
          <Text style={styles.label}>재배 시작일</Text>
          <Input
            value={dateValue1}
            onChangeText={setDateValue1}
            placeholder="yy-mm-dd"
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
            placeholder="yy-mm-dd"
            inputType="date"
            iconName="calendar"
            style={styles.inputBox}
            inputStyle={{ fontSize: 16 }}
          />
        </View>
      </View>
      
      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <BtnLong
          label="작물 등록하기"
          onPress={handleRegister} 
          disabled={!isButtonEnabled}
          style={{
            width: SCREEN_WIDTH * 0.9,
            backgroundColor: isButtonEnabled ? '#7EB85B' : '#D6D6D6',
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
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.text,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: IMAGE_WIDTH, 
  },
  label: {
    width: 80, 
    fontSize: 16,
    fontWeight: '500',
    color: '#888',
    marginRight: 16,
  },
  inputBox: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    borderWidth: 0,
  },
  buttonContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'absolute',  
    bottom: 0,
  },
});
