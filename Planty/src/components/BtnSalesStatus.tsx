// components/BtnSaleStatus.tsx
import React, { useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Animated, Easing,
} from "react-native";
import { colors, txt } from "../theme/tokens";
import ArrowIcon from "../../assets/icon/arrow.svg";

type SaleStatus = "판매중" | "판매완료";

export default function BtnSaleStatus() {
  const [status, setStatus] = useState<SaleStatus>("판매중");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 애니메이션 값
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(40)).current; // 아래에서 살짝 올라오게

  const open = () => {
    setIsModalVisible(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 40,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => finished && setIsModalVisible(false));
  };

  const handleSelect = (newStatus: SaleStatus) => {
    setStatus(newStatus);
    close();
  };

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={open} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{status}</Text>
        <ArrowIcon width={12} height={12} stroke={colors.gray70} strokeWidth={2} style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent animationType="none" onRequestClose={close}>
        {/* overlay는 페이드만 */}
        <Pressable style={StyleSheet.absoluteFill} onPress={close}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </Pressable>

        {/* 시트는 아래에서 슬라이드 */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
            {/* === 그랩바 === */}
        <View style={styles.grabber} />
          <TouchableOpacity onPress={() => handleSelect("판매중")} style={styles.option}>
            <Text style={styles.optionText}>판매중</Text>
          </TouchableOpacity>
          {/* === 구분선 === */}
        <View style={styles.divider} />
          <TouchableOpacity onPress={() => handleSelect("판매완료")} style={styles.option}>
            <Text style={styles.optionText}>판매완료</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity onPress={close} style={styles.option}>
            <Text style={[styles.optionText2, { color: colors.gray90 }]}>취소</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
}

const SHEET_RADIUS = 12;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    minWidth: 82,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.gray20,
    borderRadius: 4,
    backgroundColor: colors.gray0,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray20, // 밝은 회색
    marginBottom: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray20,  // tokens.ts의 gray20 근사
  },

  buttonText: { ...txt.B1, color: colors.gray70 },

  // overlay는 스크린 전체를 덮는 반투명 레이어 (위/아래 이동 없음)
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  // 시트는 하단 고정 + 위로 슬라이드
  sheet: {
    height:226,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 18,               // 그랩바 위 여백
    paddingBottom: 24,           // 홈 인디케이터 겹침 방지
    backgroundColor: colors.gray0,
    paddingVertical: 12,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
  },
  option: {
    paddingVertical: 14,
    alignItems: "center",
  },
  optionText: {
    ...txt.B2,
    color: colors.gray70,
  },
  optionText2: {
    ...txt.B1,
    color: colors.gray90,
  },
});
