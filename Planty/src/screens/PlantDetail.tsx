// src/screens/PlantDetail.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import React, { useState } from 'react';
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
import { useRegister } from '../context/RegisterContext';
import Pen from '../../assets/icon/uil_pen.svg';
import TrashCan from '../../assets/icon/trashcan.svg';
import PlantIcon from '../../assets/icon/plant.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = SCREEN_WIDTH * 0.9; 

type Props = NativeStackScreenProps<AppStackParamList, 'PlantDetail'>;

export default function PlantDetail({ route, navigation }: Props) {
  const { plantData } = route.params;
  const { journals, deleteJournal } = useJournal();
  const { deleteUserData } = useRegister();

  const plantJournals = journals.filter(j => j.plantName === plantData.name);

  // DotMenu 모달 상태
  const [menuVisible, setMenuVisible] = useState(false);

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
            thumbnail={plantData?.image}
            name={plantData?.name}
            sowingDate={plantData?.startDate}
            harvestDate={plantData?.endDate} 
            planned={true}
            mode="schedule" 
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <MethodDescription
            headerText="재배 방법" 
            bodyText="햇볕이 잘 드는 곳에 심고, 흙은 물빠짐이 좋게 준비해요. 하루 1~2회, 겉흙이 마르면 충분히 물을 줘요.
            병충해 예방을 위해 통풍을 잘 시켜 주세요.
            심은 지 3~4주 후, 잎이 20cm쯤 되면 수확해요."
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
                journal: {
                  ...item,
                  date: item.date || new Date().toLocaleDateString(),
                },
              })}
              style={{ width: '100%', marginBottom: 8 }}
            />
          ))}
        </View>
      </ScrollView>

      {/* DotMenu 모달 */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(34,34,34,0.4)',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
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
            
<TouchableOpacity
  style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}
  onPress={() => {
    setMenuVisible(false);

    // plantData를 EditRegisterScreen에 넘기기
    navigation.navigate("EditregisterScreen", {
      id: plantData.id,
      image: plantData.image ?? "",
      name: plantData.name,
      startDate: plantData.startDate,
      endDate: plantData.endDate,
    });
  }}
>
  <Text style={{ fontSize: 16 }}>수정</Text>
  <Pen width={24} height={24} />
</TouchableOpacity>


            <View style={{ height: 1, backgroundColor: "#eee" }} />

          
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert(
                  "삭제하시겠습니까?",
                  "",
                  [
                    { text: "취소" },
                    { 
                      text: "확인", 
                      onPress: () => {
                        plantJournals.forEach(j => deleteJournal(j.id));
                        deleteUserData(plantData.name);
                         navigation.goBack();
                        } 
                      },
                    ]
                  );
              }}
            >
              <Text style={{ fontSize: 16 }}>삭제</Text>
              <TrashCan width={24} height={24} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: "#eee" }} />

            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert(
                  "재배 완료로 변경하시겠습니까?",
                  "",
                  [
                    { text: "취소" },
                    { text: "확인" },
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
          onPress={() => navigation.navigate('JournalAI', { plantData })}
          style={styles.button} 
          iconSource={require('../../assets/icon/CameraWhite.png')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: { width: 30, height: 30 },
  headerTitle: { fontSize: 24, fontWeight: '500' },
  content: { alignItems: 'center', marginTop: 20, paddingHorizontal: 16 },
  row: {
    width: SCREEN_WIDTH * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: SP.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  button: { width: CONTENT_WIDTH, height: 54, marginTop: 20 },
  buttonWrapper: {
    width: CONTENT_WIDTH,
    alignSelf: "center",
    position: "absolute",
    bottom: 0,
    backgroundColor: '#fff',
  },
});
