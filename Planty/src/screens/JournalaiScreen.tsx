import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Base URL
const BASE_URL = "http://43.200.244.250/";

// Props 타입 추가
type Props = NativeStackScreenProps<AppStackParamList, 'JournalAI'>;

export default function JournalaiScreen({ route, navigation }: Props) {
  const { plantData } = route.params;
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAnalysisDone, setIsAnalysisDone] = useState(false);
  const [analysisTypes, setAnalysisTypes] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Record<string, { body: string }>>({});
  const [loading, setLoading] = useState(false);

  // 경로 가공 함수
  const formatImageUrl = (path: string) => {
    if (path.startsWith("srv/app/app")) {
      return BASE_URL + path.replace("srv/app/app/", "");
    }
    return path; // 이미 전체 URL이면 그대로 사용
  };

  // 페이지 로드 시 작물 진단 정보 조회
  useEffect(() => {
    const fetchDiagnosisInfo = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        if (!token) {
          Alert.alert("오류", "로그인 토큰이 없습니다.");
          return;
        }

        const response = await axios.get(
          `${BASE_URL}api/crop/${plantData.id}/diagnosis`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          // 진단 옵션 가져오기
          const options = response.data.diagnosisOptions;
          const typeLabels: string[] = [];
          const results: Record<string, { body: string }> = {};

          if (options.CURRENT_STATUS) {
            typeLabels.push(options.CURRENT_STATUS);
            results[options.CURRENT_STATUS] = { body: '현재 상태 분석 결과가 표시됩니다.' };
          }
          if (options.DISEASE_CHECK) {
            typeLabels.push(options.DISEASE_CHECK);
            results[options.DISEASE_CHECK] = { body: '질병 여부 분석 결과가 표시됩니다.' };
          }
          if (options.QUALITY_MARKET) {
            typeLabels.push(options.QUALITY_MARKET);
            results[options.QUALITY_MARKET] = { body: '품질/시장성 분석 결과가 표시됩니다.' };
          }

          setAnalysisTypes(typeLabels);
          setAnalysisResults(results);

          // 서버에서 내려준 이미지 path 처리 (만약 response에 있다면)
          if (response.data.imagePath) {
            setUploadedImage(formatImageUrl(response.data.imagePath));
          }
        } else {
          Alert.alert("실패", response.data.message || "진단 정보 조회 실패");
        }
      } catch (error: any) {
        console.log("Diagnosis Info API Error:", error.response || error);
        Alert.alert("실패", error.response?.data?.message || "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosisInfo();
  }, [plantData.id]);

  // 분석 실행
  const handleAnalyze = async () => {
    if (!uploadedImage || !selectedType) return;

    try {
      setLoading(true);
      const token = getAccessToken();
      if (!token) {
        Alert.alert("오류", "로그인 토큰이 없습니다.");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}api/crop/${plantData.id}/diagnosis`,
        {
          analysisType: selectedType === '현재 상태 분석' ? 'CURRENT_STATUS'
          : selectedType === '질병 여부 분석' ? 'DISEASE_CHECK'
          : 'QUALITY_MARKET',
          imageUrl: uploadedImage?.replace(BASE_URL, "/") // 서버가 /uploads/... 형태 원한다면 이렇게 변환
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );


      if (response.data.success) {
        // 서버에서 받은 분석 결과로 body 업데이트
        const resultBody = JSON.stringify(response.data.analysisResult, null, 2);
        setAnalysisResults(prev => ({ ...prev, [selectedType]: { body: resultBody } }));
        setIsAnalysisDone(true);
      } else {
        Alert.alert("실패", response.data.message || "분석 실행 실패");
      }
    } catch (error: any) {
      console.log("Analyze Diagnosis API Error:", error.response || error);
      Alert.alert("실패", error.response?.data?.message || "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonPress = () => {
    if (!uploadedImage || !selectedType) return;

    if (!isAnalysisDone) {
      handleAnalyze();
    } else {
      // 재배 일지 작성 페이지로 이동
      navigation.replace('Journal', {
        plantData,
        journal: undefined,
        analysisResult: selectedType
          ? { header: 'AI 분석결과', body: analysisResults[selectedType].body }
          : undefined,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Arrowicon width={30} height={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isAnalysisDone ? '작물 분석 결과' : '작물 상태 입력'}
        </Text>
        {isAnalysisDone ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Xicon width={30} height={30} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>

      {loading && (
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7EB85B" />
        </View>
      )}

      {!loading && (
        <>
          {/* 이미지 업로더 */}
          <View style={{ alignItems: 'center', marginTop: 24 }}>  
            <ImageUploader onSelect={(uri) => setUploadedImage(formatImageUrl(uri))} />
          </View>

          {/* 분석 유형 */}
          <View style={{ width: '90%', alignSelf: 'center', marginTop: 24, marginBottom: 8 }}>
            <Text style={styles.title}>분석 유형</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {analysisTypes.map((type) => (
                <View key={type} style={{ marginRight: 8, flexShrink: 0 }}>
                  <BtnOval
                    label={type}
                    selected={selectedType === type}
                    onPress={isAnalysisDone ? undefined : () => setSelectedType(type)} 
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 분석 결과 출력 */}
          {isAnalysisDone && selectedType && (
            <View style={{ marginTop: 40 }}>
              <MethodDescription
                headerText="AI 분석결과"
                bodyText={analysisResults[selectedType].body}
              />
            </View>
          )}

          {/* 하단 버튼 */}
          <View style={styles.buttonContainer}>
            <BtnLong
              label={isAnalysisDone ? '재배 일지 작성하기' : '분석결과 확인'}
              onPress={handleButtonPress}
              disabled={!uploadedImage || !selectedType}
              style={{
                width: SCREEN_WIDTH * 0.9,
                backgroundColor: uploadedImage && selectedType ? '#7EB85B' : '#D6D6D6',
              }}
              labelStyle={{
                paddingVertical: 12,
                fontSize: 20,
                fontWeight: '600',
                color: '#fff',
              }}
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
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  buttonContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'absolute',
    bottom: 0,
    marginBottom:20
  },
});
