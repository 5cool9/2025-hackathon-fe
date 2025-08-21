import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { colors } from '../theme/tokens';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import Arrowicon from '../../assets/icon/icon_arrowLeft.svg';
import ImageUploader from '../components/ImageUploader';
import Input from '../components/Input';
import BtnLong from '../components/BtnLong';
import MethodDescription from "../components/MethodDescription";
import { AppStackParamList } from '../navigation/types';
import { useRegister, UserRegisterData } from '../context/RegisterContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.04; 
const IMAGE_WIDTH = SCREEN_WIDTH * 0.9;
const CONTENT_WIDTH = SCREEN_WIDTH * 0.9; 

export default function EditRegisterScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'EditregisterScreen'>>();
  const { tempData, saveTempData, finalizeData } = useRegister();

  // 초기값 세팅
  const initialData = {
    id: route.params?.id ?? tempData?.id,
    image: route.params?.image ?? tempData?.image ?? null,
    name: route.params?.name ?? tempData?.name ?? '',
    startDate: route.params?.startDate ?? tempData?.startDate ?? '',
    endDate: route.params?.endDate ?? tempData?.endDate ?? '',
  };

  const [itemId, setItemId] = useState(initialData.id ?? '');
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialData.image);
  const [textValue, setTextValue] = useState(initialData.name);
  const [dateValue1, setDateValue1] = useState(initialData.startDate);
  const [dateValue2, setDateValue2] = useState(initialData.endDate);

  useEffect(() => {
    setUploadedImage(route.params?.image ?? tempData?.image ?? null);
    setTextValue(route.params?.name ?? tempData?.name ?? '');
    setDateValue1(route.params?.startDate ?? tempData?.startDate ?? '');
    setDateValue2(route.params?.endDate ?? tempData?.endDate ?? '');
  }, [route.params, tempData]);

  // ✅ 날짜 유효성 검사 함수
  const isValidDateRange = (start: string, end: string) => {
    if (!start || !end) return true; // 아직 입력 안 했으면 true
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate <= endDate;
  };

  // ✅ 버튼 활성화 조건
  const isButtonEnabled =
    uploadedImage !== null &&
    textValue.trim() !== '' &&
    dateValue1.trim() !== '' &&
    dateValue2.trim() !== '' &&
    isValidDateRange(dateValue1, dateValue2);

  const handleButtonPress = () => {
    if (!uploadedImage || !textValue || !dateValue1 || !dateValue2) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }

    if (!isValidDateRange(dateValue1, dateValue2)) {
      Alert.alert('날짜 오류', '재배 시작일은 수확 예정일보다 늦을 수 없습니다.');
      return;
    }

    const newData: Partial<UserRegisterData> = {
      id: itemId,
      image: uploadedImage,
      name: textValue,
      startDate: dateValue1,
      endDate: dateValue2,
    };

    saveTempData(newData);
    finalizeData(newData);
    navigation.navigate('MainTab');
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
        <ImageUploader onSelect={setUploadedImage} initialImage={uploadedImage} />

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

      <View style={{ flex: 1, marginTop: 120 }}>
        <MethodDescription
          headerText="재배 방법"
          bodyText="햇볕이 잘 드는 곳에 심고, 흙은 물빠짐이 좋게 준비해요. 하루 1~2회, 겉흙이 마르면 충분히 물을 줘요.
                    병충해 예방을 위해 통풍을 잘 시켜 주세요.
                    심은 지 3~4주 후, 잎이 20cm쯤 되면 수확해요."
        />
      </View>

      <View style={styles.buttonWrapper}>
        <BtnLong
          label="등록"
          onPress={handleButtonPress}
          disabled={!isButtonEnabled}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 4,
            backgroundColor: isButtonEnabled ? '#7EB85B' : '#D6D6D6',
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { width: SCREEN_WIDTH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  backButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '500', color: colors.text },
  container: { flex: 1, alignItems: 'center', paddingVertical: 20, paddingHorizontal: HORIZONTAL_PADDING },
  row: { flexDirection: 'row', alignItems: 'center', width: IMAGE_WIDTH },
  label: { width: 80, fontSize: 16, fontWeight: '500', color: '#888', marginRight: 16 },
  inputBox: { flex: 1, height: 40, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F5F5F5', justifyContent: 'center', borderWidth: 0 },
  buttonWrapper: { width: CONTENT_WIDTH, alignSelf: "center", position: "absolute", bottom: 20 },
});
