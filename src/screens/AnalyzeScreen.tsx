import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, Dimensions, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Arrowicon from '../../assets/icon/icon_arrowLeft.svg';
import CornerSVG from '../../assets/icon/corner.svg';
import { colors } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RootStackParamList = {
  AnalyzeScreen: { image: string };
  ResultScreen: { image: string; result: string };
};

type AnalyzeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AnalyzeScreen'>;

export default function AnalyzeScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<AnalyzeScreenNavigationProp>();
  const imageUri = route.params.image;

  const [analyzing, setAnalyzing] = useState(true);
  const translateY = useRef(new Animated.Value(0)).current;

  const RECT_WIDTH = 358;
  const RECT_HEIGHT = 443;
  const BAR_HEIGHT = 120; // 이동하는 바 높이

  useEffect(() => {
    // 세로 이동 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: RECT_HEIGHT - BAR_HEIGHT, duration: 1500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => {
      setAnalyzing(false);
      navigation.replace('ResultScreen', { image: imageUri, result: 'AI 분석 완료!' });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Arrowicon width={30} height={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>작물 인식</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

        {/* 사각형 영역 */}
        <View style={[styles.rectContainer, { width: RECT_WIDTH, height: RECT_HEIGHT, top: 100 }]}>
          {/* 사각형 모서리 SVG */}
          <CornerSVG style={[styles.corner, { top: 0, left: 0 }]} />
          <CornerSVG style={[styles.corner, { top: 0, right: 0,  transform: [{ scaleX: -1 }] }]} />
          <CornerSVG style={[styles.corner, { bottom: 0, left: 0, transform: [{ scaleX: -1 }, { rotate: '-180deg' }] }]} />
          <CornerSVG style={[styles.corner, { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] }]} />

          {/* 이동하는 투명 바 */}
          {analyzing && (
            <Animated.View
              style={[
                styles.progressBar,
                { height: BAR_HEIGHT, transform: [{ translateY }] },
              ]}
            />
          )}
          <View style={styles.smallBox}>
            <Text style={{ color: 'white' }}>작물을 인식중이에요</Text>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  backButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '500', color: colors.text },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { ...StyleSheet.absoluteFillObject },
  rectContainer: {
    position: 'absolute',
    borderWidth: 0, // 사각형 테두리는 SVG로 표현
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  corner: {
    position: 'absolute',
    width: 45,
    height: 70,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  smallBox: {
    position: 'absolute',
    bottom: -55, 
    transform: [{ translateX: -161/2 }],
    left: '50%',        
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(34,34,34,0.7)',
    width: 161,
  },
});
