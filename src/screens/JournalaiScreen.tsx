import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Arrowicon from '../../assets/icon/icon_arrowLeft.svg';
import Xicon from '../../assets/icon/x.svg';
import ImageUploader from '../components/ImageUploader';
import BtnLong from '../components/BtnLong';
import BtnOval from '../components/BtnOval';
import MethodDescription from '../components/MethodDescription';
import { AppStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.04;

// Props 타입 추가
type Props = NativeStackScreenProps<AppStackParamList, 'JournalAI'>;

export default function JournalaiScreen({ route, navigation }: Props) {
  const { plantData } = route.params; // plantData 받기
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAnalysisDone, setIsAnalysisDone] = useState(false);
  
  const analysisTypes = ['현재 상태 분석', '질병 여부 분석', '품질 / 시장성'];
  const isButtonEnabled = uploadedImage !== null && selectedType !== null;
  
  // 예시 데이터: 나중에 API에서 받아오는 결과로 교체
  const analysisResults: Record<string, { body: string }> = {
    '현재 상태 분석': { body: '이곳에 현재 상태 분석 결과가 표시됩니다.' },
    '질병 여부 분석': { body: '이곳에 질병 여부 분석 결과가 표시됩니다.' },
    '품질 / 시장성': { body: '이곳에 품질 및 시장성 분석 결과가 표시됩니다.' },
  };

  const handleButtonPress = () => {
    if (!isButtonEnabled) return;

    if (!isAnalysisDone) {
      // 분석 결과 확인
      setIsAnalysisDone(true);
    } else {
      // 재배 일지 작성 페이지로 이동
      navigation.replace('Journal', {
        plantData, // 실제 plantData 넣기
        journal: undefined, // 새 일지 작성
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

      {/* 이미지 업로더 */}
      <View style={{ alignItems: 'center', marginTop: 24 }}>  
        <ImageUploader onSelect={setUploadedImage} />
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
          disabled={!isButtonEnabled}
          style={{
            width: SCREEN_WIDTH * 0.9,
            backgroundColor: isButtonEnabled ? '#7EB85B' : '#D6D6D6',
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
  },
});
