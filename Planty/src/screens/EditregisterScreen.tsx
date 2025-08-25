import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { colors } from '../theme/tokens';
import { useNavigation, NavigationProp, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import Arrowicon from '../../assets/icon/icon_arrowLeft.svg';
import ImageUploader from '../components/ImageUploader';
import Input from '../components/Input';
import BtnLong from '../components/BtnLong';
import MethodDescription from "../components/MethodDescription";
import { AppStackParamList } from '../navigation/types';
import axios from 'axios';
import { getAccessToken } from '../utils/token';
import { useRegister } from '../context/RegisterContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.04; 
const IMAGE_WIDTH = SCREEN_WIDTH * 0.9;
const CONTENT_WIDTH = SCREEN_WIDTH * 0.9; 

// ✅ 날짜 변환 유틸 (yyyy-MM-dd 형식으로 변환)
const formatDate = (dateString: string) => {
  if (!dateString) return null;
  return new Date(dateString).toISOString().split("T")[0]; 
  // "2025-08-24" 이런 형태로 변환
};


export default function EditRegisterScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'EditregisterScreen'>>();

  const cropId = route.params?.id;
  const tempCropId = route.params?.tempCropId;

  const { userData, setUserData } = useRegister();

  const initialData = {
    image: route.params?.image ?? null,
    name: route.params?.name ?? '',
    startDate: route.params?.startDate ?? '',
    endDate: route.params?.endDate ?? '',
    analysisResult: route.params?.analysisResult ?? {},
  };

  const [uploadedImage, setUploadedImage] = useState<string | null>(initialData.image);
  const [textValue, setTextValue] = useState(initialData.name);
  const [dateValue1, setDateValue1] = useState(initialData.startDate);
  const [dateValue2, setDateValue2] = useState(initialData.endDate);
  const [loading, setLoading] = useState(false);
  const [analysisResult] = useState(initialData.analysisResult);

  const isValidDateRange = (start: string, end: string) => {
    if (!start || !end) return true;
    return new Date(start) <= new Date(end);
  };

  const isButtonEnabled =
    uploadedImage !== null &&
    textValue.trim() !== '' &&
    dateValue1.trim() !== '' &&
    dateValue2.trim() !== '' &&
    isValidDateRange(dateValue1, dateValue2);

  const handleSubmit = async () => {
    if (!isButtonEnabled) {
      if (!isValidDateRange(dateValue1, dateValue2)) {
        Alert.alert("날짜 오류", "재배 시작일은 수확 예정일보다 늦을 수 없습니다.");
      } else {
        Alert.alert("입력 오류", "모든 항목을 올바르게 입력해주세요.");
      }
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) {
        Alert.alert("오류", "로그인 토큰이 없습니다.");
        return;
      }

      // ✅ 수정 API (PUT)
      if (cropId) {
        const formData = new FormData();

        formData.append("cropData", JSON.stringify({
          name: textValue,
          startAt: formatDate(dateValue1),
          endAt: formatDate(dateValue2),
        }));

        if (uploadedImage && uploadedImage !== initialData.image) {
          formData.append("imageFile", {
            uri: uploadedImage,
            type: "image/jpeg",
            name: "crop.jpg",
          } as any);
        }

        const response = await axios.put(
          `http://43.200.244.250/api/crop/${cropId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          const updatedPlant = response.data.updatedPlant;

          setUserData(prev =>
            (prev || []).map(p => (p.id === cropId ? updatedPlant : p))
          );

          Alert.alert("완료", "작물 정보가 수정되었습니다.", [
            {
              text: "확인",
              onPress: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "MainTab" }],
                  })
                );
              },
            },
          ]);
        } else {
          Alert.alert("실패", response.data.message || "수정 실패");
        }
        return;
      }

      // ✅ 최종 등록 API (POST)
      if (tempCropId) {
        const body = {
          tempCropId,
          cropData: {
            name: textValue,
            startAt: formatDate(dateValue1),
            endAt: formatDate(dateValue2),
          },
          analysisResult,
        };

        const response = await axios.post(
          "http://43.200.244.250/api/crop/final-register",
          body,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          const newPlant = response.data.newPlant;

          setUserData(prev => [...(prev || []), newPlant]);

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "MainTab" }],
            })
          );
        } else {
          Alert.alert("실패", response.data.message || "최종 등록 실패");
        }
        return;
      }

      Alert.alert("오류", "등록할 데이터가 없습니다.");
    } catch (error: any) {
      console.log("API Error:", error.response || error);
      Alert.alert("오류", error.response?.data?.message || "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Arrowicon width={30} height={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>작물 등록</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Content */}
      <View style={styles.container}>
        <ImageUploader onSelect={setUploadedImage} initialImage={uploadedImage} />

        <View style={[styles.row, { marginTop: 24, marginBottom: 4 }]}>
          <Text style={styles.label}>작물 이름</Text>
          <Input value={textValue} onChangeText={setTextValue} style={styles.inputBox} inputStyle={{ fontSize: 16 }} />
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

      {/* 분석 결과 미리보기 */}
      <View style={{ flex: 1, marginTop: 120 }}>
        <MethodDescription
          headerText="재배 방법"
          bodyText={analysisResult?.howTo || "재배 방법 정보가 없습니다."}
        />
      </View>

      {/* 단일 버튼 */}
      <View style={styles.buttonWrapper}>
        <BtnLong
          label={cropId ? "수정" : "등록"}
          onPress={handleSubmit}
          disabled={!isButtonEnabled || loading}
          style={{
            width: "100%",
            height: 54,
            borderRadius: 4,
            backgroundColor: isButtonEnabled ? "#7EB85B" : "#D6D6D6",
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
  buttonWrapper: { width: CONTENT_WIDTH, alignSelf: "center", position: "absolute", bottom: 40, },
});
