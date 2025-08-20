import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Arrowicon from "../../assets/icon/icon_arrowLeft.svg";
import CardPlantInfo from "../components/CardPlantInfo";
import MethodDescription from "../components/MethodDescription";
import BtnLong from "../components/BtnLong";
import { colors } from "../theme/tokens";
import { Dimensions } from "react-native";
import { AppStackParamList } from '../navigation/types';
import { useRegister } from '../context/RegisterContext';


const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.04; 
const CONTENT_WIDTH = SCREEN_WIDTH * 0.9; 


type RootStackParamList = {
  AnalyzeScreen: { image: string };
  ResultScreen: { image: string; result: string };
};

type ResultScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, "ResultScreen">;

export default function ResultScreen() {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute<any>();
  const { tempData } = useRegister();
  const image = tempData?.image || "";  
  const name = tempData?.name || "";  
  const { saveTempData } = useRegister();
  
  const handleButtonPress = () => {
  saveTempData({
    image,
    name,
    startDate: tempData?.startDate,
    endDate: tempData?.endDate,
  });

  navigation.navigate('EditregisterScreen', {
  image: image, // string
  name: name       // string
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

    <View style={{ marginTop: 24 }}>
      <CardPlantInfo
        thumbnail={image}   // AnalyzeScreen에서 넘겨준 사진 사용
        name={name}    // 지금은 하드코딩, 나중에 API 연결 가능
        envPlace="온실"
        temp="25°C"
        height="30cm"
        mode="environment" 
      />
    </View>

    <View style={{ marginTop: 24 }}>
      <MethodDescription
            headerText="재배 방법"
            bodyText="햇볕이 잘 드는 곳에 심고, 흙은 물빠짐이 좋게 준비해요. 하루 1~2회, 겉흙이 마르면 충분히 물을 줘요.
                      병충해 예방을 위해 통풍을 잘 시켜 주세요.
                      심은 지 3~4주 후, 잎이 20cm쯤 되면 수확해요."
       />
    </View>

       <View style={styles.buttonWrapper}>
        <BtnLong
          label="확인"
          onPress={handleButtonPress} 
           style={{
            width: '100%',
            height: 54,      
            borderRadius: 4, 
            backgroundColor: '#7EB85B',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.text,
  },
  resultText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  buttonWrapper: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    position: "absolute",   // 화면 기준 절대 위치
    bottom: 20,    
  },
});
