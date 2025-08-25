// src/screens/SelectPlantScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackActions, useNavigation } from "@react-navigation/native";
import { colors, spacing, txt } from "../theme/tokens";
import { SellStackParamList, PlantItem } from "../navigation/SellStack";
import ListPlantInfo from "../components/ListPlantInfo";
import ArrowIcon from "../../assets/icon/icon_arrowLeft.svg";
import { api } from "../api/client";

type Nav = NativeStackNavigationProp<SellStackParamList, "SelectPlant">;

// 날짜 포맷: "yy.MM.dd."
const fmtDot = (d?: string | null) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(+dt)) return d as string;
  const yy = String(dt.getFullYear()).slice(2);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}.`;
};

// ✅ 팀원 제안 로직 반영: 이미지 절대 URL 변환
const HOST = "http://43.200.244.250";
const toAbsImage = (u?: string | null) => {
  if (!u) return undefined;
  const s = String(u);
  if (/^https?:\/\//i.test(s) || s.startsWith("file://")) return s;

  // '/srv/app/app/...' 프리픽스 제거
  let path = s.replace(/^\/?srv\/app\/app/i, "");
  // 앞에 슬래시 보장
  if (!path.startsWith("/")) path = `/${path}`;
  return `${HOST}${path}`;
};

export default function SelectPlantScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [plants, setPlants] = useState<PlantItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/board/sell-crops");

        // 응답 형태 방어: 배열 / {items} / {content}
        const raw = Array.isArray(res.data)
          ? res.data
          : (res.data?.items ?? res.data?.content ?? []);

        const mapped: PlantItem[] = (raw ?? []).map((x: any) => {
          const id = x.cropsId ?? x.id ?? x.cropId ?? x.cropID ?? x.cropsID ?? "";
          const name = x.cropsName ?? x.name ?? x.cropName ?? x.crops ?? "작물";
          const start = x.startDate ?? x.startAt ?? x.sowingDate ?? x.sowDate ?? "";
          const end = x.harvestDate ?? x.endAt ?? x.finishAt ?? x.endDate ?? "";

          // ✅ 이미지 후보들 + 팀원 로직 적용(cropImg 포함)
          const imgRaw =
            x.cropImg ??
            x.thumbnailImg ??
            x.thumbnailUrl ??
            x.imageUrl ??
            x.image ??
            x.img ??
            "";

          const imgAbs = toAbsImage(imgRaw) || "https://placehold.co/82x82";

          return {
            id: String(id),
            name,
            startDate: fmtDot(start),
            harvestDate: fmtDot(end),
            image: imgAbs,
          };
        });

        // id 없는 항목 제거 + 중복 제거
        const uniq = new Map<string, PlantItem>();
        mapped.forEach((p) => {
          if (p.id) uniq.set(p.id, p);
        });
        setPlants(Array.from(uniq.values()));
      } catch (e: any) {
        console.log("❌ sell-crops load error", e?.response?.data || e?.message);
        setPlants([]);
      }
    })();
  }, []);

  const onDone = () => {
    if (!selectedId) return;
    const plant = plants.find((p) => p.id === selectedId)!;
    navigation.dispatch(StackActions.push("SellCreate", { plant }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowIcon width={28} height={28} />
        </Pressable>
        <Text style={[txt.H3, styles.headerTitle]}>작물 선택</Text>
        <Pressable onPress={onDone} disabled={!selectedId}>
          <Text style={[txt.H4, { color: selectedId ? colors.primary : colors.gray25 }]}>완료</Text>
        </Pressable>
      </View>

      <Text style={[txt.B1, styles.helper]}>판매할 작물을 선택해주세요</Text>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <ListPlantInfo
            thumbnail={item.image || "https://placehold.co/82x82"}
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
    marginTop: 40,
  },
  backBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: colors.text },
  helper: { color: colors.gray40, marginLeft: spacing.lg, marginBottom: spacing.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
});
