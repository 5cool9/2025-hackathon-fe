import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Image, TouchableOpacity, Text, Dimensions, ScrollView } from 'react-native';
import BtnLong from '../components/BtnLong';
import CardMyPlant from '../components/CardMyPlant'; // CardMyPlant 컴포넌트 임포트
import { colors, fontSize, fontWeight, spacing as SP } from '../theme/tokens';
import Plusicon from '../../assets/icon/icon_plus.svg';
import { RootStackParamList } from '../navigation/types';
import Logo from '../../assets/img/img_logo.svg';
import { useRegister } from '../context/RegisterContext';

type UserRegisterData = {
  name: string;
  image?: string;
  badgeText?: string;
  sowingDate?: string;
  harvestDate?: string;
  harvestDateEnd?: string; 
};



const { width: SCREEN_WIDTH } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type PlantData = {
  name: string;
  image?: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userData } = useRegister();
  if (!userData) return null;

  
  // Context에 값이 있으면 배열로 만들어서 map 돌리기
  const plantList = userData;
  return (
    <SafeAreaView style={styles.safe}>
      {/* 상단 종 아이콘 */}
      <View style={styles.header}>
        <Logo width={109} height={30} />
        <TouchableOpacity onPress={() => console.log('알림 아이콘 클릭')}>
          <Image
            source={require('../../assets/icon/bellOff.png')} 
            style={styles.bellIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* 배너 이미지 */}
      <Image
        source={require('../../assets/img/banner.png')} 
        style={styles.banner}
        resizeMode="cover"
      />

      {/* 배너 아래: 좌측 텍스트 / 우측 아이콘 */}
      <View style={styles.row}>
        <Text style={styles.title}>재배중인 작물</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Plusicon width={30} height={30} />
        </TouchableOpacity>
      </View>

      {/* 등록된 작물 유무에 따른 조건부 렌더링 */}
      {plantList.length === 0 ? (
        <>
          <View style={styles.contentContainer}>
            <Text style={styles.content}>등록된 작물이 없어요</Text>
            <Text style={styles.content}>재배하고 있는 작물을 등록해보세요</Text>
          </View>

          <Image
            source={require('../../assets/img/img_farmer.png')} 
            style={styles.middleImage}
            resizeMode="cover"
          />

          <View style={styles.container}>
            <BtnLong
              label="작물 등록하기"
              onPress={() => navigation.navigate('Register')}
              disabled={false}
              style={{ width: 119 }}
              labelStyle={{ paddingHorizontal: 16, paddingVertical: 8, fontSize: 16, fontWeight: '600' }}
            />
          </View>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.plantList}>
          {plantList.map((item, index) => (
            <CardMyPlant
              key={index}
              name={item.name}
              thumbnail={item.image ? { uri: item.image } : undefined} 
              badgeText={item.badgeText}
              onPress={() => navigation.navigate('PlantDetail', { plantData: item })}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    width: SCREEN_WIDTH * 0.9,
    flexDirection: 'row',        
    justifyContent: 'space-between',
    alignItems: 'center',      
    marginTop: 18,
    alignSelf: 'center',
    paddingHorizontal: 0,
  },
  bellIcon: {
    width: 30,
    height: 30,
  },
  banner: {
    width: SCREEN_WIDTH * 0.9, 
    height: (SCREEN_WIDTH * 0.9) * 0.3, 
    alignSelf: 'center',
    marginTop: 12,
  },
  row: {
    width: SCREEN_WIDTH * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: SP.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'regular',
    color: colors.text,
  },
  contentContainer: {
    justifyContent: 'center', 
    alignItems: 'center',    
    marginTop: 62,
  },
  content: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'regular',
    color: '#A2A2A2',
    lineHeight: 24,
  },
  middleImage: {
    width: SCREEN_WIDTH * 0.5, 
    height: (SCREEN_WIDTH * 0.5) * 0.68, 
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  container: {
    alignItems: 'center',
    marginTop: SP.md,
  },
  plantList: {
    paddingHorizontal: 30,
    paddingBottom: SP.lg,
    flexDirection: 'row',    // 가로 방향
    flexWrap: 'wrap',        // 줄바꿈 허용
    justifyContent: 'space-between', // 카드 사이 간격
  },
});
