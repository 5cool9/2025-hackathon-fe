// src/screens/SellCreateScreen.tsx
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing as SP, txt } from "../theme/tokens";
import type { SellStackParamList, PlantItem, SellCreateEditPayload } from "../navigation/SellStack";
import ListPlantInfo from "../components/ListPlantInfo";
import BtnAddphoto from "../components/BtnAddphoto";
import ArrowIcon from "../../assets/icon/icon_arrowLeft.svg";
import { api } from "../api/client";

type Nav = NativeStackNavigationProp<SellStackParamList, "SellCreate">;
type Rt  = RouteProp<SellStackParamList, "SellCreate">;

/* ---------------- helpers ---------------- */

const normalizeAssetUri = (uri: string) => {
  if (!uri) return uri;
  if (/^(ph|content|assets-library):\/\//i.test(uri)) return uri; // iOS/Android asset URI
  return uri.startsWith("file://") ? uri : `file://${uri}`;
};

// 절대 URL -> 서버 상대 경로 (/uploads/...)
const toServerPath = (u: string) => u.replace(/^https?:\/\/[^/]+/i, "");

// RN FormData 디버그 로그
const logFormParts = (title: string, fd: FormData) => {
  try {
    // @ts-ignore RN 전용
    const parts = (fd as any)._parts;
    console.log(
      "🧩", title, "parts:\n" +
        (Array.isArray(parts)
          ? parts
              .map(([k, v]: any[]) => {
                if (typeof v === "object" && v?.uri) return `- ${k} {file ${v.name} ${v.type}}`;
                if (typeof v === "string") return `- ${k} ${v.slice(0, 140)}`;
                return `- ${k} (blob/json)`;
              })
              .join("\n")
          : "(no parts)")
    );
  } catch {}
};

const appendImages = (fd: FormData, key: string, uris: string[]) => {
  uris.forEach((u, i) =>
    fd.append(key, { uri: normalizeAssetUri(u), name: `image_${i}.jpg`, type: "image/jpeg" } as any)
  );
};

/* ---------------- API: 생성 ---------------- */

const createPostSafe = async (
  plantId: string,
  title: string,
  desc: string,
  price: number,
  photos: string[]
) => {
  const payload = {
    cropId: Number.isFinite(+plantId) ? Number(plantId) : plantId,
    title: title.trim(),
    content: desc.trim(),
    price: Number(price),
  };

  const fd = new FormData();

  // form 파트는 Blob + filename 으로
  const json = JSON.stringify(payload);
  const blob = new Blob([json], { type: "application/json" } as any);
  // filename을 반드시 전달
  (fd as any).append("form", blob, "form.json");

  appendImages(fd, "images", photos);

  logFormParts("POST /api/board", fd);

  const res = await api.post<any>("/api/board", fd, { validateStatus: () => true });
  console.log("📨 create status:", res.status, res.data as any);

  if (res.status >= 200 && res.status < 300) return (res.data as any).id;

  throw new Error(typeof res.data === "string" ? res.data : (res.data?.message || "생성 실패"));
};

/* ---------------- API: 수정 ---------------- */

const updatePostSafe = async (
  postId: string,
  title: string,
  desc: string,
  price: number,
  photos: string[]
) => {
  // 유지할(기존) 이미지: 절대 URL만 골라서 서버 상대 경로로 바꿔 전송
  const keepAbs = photos.filter((u) => /^https?:\/\//i.test(u));
  const keepRel = keepAbs.map(toServerPath);
  // 새로 추가된 로컬 파일들
  const newly   = photos.filter((u) => !/^https?:\/\//i.test(u));

  const form = { title: title.trim(), content: desc.trim(), price: Number(price) };

  const fd = new FormData();

  // 1) form 파트 (application/json) — Blob + filename 방식
  {
    const json = JSON.stringify(form);
    const blob = new Blob([json], { type: "application/json" } as any);
    (fd as any).append("form", blob, "form.json");
  }

  // 2) 유지할 이미지 경로 목록 — JSON 배열 문자열
  fd.append("imageUrls", JSON.stringify(keepRel) as any);

  // 3) 새 이미지
  if (newly.length) appendImages(fd, "images", newly);

  logFormParts(`PUT /api/board/details/${postId}`, fd);

  const res = await api.put<any>(`/api/board/details/${postId}`, fd, { validateStatus: () => true });
  console.log("📨 update status:", res.status, res.data);

  if (!(res.status >= 200 && res.status < 300)) {
    const msg = typeof res.data === "string" ? res.data : (res.data?.message || "수정 실패");
    throw new Error(msg);
  }
};

/* ---------------- Screen ---------------- */

export default function SellCreateScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();

  const params = route.params as
    | { plant: PlantItem }
    | { edit: SellCreateEditPayload }
    | undefined;

  const edit   = (params && "edit"  in params) ? (params as any).edit  as SellCreateEditPayload : undefined;
  const plant  = (params && "plant" in params) ? (params as any).plant as PlantItem            : edit?.plant;
  const isEdit = !!edit;

  const [photos, setPhotos] = useState<string[]>(isEdit ? edit!.images : []);
  const [title,  setTitle]  = useState(isEdit ? edit!.title : "");
  const [desc,   setDesc]   = useState(isEdit ? edit!.description : "");
  const [price,  setPrice]  = useState(isEdit ? String(edit!.price) : "");

  // 생성: plant 필수 / 수정: plant 없어도 됨
  const isValid = useMemo(() => {
    const n = Number(price);
    const baseOk = !!title.trim() && !!desc.trim() && photos.length > 0 && n > 0;
    return isEdit ? baseOk : (!!plant && baseOk);
  }, [isEdit, plant, title, desc, photos, price]);

  const submitLabel = isEdit ? "수정" : "완료";

  const handleSubmit = async () => {
    if (!isValid) return;

    let message = isEdit ? "변경 사항을 저장하시겠습니까?" : "판매 게시글을 작성하시겠습니까?";
    if (!isEdit) {
      try {
        const { data } = await api.get<any>("/api/board/point");
        const need = Number(data?.requiredPoint ?? data?.needPoint ?? 200);
        const have = Number(data?.availablePoint ?? data?.seed ?? data?.point ?? data?.seedPoint ?? 0);
        message = `게시글 작성에 ${need} 포인트가 필요합니다.\n현재 보유: ${have}p\n\n작성하시겠습니까?`;
      } catch {}
    }

    Alert.alert(isEdit ? "수정 확인" : "작성 확인", message, [
      { text: "취소", style: "cancel" },
      {
        text: submitLabel,
        onPress: async () => {
          try {
            if (isEdit) {
              await updatePostSafe(edit!.id, title, desc, Number(price), photos);
            } else {
              // 생성일 때는 plant가 반드시 존재
              await createPostSafe(String((plant as PlantItem).id), title, desc, Number(price), photos);
            }
            // 성공 후: 판매 목록으로 초기화 + 새로고침 신호
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "SellList", params: { refreshAt: Date.now() } }],
              })
            );
          } catch (e: any) {
            const raw = e?.response?.data ?? e?.message;
            const msg =
              (typeof raw === "string" && raw) ||
              e?.response?.data?.message ||
              "요청을 처리하지 못했습니다.";
            Alert.alert("오류", msg);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      {/* 헤더 */}
      <View style={s.header}>
        <Pressable style={s.iconBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <ArrowIcon width={28} height={28} />
        </Pressable>
        <Text style={[txt.H3, { color: colors.text }]}>{isEdit ? "상품 수정" : "상품 등록"}</Text>
        <Pressable style={s.doneBtn} onPress={handleSubmit} disabled={!isValid}>
          <Text style={[txt.H4, { color: isValid ? colors.primary : colors.gray25 }]}>{submitLabel}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} bounces={false}>
        {/* 판매할 작물 */}
        <Text style={[txt.H5, s.sectionTitle]}>판매할 작물</Text>
        {plant ? (
          <ListPlantInfo
            thumbnail={plant.image || "https://placehold.co/82x82"}
            name={plant.name}
            sowingDate={plant.startDate}
            harvestDate={plant.harvestDate}
            planned={false}
            active={false}
          />
        ) : (
          <Text style={[txt.B2, { color: colors.subText }]}>
            {isEdit ? "작물은 수정할 수 없습니다." : "선택된 작물이 없습니다."}
          </Text>
        )}

        {/* 사진 */}
        <Text style={[txt.H5, s.sectionTitle]}>사진</Text>
        <BtnAddphoto
          onSelect={setPhotos}
          initialSelected={isEdit ? edit!.images : undefined}
        />

        {/* 제목 */}
        <Text style={[txt.H5, s.sectionTitle]}>제목</Text>
        <View style={[s.field, s.single]}>
          {!title && <Text style={s.placeholder}>제목을 입력해주세요.</Text>}
          <TextInput value={title} onChangeText={setTitle} style={s.input} />
        </View>

        {/* 설명 */}
        <Text style={[txt.H5, s.sectionTitle]}>설명</Text>
        <View style={[s.field, s.multi]}>
          {!desc && (
            <Text style={s.placeholder}>
              상품의 설명을 작성해주세요.{"\n"}{"\n"}
              ✅ 등록 전 꼭 확인해주세요{"\n"}
              - 농약, 제초제 사용 여부는 정확히 입력해주세요.{"\n"}
              - 사진은 실제 작물 상태를 보여주세요.{"\n"}
              - 판매 단위와 수량은 명확히 적어주세요.
            </Text>
          )}
          <TextInput
            value={desc}
            onChangeText={setDesc}
            style={[s.input, { minHeight: 168 - SP.md * 2 }]}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 가격 */}
        <Text style={[txt.H5, s.sectionTitle]}>가격</Text>
        <View style={[s.field, s.single]}>
          {!price && <Text style={s.placeholder}>가격을 입력해주세요.</Text>}
          <TextInput
            value={price}
            onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            style={s.input}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SP.lg,
    paddingVertical: SP.lg,
    backgroundColor: colors.bg,
    marginTop: 40,
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  doneBtn: { minWidth: 44, height: 44, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: SP.lg, paddingBottom: SP.lg },
  sectionTitle: { color: colors.gray40, marginTop: SP.lg, marginBottom: SP.sm },
  field: {
    position: "relative",
    backgroundColor: colors.gray10,
    borderRadius: 4,
    paddingHorizontal: SP.lg,
    paddingVertical: SP.md,
    overflow: "hidden",
  },
  single: { minHeight: 48 },
  multi: { minHeight: 168 },
  input: { ...txt.B2, color: colors.gray40, includeFontPadding: false, padding: 0, lineHeight: 22 },
  placeholder: { ...txt.B2, color: colors.subText, position: "absolute", top: SP.md, left: SP.lg, right: SP.lg },
});
