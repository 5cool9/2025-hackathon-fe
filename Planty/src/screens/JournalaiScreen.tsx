import React, { useState, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, Dimensions, 
  StyleSheet, ScrollView, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Arrowicon from '../../assets/icon/icon_arrowLeft.svg';
import Xicon from '../../assets/icon/x.svg';
import ImageUploader from '../components/ImageUploader';
import BtnLong from '../components/BtnLong';
import BtnOval from '../components/BtnOval';
import MethodDescription from '../components/MethodDescription';
import { AppStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';
import axios from 'axios';
import { getAccessToken } from '../utils/token';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_URL = "http://43.200.244.250/";

type Props = NativeStackScreenProps<AppStackParamList, 'JournalAI'>;

export default function JournalaiScreen({ route, navigation }: Props) {
  const { plantData } = route.params;
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAnalysisDone, setIsAnalysisDone] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Record<string, { body: string }>>({});
  const [loading, setLoading] = useState(false);
  const [diagnosisTags, setDiagnosisTags] = useState<Record<string, string>>({});
  
  useEffect(() => {
    fetchDiagnosisTags();
  }, []);

  const fetchDiagnosisTags = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${BASE_URL}api/crop/diagnosis/tags`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setDiagnosisTags(response.data.diagnosisTags);
      } else {
        Alert.alert("실패", response.data.message || "태그 조회 실패");
      }
    } catch (error: any) {
      console.log("Diagnosis Tags API Error:", error.response || error);
      Alert.alert("오류", error.response?.data?.message || "태그 불러오기 실패");
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return Alert.alert("에러", "먼저 사진을 선택해주세요.");
    if (!selectedType) return Alert.alert("에러", "분석 유형을 선택해주세요.");

    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) return Alert.alert("에러", "로그인이 필요합니다.");

      let uploadUri = uploadedImage;

      // iOS ph:// URI 처리
      if (Platform.OS === "ios" && uploadUri.startsWith("ph://")) {
        const localId = uploadUri.substring(5);
        const assetInfo = await MediaLibrary.getAssetInfoAsync(localId);
        if (!assetInfo.localUri) throw new Error("iOS 이미지 로컬 URI 변환 실패");
        uploadUri = assetInfo.localUri;
      }

      // ImageManipulator로 JPEG 변환 및 압축
      const manipResult = await ImageManipulator.manipulateAsync(
        uploadUri,
        [],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      uploadUri = manipResult.uri;

      // FormData 생성
      const formData = new FormData();
      formData.append("analysisType", selectedType);
      formData.append("image", {
        uri: uploadUri,
        type: "image/jpeg",
        name: "diagnosis.jpg",
      } as any);

      // FormData 디버깅
      (formData as any)._parts.forEach(([key, value]: any) => {
        console.log("FormData key:", key);
        if (key === "image") console.log("image uri:", value.uri, "name:", value.name, "type:", value.type);
      });

      // 서버 요청
      const res = await axios.post(`${BASE_URL}api/crop/diagnosis`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.diagnosisResult) {
        const bodyText =
          res.data.diagnosisResult.currentStatusSummary ||
          JSON.stringify(res.data.diagnosisResult);

        setAnalysisResults(prev => ({
          ...prev,
          [selectedType]: { body: bodyText },
        }));
        setIsAnalysisDone(true);
      } else {
        Alert.alert("실패", res.data.message || "분석 결과를 불러오지 못했습니다.");
      }

    } catch (err: any) {
      console.error("분석 요청 에러:", err.response || err);
      Alert.alert("에러", err.response?.data?.message || err.message || "분석 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonPress = () => {
    if (!uploadedImage || !selectedType) return;
    if (!isAnalysisDone) handleAnalyze();
    else navigation.replace('Journal', {
      plantData,
      journal: undefined,
      analysisResult: selectedType
        ? { header: 'AI 분석결과', body: analysisResults[selectedType].body }
        : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Arrowicon width={30} height={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isAnalysisDone ? '작물 분석 결과' : '작물 상태 입력'}</Text>
        {isAnalysisDone ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Xicon width={30} height={30} />
          </TouchableOpacity>
        ) : <View style={{ width: 30 }} />}
      </View>

      {loading && (
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7EB85B" />
        </View>
      )}

      {!loading && (
        <>
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <ImageUploader onSelect={uri => setUploadedImage(uri)} />
          </View>

          <View style={{ width: '90%', alignSelf: 'center', marginTop: 24, marginBottom: 8 }}>
            <Text style={styles.title}>분석 유형</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {Object.entries(diagnosisTags).map(([key, label]) => (
                <View key={key} style={{ marginRight: 8, flexShrink: 0 }}>
                  <BtnOval
                    label={label}
                    selected={selectedType === key}
                    onPress={isAnalysisDone ? undefined : () => setSelectedType(key)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {isAnalysisDone && selectedType && (
            <View style={{ marginTop: 40 }}>
              <MethodDescription headerText="AI 분석결과" bodyText={analysisResults[selectedType].body} />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <BtnLong
              label={isAnalysisDone ? '재배 일지 작성하기' : '분석결과 확인'}
              onPress={handleButtonPress}
              disabled={!uploadedImage || !selectedType}
              style={{
                width: SCREEN_WIDTH * 0.9,
                backgroundColor: uploadedImage && selectedType ? '#7EB85B' : '#D6D6D6',
              }}
              labelStyle={{ paddingVertical: 12, fontSize: 20, fontWeight: '600', color: '#fff' }}
              iconSource={isAnalysisDone ? require('../../assets/icon/icon_note.png') : undefined}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { width: SCREEN_WIDTH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  backButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '500', color: colors.text },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  buttonContainer: { width: SCREEN_WIDTH, alignItems: 'center', paddingVertical: 16, position: 'absolute', bottom: 0, marginBottom: 20 },
});
