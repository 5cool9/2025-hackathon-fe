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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackActions } from "@react-navigation/native";

import { colors, spacing as SP, txt } from "../theme/tokens";
import type {
  SellStackParamList,
  PlantItem,
  CreatedPostDraft,
  SellCreateEditPayload,
} from "../navigation/SellStack";
import ListPlantInfo from "../components/ListPlantInfo";
import BtnAddphoto from "../components/BtnAddphoto";
import ArrowIcon from "../../assets/icon/icon_arrowLeft.svg";

type Nav = NativeStackNavigationProp<SellStackParamList, "SellCreate">;
type Rt  = RouteProp<SellStackParamList, "SellCreate">;

export default function SellCreateScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();

  // 신규 / 수정 분기
  const params = route.params as
    | { plant: PlantItem }
    | { edit: SellCreateEditPayload }
    | undefined;

  const edit   = (params && "edit"  in params) ? (params as any).edit  as SellCreateEditPayload : undefined;
  const plant  = (params && "plant" in params) ? (params as any).plant as PlantItem            : edit?.plant;
  const isEdit = !!edit;

  // 초기값(수정 모드면 프리필)
  const [photos, setPhotos] = useState<string[]>(isEdit ? edit!.images : []);
  const [title,  setTitle]  = useState(isEdit ? edit!.title : "");
  const [desc,   setDesc]   = useState(isEdit ? edit!.description : "");
  const [price,  setPrice]  = useState(isEdit ? String(edit!.price) : "");

  const isValid = useMemo(() => {
    const n = Number(price);
    return !!plant && title.trim() && desc.trim() && photos.length > 0 && n > 0;
  }, [plant, title, desc, photos, price]);

  const submitLabel = isEdit ? "수정" : "완료";

  // 신규만 포인트 차감 안내, 수정은 차감 없음
  const handleSubmit = () => {
    if (!isValid || !plant) return;

    const titleText = isEdit ? "수정 확인" : "작성 확인";
    const message   = isEdit
      ? "변경 사항을 저장하시겠습니까?"
      : "200 씨앗 포인트가 차감됩니다. 판매 게시글을 작성하시겠습니까?";

    Alert.alert(titleText, message, [
      { text: "취소", style: "cancel" },
      {
        text: submitLabel,
        onPress: async () => {
          // 실제 API가 있다면 여기서 create/update 호출
          const draft: CreatedPostDraft = {
            plant,
            title: title.trim(),
            description: desc.trim(),
            price: Number(price),
            images: photos,
          };

          // 서버 연동 전: draft로 상세 프리뷰로 교체
          navigation.dispatch(
            StackActions.replace("SellDetail", { draft, isMine: true })
          );

          // 서버 연동 시 예시:
          // if (isEdit) {
          //   await updatePostAPI(edit!.id, draft); // 포인트 차감 없음
          //   navigation.dispatch(StackActions.replace("SellDetail", { postId: edit!.id, isMine: true }));
          // } else {
          //   const postId = await createPostAPI(draft); // 포인트 차감은 서버에서 처리
          //   navigation.dispatch(StackActions.replace("SellDetail", { postId, isMine: true }));
          // }
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
        <Text style={[txt.H3, { color: colors.text }]}>상품 등록</Text>
        <Pressable style={s.doneBtn} onPress={handleSubmit} disabled={!isValid}>
          <Text style={[txt.H4, { color: isValid ? colors.primary : colors.gray25 }]}>
            {submitLabel}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} bounces={false}>
        {/* 판매할 작물 */}
        <Text style={[txt.H5, s.sectionTitle]}>판매할 작물</Text>
        {plant ? (
          <ListPlantInfo
            thumbnail={plant.image}
            name={plant.name}
            sowingDate={plant.startDate}
            harvestDate={plant.harvestDate}
            planned={false}
            active={false}
          />
        ) : (
          <Text style={[txt.B2, { color: colors.subText }]}>선택된 작물이 없습니다.</Text>
        )}

        {/* 사진 */}
        <Text style={[txt.H5, s.sectionTitle]}>사진</Text>
        <BtnAddphoto
          onSelect={setPhotos}
          initialSelected={isEdit ? edit!.images : undefined} // 수정 모드 프리필
          // max={9} // 필요 시 조절
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
              상품의 설명을 작성해주세요.{'\n'}{'\n'}
              ✅ 등록 전 꼭 확인해주세요{'\n'}
              - 농약, 제초제 사용 여부는 정확히 입력해주세요.{'\n'}
              - 사진은 실제 작물 상태를 보여주세요.{'\n'}
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
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtn: {
    minWidth: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: SP.lg,
    paddingBottom: SP.lg,
  },
  sectionTitle: {
    color: colors.gray40,
    marginTop: SP.lg,
    marginBottom: SP.sm,
  },
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
  input: {
    ...txt.B2,
    color: colors.gray40,
    includeFontPadding: false,
    padding: 0,
    lineHeight: 22,
  },
  placeholder: {
    ...txt.B2,
    color: colors.subText,
    position: "absolute",
    top: SP.md,
    left: SP.lg,
    right: SP.lg,
  },
});
