import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Modal, Alert } from 'react-native';
import Arrowicon from '../../assets/icon/icon_arrowLeft.svg';
import CardPlantInfo from '../components/CardPlantInfo'; 
import DotMenu from '../../assets/icon/icon_dotMenu.svg';
import MethodDescription from "../components/MethodDescription";
import Plusicon from '../../assets/icon/icon_plus.svg';
import BtnLong from '../components/BtnLong';
import ListNote from '../components/ListNote';
import { colors, spacing as SP } from '../theme/tokens';
import { useJournal, JournalType } from '../context/JournalContext';
import Pen from '../../assets/icon/uil_pen.svg';
import TrashCan from '../../assets/icon/trashcan.svg';
import PlantIcon from '../../assets/icon/plant.svg';
import axios from 'axios';
import { getAccessToken } from '../utils/token';
import { useRegister } from '../context/RegisterContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = SCREEN_WIDTH * 0.9; 

type Props = NativeStackScreenProps<AppStackParamList, 'PlantDetail'>;

// 날짜 포맷 함수
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
};

export default function PlantDetail({ route, navigation }: Props) {
  const { plantData } = route.params;
  const { deleteUserData } = useRegister();
  const { journals, deleteJournal } = useJournal();

  // 로그: 전달된 plantData 확인
  useEffect(() => {
    console.log("route.params.plantData:", plantData);
  }, []);

  if (!plantData.id) {
    Alert.alert("오류", "작물 ID가 없습니다.");
    return null;
  }

  const plantIdStr = plantData.id.toString();
  const plantJournals = journals.filter(j => j.plantName === plantData.name);
  const [menuVisible, setMenuVisible] = useState(false);
  const [analysis, setAnalysis] = useState<{ environment?: string; temperature?: string; height?: string; howTo?: string }>({});

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await axios.get(
          `http://43.200.244.250/api/crop/analysis-status/${plantIdStr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setAnalysis(response.data.analysisResult);
        }
      } catch (error: any) {
        console.log("Analysis API Error:", error.response || error);
      }
    };

    fetchAnalysis();
  }, [plantIdStr]);

  const handleDeleteCrop = async (cropId?: string) => {
    if (!cropId) {
      Alert.alert("오류", "작물 ID가 없습니다.");
      return;
    }
    try {
      const token = await getAccessToken();
      if (!token) { Alert.alert("오류", "로그인 토큰이 없습니다."); return; }

      const response = await axios.delete(
        `http://43.200.244.250/api/crop/${cropId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        plantJournals.forEach(j => deleteJournal(j.id));
        deleteUserData?.(cropId);
        Alert.alert("완료", "작물이 삭제되었습니다.");
        navigation.goBack();
      } else {
        Alert.alert("실패", response.data.message || "삭제 실패");
      }
    } catch (error: any) {
      console.log("Delete Crop API Error:", error.response || error);
      Alert.alert("실패", error.response?.data?.message || "알 수 없는 오류");
    }
  };

  const handleCompleteCrop = async (cropId?: string) => {
    if (!cropId) { Alert.alert("오류", "작물 ID가 없습니다."); return; }
    try {
      const token = await getAccessToken();
      if (!token) { Alert.alert("오류", "로그인 토큰이 없습니다."); return; }

      const response = await axios.put(
        `http://43.200.244.250/api/crop/${cropId}/harvest-status`,
        { harvest: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert("완료", "작물이 재배 완료 상태로 변경되었습니다.");
        navigation.goBack();
      } else {
        Alert.alert("실패", response.data.message || "재배 완료 실패");
      }
    } catch (error: any) {
      console.log("Complete Crop API Error:", error.response || error);
      Alert.alert("실패", error.response?.data?.message || "알 수 없는 오류");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTab')} style={styles.backButton}>
          <Arrowicon width={30} height={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>작물 정보</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.backButton}>
          <DotMenu width={30} height={30} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 상세 내용 */}
        <View style={styles.content}>
          <CardPlantInfo
            thumbnail={plantData.cropImg ? { uri: plantData.cropImg } : undefined}
            name={plantData.name}
            // startAt 또는 startDate 둘 다 fallback
            sowingDate={formatDate(plantData.startAt || plantData.startDate)}
            harvestDate={formatDate(plantData.endAt || plantData.endDate)}
          />
        </View>

        {/* 재배 방법 */}
        <View style={{ marginTop: 20 }}>
          <MethodDescription
            headerText="재배 방법"
            bodyText={analysis.howTo || "재배 방법 데이터를 불러오는 중입니다."}
          />
        </View>

        {/* 재배 일지 */}
        <View style={styles.row}>
          <Text style={styles.title}>재배 일지</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Journal', { plantData })}>
            <Plusicon width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: 12,
            alignSelf: 'center',
            width: CONTENT_WIDTH,
            flexDirection: 'row',
            flexWrap: 'wrap',
            rowGap: 12,
          }}
        >
          {plantJournals.map((item: JournalType, index: number) => (
            <ListNote
              key={index}
              title={item.title}
              preview={item.preview}
              imageUri={item.photos?.[0]}
              onPress={() => navigation.navigate('Journal', {
                plantData,
                journal: { ...item, date: item.date || new Date().toLocaleDateString() },
              })}
              style={{ width: '100%', marginBottom: 8 }}
            />
          ))}
        </View>
      </ScrollView>

      {/* DotMenu 모달 */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(34,34,34,0.4)', justifyContent: 'center', alignItems: 'flex-end' }}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View
            style={{
              position: "absolute",
              top: 100,
              right: 30,
              backgroundColor: "white",
              borderRadius: 4,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 5,
              width: 180,
            }}
          >
            {/* 수정 버튼 */}
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("EditregisterScreen", {
                  tempCropId: Number(plantIdStr),
                  id: plantIdStr,
                  image: plantData.cropImg ?? "",
                  name: plantData.name,
                  startDate: plantData.startAt || plantData.startDate,
                  endDate: plantData.endAt || plantData.endDate,
                  analysisResult: analysis, 
                  cropImg: plantData.cropImg,
                });
              }}
            >
              <Text style={{ fontSize: 16 }}>수정</Text>
              <Pen width={24} height={24} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: "#eee" }} />

            {/* 삭제 버튼 */}
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert(
                  "삭제하시겠습니까?",
                  "",
                  [
                    { text: "취소" },
                    { text: "확인", onPress: () => handleDeleteCrop(plantIdStr) },
                  ]
                );
              }}
            >
              <Text style={{ fontSize: 16 }}>삭제</Text>
              <TrashCan width={24} height={24} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: "#eee" }} />

            {/* 재배 완료 버튼 */}
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert(
                  "재배 완료로 변경하시겠습니까?",
                  "",
                  [
                    { text: "취소" },
                    { text: "확인", onPress: () => handleCompleteCrop(plantIdStr) },
                  ]
                );
              }}
            >
              <Text style={{ fontSize: 16 }}>재배 완료</Text>
              <PlantIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 하단 버튼 */}
      <View style={styles.buttonWrapper}>
        <BtnLong
          label="작물상태 진단받기"
          onPress={() => navigation.navigate('JournalAI', { plantData: { ...plantData, id: plantIdStr } })}
          style={styles.button} 
          iconSource={require('../../assets/icon/CameraWhite.png')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', marginTop:45 },
  backButton: { width: 30, height: 30 },
  headerTitle: { fontSize: 24, fontWeight: '500' },
  content: { alignItems: 'center', marginTop: 20, paddingHorizontal: 16 },
  row: { width: SCREEN_WIDTH * 0.9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'center', marginTop: 40, marginBottom: SP.md },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  button: { width: CONTENT_WIDTH, height: 54, marginTop: 20 },
  buttonWrapper: { width: CONTENT_WIDTH, alignSelf: "center", position: "absolute", bottom: 0, backgroundColor: '#fff', marginBottom:40 },
});
