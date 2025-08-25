// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

import BtnLong from '../components/BtnLong';
import CardMyPlant from '../components/CardMyPlant';
import { colors, spacing as SP } from '../theme/tokens';

import Plusicon from '../../assets/icon/icon_plus.svg';
import Logo from '../../assets/img/img_logo.svg';
import { getAccessToken } from '../utils/token';
import type { RootStackParamList, HomeStackParamList } from '../navigation/types';

type HomeNav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const route = useRoute<RouteProp<HomeStackParamList, 'HomeMain'>>();
  const [plantList, setPlantList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserCrops = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token) {
        Alert.alert("오류", "로그인 토큰이 없습니다.");
        setLoading(false);
        return;
      }

      const response = await axios.get('http://43.200.244.250/api/crop', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        const normalizedList = response.data.map((item: any) => {
          let imageUri: string | undefined = undefined;
          if (item.cropImg) {
            if (item.cropImg.startsWith('http') || item.cropImg.startsWith('file://')) {
              imageUri = item.cropImg;
            } else {
              imageUri = `http://43.200.244.250${item.cropImg.replace('/srv/app/app', '')}`;
            }
          }
          return { ...item, cropImg: imageUri };
        });

        console.log('Fetched plantList:', normalizedList);
        setPlantList(normalizedList);
      } else {
        setPlantList([]);
      }
    } catch (error: any) {
      console.log("Fetch Crops Error:", error.response || error);
      Alert.alert("오류", error.response?.data?.message || "작물 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 로컬에서 삭제 처리 */
  const deleteUserData = (id: string) => {
    setPlantList(prev => prev.filter(item => item.id !== id));
  };

  useFocusEffect(
  React.useCallback(() => {
    const updatedPlant = route.params?.updatedPlant;
    if (updatedPlant) {
      setPlantList(prev =>
        prev.map(p => (p.id === updatedPlant.id ? { ...p, ...updatedPlant } : p))
      );
    }
    fetchUserCrops();
  }, [route.params?.updatedPlant])
);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Logo width={109} height={30} />
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Image
            source={require('../../assets/icon/bellOff.png')}
            style={styles.bellIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../assets/img/banner.png')}
        style={styles.banner}
        resizeMode="cover"
      />

      <View style={styles.row}>
        <Text style={styles.title}>재배중인 작물</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Plusicon width={30} height={30} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <ActivityIndicator size="large" color="#7EB85B" />
          <Text style={{ marginTop: 12 }}>작물 정보를 불러오는 중...</Text>
        </View>
      ) : plantList.length === 0 ? (
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

          <View style={styles.center}>
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
          {plantList.map((item: any, idx: number) => (
            <CardMyPlant
              key={idx}
              name={item.name ?? '이름 없음'}
              badgeText={item.badgeText ?? ''}
              sowingDate={item.startAt}
              harvestDate={item.endAt ?? item.harvestDateEnd} 
              thumbnail={item.cropImg ? { uri: item.cropImg } : undefined}
              onPress={() =>
                navigation.navigate('PlantDetail', {
                  plantData: {
                    id: item.id,
                    name: item.name,
                    image: item.cropImg ?? undefined,
                    cropImg: item.cropImg ?? undefined,
                    startAt: item.plantingDate,
                    endAt: item.endAt, 
                    badgeText: item.badgeText ?? '',
                  },
                })
              }
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    width: SCREEN_WIDTH * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    alignSelf: 'center',
  },
  bellIcon: { width: 30, height: 30 },
  banner: { width: SCREEN_WIDTH * 0.9, height: (SCREEN_WIDTH * 0.9) * 0.3, alignSelf: 'center', marginTop: 12 },
  row: { width: SCREEN_WIDTH * 0.9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'center', marginTop: 50, marginBottom: SP.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  contentContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 62 },
  content: { fontSize: 16, fontWeight: '600', color: '#A2A2A2', lineHeight: 24 },
  middleImage: { width: SCREEN_WIDTH * 0.5, height: (SCREEN_WIDTH * 0.5) * 0.68, alignSelf: 'center', marginBottom: 16, marginTop: 16 },
  center: { alignItems: 'center', marginTop: SP.md },
  plantList: { paddingHorizontal: 20, paddingBottom: SP.lg, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
