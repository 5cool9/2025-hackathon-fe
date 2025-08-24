import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Arrowicon from "../../assets/icon/icon_arrowLeft.svg";
import CardPlantInfo from "../components/CardPlantInfo";
import MethodDescription from "../components/MethodDescription";
import BtnLong from "../components/BtnLong";
import { colors } from "../theme/tokens";
import { Dimensions } from "react-native";
import { AppStackParamList } from "../navigation/types";
import { getAccessToken } from '../utils/token';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.04;
const CONTENT_WIDTH = SCREEN_WIDTH * 0.9;

type ResultScreenRouteProp = RouteProp<AppStackParamList, "ResultScreen">;
type ResultScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, "ResultScreen">;

export default function ResultScreen() {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute<ResultScreenRouteProp>();

  // AnalyzeScreen에서 전달받은 param
  const { image, name, startDate, endDate, tempCropId, analysisResult } = route.params;

  // 서버에서 가져온 결과 저장할 state (optional)
  const [loading, setLoading] = useState(!analysisResult);
  const [result, setResult] = useState<any>(analysisResult || null);

  useEffect(() => {
  if (!analysisResult && tempCropId) {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const token = getAccessToken(); // 토큰 가져오기
        if (!token) {
          Alert.alert("오류", "로그인 토큰이 없습니다.");
          return;
        }

        const res = await fetch(`http://43.200.244.250/api/crop/analysis-status/${tempCropId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`서버 응답 오류: ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
          setResult(data.analysisResult); // 명세서에 맞춰 analysisResult 사용
        } else {
          Alert.alert("결과 조회 실패", data.message || "서버에서 데이터를 불러올 수 없습니다.");
        }
      } catch (error: any) {
        console.error("분석 상태 조회 에러:", error);
        Alert.alert("결과 조회 실패", "서버에서 데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };


    fetchResult();
  }
}, [tempCropId, analysisResult]);


  const handleButtonPress = () => {
    navigation.navigate("EditregisterScreen", {
      tempCropId,
      image,
      name,
      startDate,
      endDate,
      analysisResult: result,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Arrowicon width={30} height={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>인식 결과</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10 }}>결과를 불러오는 중...</Text>
        </View>
      ) : (
        <>
          {/* 작물 카드 */}
          <View style={styles.cardWrapper}>
            <CardPlantInfo
              thumbnail={image}
              name={name}
              envPlace={result?.environment || "정보 없음"}
              temp={result?.temperature ? `${result.temperature}°C` : "-"}
              height={result?.height || "-"}
              mode="environment"
            />
          </View>

          {/* 재배 방법 */}
          <View style={{ marginTop: 24 }}>
            <MethodDescription
              headerText="재배 방법"
              bodyText={result?.howTo || "재배 방법 정보를 불러오지 못했습니다."}
            />
          </View>

          {/* 확인 버튼 */}
          <View style={styles.buttonWrapper}>
            <BtnLong
              label="확인"
              onPress={handleButtonPress}
              style={{
                width: "100%",
                height: 54,
                borderRadius: 4,
                backgroundColor: "#7EB85B",
              }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: colors.text,
  },
  buttonWrapper: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
    marginBottom: 20,
  },
  cardWrapper: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    marginTop: 24,
  },
});
