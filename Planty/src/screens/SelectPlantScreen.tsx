// src/screens/SelectPlantScreen.tsx
import React, { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackActions, useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, txt } from "../theme/tokens";
import { SellStackParamList, PlantItem } from "../navigation/SellStack";
import ListPlantInfo from "../components/ListPlantInfo";
import ArrowIcon from "../../assets/icon/icon_arrowLeft.svg"; // ← 뒤로가기 아이콘(SVG)

type Nav = NativeStackNavigationProp<SellStackParamList, "SelectPlant">;

export default function SelectPlantScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // TODO: API 연동 전 더미
  const plants: PlantItem[] = useMemo(
    () => [
      { id: "1", name: "상추",       startDate: "25.08.20.", harvestDate: "25.09.02.", image: "https://placehold.co/82x82" },
      { id: "2", name: "당근",       startDate: "25.08.20.", harvestDate: "25.09.02.", image: "https://placehold.co/82x82" },
      { id: "3", name: "방울토마토", startDate: "25.08.20.", harvestDate: "25.09.02.", image: "https://placehold.co/82x82" },
      { id: "4", name: "샐러리",     startDate: "25.08.20.", harvestDate: "25.09.02.", image: "https://placehold.co/82x82" },
    ],
    []
  );

  const onDone = () => {
    if (!selectedId) return;
    const plant = plants.find(p => p.id === selectedId)!;
    navigation.dispatch(StackActions.push("SellCreate", { plant }));
  };

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowIcon width={28} height={28} />
        </Pressable>
        <Text style={[txt.H3, styles.headerTitle]}>작물 선택</Text>
        <Pressable onPress={onDone} disabled={!selectedId}>
          <Text style={[txt.H4, { color: selectedId ? colors.primary : colors.gray25 }]}>
            완료
          </Text>
        </Pressable>
      </View>

      {/* 안내 텍스트 */}
      <Text style={[txt.B1, styles.helper]}>판매할 작물을 선택해주세요</Text>

      {/* 리스트 */}
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
            <ListPlantInfo
                thumbnail={item.image}           
                name={item.name}
                sowingDate={item.startDate}      
                harvestDate={item.harvestDate}   
                planned={false}                  
                active={item.id === selectedId}  
                onPress={() => setSelectedId(item.id)}
            />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop:40,
  },
  backBtn: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: colors.text },
  helper: {
    color: colors.gray40,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
