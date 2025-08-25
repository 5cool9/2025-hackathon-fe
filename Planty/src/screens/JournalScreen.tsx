// src/screens/JournalScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ScrollView,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/types";
import Arrowicon from "../../assets/icon/icon_arrowLeft.svg";
import CameraAddPhoto from "../components/AddPhoto";
import DotMenu from "../../assets/icon/icon_dotMenu.svg";
import Pen from "../../assets/icon/uil_pen.svg";
import TrashCan from "../../assets/icon/trashcan.svg";
import { useJournal, JournalType } from "../context/JournalContext";
import MethodDescription from '../components/MethodDescription';
import BtnToggle from '../components/BtnToggle';
import axios from "axios";
import { getAccessToken } from "../utils/token";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.04;
const BOTTOM_BAR_HEIGHT = 80;
const BOTTOM_OFFSET = 30;
const BASE_URL = "http://43.200.244.250";

type Props = NativeStackScreenProps<AppStackParamList, "Journal">;

export default function JournalScreen({ navigation, route }: Props) {
  const plantData = route.params?.plantData;
  const journal = route.params?.journal;
  const analysisResult = route.params?.analysisResult; 
  const { deleteJournal, addJournal, updateJournal , journals } = useJournal();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [isMethodVisible, setIsMethodVisible] = useState(true);
  const isValid = title.trim().length > 0 && content.trim().length > 0;
  const [isEditing, setIsEditing] = useState(!journal);
  const [savedDate, setSavedDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [diaryTemplate, setDiaryTemplate] = useState<string | null>(null);

  type PhotoItem = { uri: string; name: string; type: string };
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  // 파일 상단 어딘가에 추가 (helpers)
  const normalizeAssetUri = (uri: string | undefined) => {
  if (!uri) return null;
  if (/^https?:\/\//i.test(uri)) return uri;  // 외부 URL 그대로
  if (/^(ph|content|assets-library|file):\/\//i.test(uri)) return uri; // 로컬
  return `file://${uri}`; // 로컬 경로 처리
};


  const makeJsonBlob = (obj: any) => {
    const json = JSON.stringify(obj);
    try {
      // 최신 RN에서 Blob/File 지원
      // @ts-ignore
      if (typeof File !== "undefined") return new File([json], "form.json", { type: "application/json" });
      return new Blob([json], { type: "application/json" } as any);
    } catch {
      return null as any;
    }
  };

  const isMissingFormPart = (e: any) => {
    const s = e?.response?.status;
    const m = (e?.response?.data?.message || e?.message || "").toString().toLowerCase();
    return s === 400 && (m.includes("missing") || m.includes("form") || m.includes("part"));
  };

  const http = axios.create({ baseURL: BASE_URL });
  http.interceptors.request.use((config) => {
    const isRNFormData = config.data && typeof config.data === "object" && (config.data as any)._parts;
    if (isRNFormData && config.headers) {
      delete (config.headers as any)["Content-Type"];
      delete (config.headers as any)["content-type"];
    }
    return config;
  });

  const logFormParts = (title: string, fd: FormData) => {
    try {
      const parts = (fd as any)._parts;
      console.log("🧩", title);
      if (Array.isArray(parts)) {
        parts.forEach(([key, value]: any, idx: number) => {
          if (value?.uri) {
            console.log(`Part ${idx}: key=${key}, name=${value.name}, type=${value.type}, uri=${value.uri}`);
          } else if (typeof value === "string") {
            console.log(`Part ${idx}: key=${key}, value=${value.slice(0, 120)}`);
          } else {
            console.log(`Part ${idx}: key=${key}, typeof value=${typeof value}`, value);
          }
        });
      } else {
        console.log("(FormData에 파트 없음)");
      }
    } catch (e) {
      console.log("logFormParts 에러", e);
    }
  };

  useEffect(() => {
  if (journal) {
    console.log("📓 journal 전체:", journal);
    console.log("📸 journal.images:", journal.images);

    setTitle(journal.title);
    setContent(journal.preview || "");
    setSavedDate(journal.date || null);

    // images → photos 변환
   const loadedPhotos: PhotoItem[] = (journal.photos || [])
  .map((uri, i) => {
    if (!uri) return null;
    return { uri, name: `image_${i}.jpg`, type: "image/jpeg" };
  })
  .filter((p): p is PhotoItem => p !== null);

setPhotos(loadedPhotos);

  }
}, [journal]);

useEffect(() => {
  const fetchDiaryTemplate = async () => {
    if (!analysisResult) return;

    try {
      const token = await getAccessToken();
      const res = await axios.post(
        `${BASE_URL}/api/crop/diagnosis-to-diary`,
        {
          diagnosisType: analysisResult.header, // 예: "CURRENT_STATUS"
          diagnosisResult: {
            currentStatusSummary: analysisResult.body,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.success && res.data.diaryTemplate) {
        setDiaryTemplate(res.data.diaryTemplate);
      }
    } catch (err) {
      console.log("Diary template fetch error:", err);
    }
  };

  fetchDiaryTemplate();
}, [analysisResult]);


  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height - BOTTOM_OFFSET,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  console.log("title:", title);
  console.log("content:", content);
  console.log("photos:", photos);
  console.log("savedDate:", savedDate);

  const handleComplete = async () => {
  if (isSubmitting) return;
  try {
    setIsSubmitting(true);
    const token = await getAccessToken();

    const payload = { cropId: plantData?.id, title, content };
const fd = new FormData();

// form
fd.append("form", JSON.stringify(payload));

// imageUrls: 기존 일지에서 남길 이미지 경로만
const imageUrls = journal?.images
  ?.filter(img => photos.some(p => normalizeAssetUri(p.uri) !== img.diaryImg)) // 삭제되지 않은 이미지
  .map(img => img.diaryImg) || [];
fd.append("imageUrls", JSON.stringify(imageUrls));

// images: 새로 추가할 사진
photos.forEach((photo, i) => {
  const uri = normalizeAssetUri(photo.uri);
  const alreadyExists = journal?.images?.some(img => img.diaryImg === uri);
  if (!alreadyExists && uri) {
    fd.append("images", {
      uri,
      name: photo.name || `image_${i}.jpg`,
      type: photo.type || "image/jpeg",
    } as any);
  }
});




    logFormParts("📦 FormData 전송 확인", fd);

    let res;
if (journal?.id) {
  res = await http.put(`/api/diary/${journal.id}`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // 꼭 추가
    },
  });
} else {
  res = await http.post("/api/diary/", fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
}


    if (res.status === 201 || res.status === 200) {
      Alert.alert("완료", "일지가 저장되었습니다.");
      navigation.goBack();
    } else {
      Alert.alert("실패", res.data?.message || "일지 저장에 실패했습니다.");
    }
  } catch (error: any) {
    console.log("Diary POST/PUT Error:", error?.response || error);
    Alert.alert("오류", error?.response?.data?.message || "네트워크 오류가 발생했습니다.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: HORIZONTAL_PADDING,
            paddingBottom: BOTTOM_BAR_HEIGHT + 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Arrowicon width={30} height={30} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>{isEditing ? "재배일지 작성" : "재배일지"}</Text>

            {isEditing ? (
              <TouchableOpacity disabled={!isValid || isSubmitting} onPress={handleComplete}>
                <Text
                  style={[
                    styles.headerRightText,
                    { color: isValid && !isSubmitting ? "#7EB85B" : "#A2A2A2" },
                  ]}
                >
                  {isSubmitting ? "저장중..." : "완료"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <DotMenu width={30} height={30} />
              </TouchableOpacity>
            )}
          </View>

          {/* 제목 입력 */}
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력해주세요"
            placeholderTextColor="#A2A2A2"
            value={title}
            onChangeText={setTitle}
            editable={isEditing}
          />

          {/* 가로선 */}
          <View style={styles.separator} />

          {/* 내용 입력 */}
          <TextInput
            style={styles.contentInput}
            placeholder="식물 재배 중 기록하고 싶은 내용을 입력해주세요"
            placeholderTextColor="#A2A2A2"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            editable={isEditing}
          />

          {photos.length > 0 && (
  <ScrollView
    horizontal
    nestedScrollEnabled
    showsHorizontalScrollIndicator={false}
    style={{ height: 120, marginTop: 30 }}
    contentContainerStyle={{ alignItems: "flex-start" }}
  >
    {photos.map((photo, index) => {
      const uri = normalizeAssetUri(photo.uri);
      if (!uri) return null; // 안전하게 null 처리

      return (
        <View key={index} style={{ marginRight: 8, position: 'relative' }}>
          <Image
            source={{ uri }}
            style={{ width: 100, height: 100, borderRadius: 4, backgroundColor: '#eee' }}
            resizeMode="cover"
            // optional: placeholder
          />
          {isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setPhotos(photos.filter((p) => p !== photo))}
            >
              <Image
                source={require("../../assets/icon/x.png")}
                style={styles.deleteIconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      );
    })}
  </ScrollView>
)}


          {(analysisResult || journal?.analysisResult) && (
            <View style={{ marginTop: 30 }}>
              <MethodDescription
                headerText={(analysisResult || journal?.analysisResult)?.header || ''}
                bodyText={(analysisResult || journal?.analysisResult)?.body || ''}
                isVisible={isMethodVisible} 
                headerRight={
                  <BtnToggle
                    value={isMethodVisible} 
                    onValueChange={(val) => setIsMethodVisible(val)} 
                  />
                }
              />
            </View>
          )}

          {!isEditing && savedDate && (
            <Text style={{ color: "#A2A2A2", fontSize: 14 }}>{savedDate}</Text>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>

      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(34,34,34,0.4)', 
            justifyContent: "center", 
            alignItems: "flex-end",   
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
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 }}
              onPress={() => {
                setMenuVisible(false);
                setIsEditing(true);
              }}
            >
              <Text style={{ fontSize: 16 }}>수정</Text>
              <Pen width={24} height={24} />
            </TouchableOpacity>
            
            <View style={{ height: 1, backgroundColor: "#eee" }} />

            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 }}
              onPress={async () => {
                setMenuVisible(false);
                if (!journal) return;

                Alert.alert(
                  "삭제하시겠습니까?",
                  "",
                  [
                    { text: "취소" },
                    {
                      text: "확인",
                      onPress: async () => {
                        try {
                          const token = await getAccessToken();
                          const res = await http.delete(`/api/diary/${journal.id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });

                          if (res.status === 200) {
                            Alert.alert("삭제 완료", res.data.message || "재배일지가 삭제되었습니다.");
                            deleteJournal(journal.id);
                            navigation.navigate("PlantDetail", { plantData });
                          } else {
                            Alert.alert("삭제 실패", res.data?.message || "삭제에 실패했습니다.");
                          }
                        } catch (error: any) {
                          console.log("Diary DELETE Error:", error?.response || error);
                          Alert.alert(
                            "오류",
                            error?.response?.data?.message || "네트워크 오류가 발생했습니다."
                          );
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={{ fontSize: 16 }}>삭제</Text>
              <TrashCan width={24} height={24} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {isEditing && (
        <>
          <Animated.View
            style={[
              styles.bottomBar,
              { position: "absolute", left: 0, right: 0, bottom: keyboardHeight },
            ]}
          >
            <CameraAddPhoto
              selected={photos.map(photo => photo.uri)}
              onSelect={(uris: string[]) => {
                const newPhotos: PhotoItem[] = uris.map((uri, i) => ({
                  uri,
                  name: `image_${i}.jpg`,
                  type: "image/jpeg",
                }));
                setPhotos(newPhotos);
              }}
            />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: keyboardHeight,
              backgroundColor: "#fff",
            }}
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 6, paddingVertical: 12, backgroundColor: "#fff", marginTop:45 },
  backButton: { width: 30, height: 30 },
  headerTitle: { fontSize: 24, fontWeight: "500" },
  headerRightText: { fontSize: 20, fontWeight: "700" },
  titleInput: { fontSize: 20, fontWeight: "700", paddingVertical: 10, color: "#444", paddingTop: 40 },
  separator: { height: 1, backgroundColor: "#D6D6D6", marginVertical: 12 },
  contentInput: { fontSize: 16, fontWeight: "500", paddingTop: 10, paddingBottom: 2, color: "#444", minHeight: 100 },
  deleteButton: { position: "absolute", top: 4, right: 4, width: 16, height: 16, justifyContent: "center", alignItems: "center", zIndex: 10 },
  deleteIconImage: { width: 16, height: 16 },
  bottomBar: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", padding: 12, paddingLeft: 20, borderTopWidth: 1, borderTopColor: "#ddd", backgroundColor: "#fff", marginBottom:30 },
});
