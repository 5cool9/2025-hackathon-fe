// components/BtnSaleStatus.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Animated, Easing, ViewStyle,
} from "react-native";
import { colors, txt } from "../theme/tokens";
import ArrowIcon from "../../assets/icon/arrow.svg";

export type SaleStatus = "판매중" | "판매완료";

type Props = {
  /** 외부에서 상태를 제어하고 싶을 때 전달 (controlled) */
  value?: SaleStatus;
  /** 내부에서 상태를 관리하고 싶을 때 초기값 (uncontrolled) */
  defaultValue?: SaleStatus;
  /** 상태 변경 콜백 */
  onChange?: (next: SaleStatus) => void;
  /** false면 읽기 전용 뱃지처럼 동작(모달 안 열림) */
  editable?: boolean;
  /** 버튼 스타일 오버라이드 */
  style?: ViewStyle;
};

export default function BtnSaleStatus({
  value,
  defaultValue = "판매중",
  onChange,
  editable = true,
  style,
}: Props) {
  // 내부 상태(미제공 시만 사용)
  const [inner, setInner] = useState<SaleStatus>(value ?? defaultValue);
  const status: SaleStatus = (value ?? inner);

  const [isModalVisible, setIsModalVisible] = useState(false);

  // 애니메이션 값
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(40)).current;
  const arrowRotate = useRef(new Animated.Value(0)).current; // 0~1 -> 0deg~180deg

  // 외부 value가 바뀌면 내부도 동기화
  useEffect(() => {
    if (value !== undefined) setInner(value);
  }, [value]);

  const open = () => {
    if (!editable) return;
    setIsModalVisible(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(arrowRotate, {
        toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
    ]).start();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 40, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(arrowRotate, {
        toValue: 0, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
    ]).start(({ finished }) => finished && setIsModalVisible(false));
  };

  const select = (next: SaleStatus) => {
    // controlled: 외부로 알리고 닫기
    onChange?.(next);
    // uncontrolled: 내부 상태도 갱신
    if (value === undefined) setInner(next);
    close();
  };

  const rotateStyle = {
    transform: [
      {
        rotate: arrowRotate.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, !editable && styles.buttonReadonly, style]}
        onPress={open}
        activeOpacity={editable ? 0.8 : 1}
        accessibilityRole="button"
        accessibilityState={{ disabled: !editable }}
      >
        <Text style={styles.buttonText}>{status}</Text>
        {editable && (
          <Animated.View style={[{ marginLeft: 6 }, rotateStyle]}>
            <ArrowIcon width={12} height={12} stroke={colors.gray70} strokeWidth={2} />
          </Animated.View>
        )}
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent animationType="none" onRequestClose={close}>
        {/* overlay */}
        <Pressable style={StyleSheet.absoluteFill} onPress={close}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </Pressable>

        {/* bottom sheet */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
          <View style={styles.grabber} />
          <TouchableOpacity onPress={() => select("판매중")} style={styles.option}>
            <Text style={styles.optionText}>판매중</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity onPress={() => select("판매완료")} style={styles.option}>
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
  buttonReadonly: {
    // 읽기 전용이면 드롭다운 느낌 줄이는 미묘한 스타일(선택)
    opacity: 0.9,
  },
  buttonText: { ...txt.B1, color: colors.gray70 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  sheet: {
    height: 226,
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    paddingTop: 18,
    paddingBottom: 24,
    backgroundColor: colors.gray0,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray20,
    marginBottom: 12,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.gray20 },
  option: { paddingVertical: 14, alignItems: "center" },
  optionText: { ...txt.B2, color: colors.gray70 },
  optionText2: { ...txt.B1, color: colors.gray90 },
});
